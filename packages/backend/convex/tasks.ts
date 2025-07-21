import type { Auth } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query, action, internalMutation, internalAction } from "./_generated/server";
import OpenAI from "openai";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Simple date extraction function that works without AI
const extractDateFromText = (text: string): { dueDate?: string; dueDateTime?: string } => {
  const lowerText = text.toLowerCase();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Extract time patterns
  const timePatterns = [
    { pattern: /(\d{1,2}):(\d{2})\s*(am|pm)/i, format: (match: RegExpMatchArray) => {
      let hour = parseInt(match[1]);
      const minute = match[2];
      const ampm = match[3].toLowerCase();
      if (ampm === 'pm' && hour !== 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, '0')}:${minute}:00`;
    }},
    { pattern: /(\d{1,2})\s*(am|pm)/i, format: (match: RegExpMatchArray) => {
      let hour = parseInt(match[1]);
      const ampm = match[2].toLowerCase();
      if (ampm === 'pm' && hour !== 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, '0')}:00:00`;
    }},
    { pattern: /noon/i, format: () => '12:00:00' },
    { pattern: /midnight/i, format: () => '00:00:00' }
  ];

  let extractedTime: string | undefined;
  for (const { pattern, format } of timePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      extractedTime = format(match);
      break;
    }
  }

  // Extract date patterns
  if (lowerText.includes('tomorrow')) {
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return {
      dueDate: tomorrowStr,
      dueDateTime: extractedTime ? `${tomorrowStr}T${extractedTime}` : undefined
    };
  }
  
  if (lowerText.includes('today')) {
    const todayStr = today.toISOString().split('T')[0];
    return {
      dueDate: todayStr,
      dueDateTime: extractedTime ? `${todayStr}T${extractedTime}` : undefined
    };
  }

  // If only time is found, use today's date
  if (extractedTime) {
    const todayStr = today.toISOString().split('T')[0];
    return {
      dueDateTime: `${todayStr}T${extractedTime}`
    };
  }

  return {};
};



export const processTaskWithAI = internalAction({
  args: {
    taskId: v.id("tasks"),
    userInput: v.string(),
  },
  handler: async (ctx, { taskId, userInput }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY");
      return;
    }

    const openai = new OpenAI({ apiKey });
    
    // Get current date for relative date calculations
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const prompt = `Analyze this task input and return a JSON object with the following structure:
    {
      "title": "Clean, concise task title",
      "description": "Optional detailed description",
      "category": "Work|Errands|Self-care|Urgent|Other",
      "priority": "High|Medium|Low", 
      "estimatedTime": number_in_minutes,
      "dueDate": "YYYY-MM-DD" or null,
      "dueDateTime": "YYYY-MM-DDTHH:MM:SS" or null,
      "tags": []
    }

    Current date: ${currentDateString}
    Task input: "${userInput}"

    Rules:
    - Use your best judgement for all categories and tags
    - Make sure that any tags are ACTUALLY RELEVANT TO THE TASK
    - Be very careful with phone-call tags - only add if the task explicitly mentions making a phone call
    - "Buy" or "purchase" tasks should NOT get phone-call tags unless they specifically mention calling someone
    - Only add the tag "5-min-task" if the task is actually 5 minutes or less
    - If task mentions "urgent", "asap", "deadline", "due", "need to" → category = "Urgent", priority = "High"
    - If task mentions "pick up", "dry cleaning", "grocery", "shopping", "errand", "laundry" → category = "Errands"
    - If task mentions "work", "project", "meeting", "presentation", "office" → category = "Work"
    - If task mentions "exercise", "walk", "gym", "workout", "yoga" → category = "Self-care"
    - If task mentions "5 min", "quick", "fast" → add "#5-min-task" tag
    - If task mentions "call", "phone", "dial", "ring" → add "#phone-call" tag
    - If task mentions "email", "message" → add "#email" tag
    - If task mentions "meeting", "appointment" → add "#meeting" tag
    - If task mentions "exercise", "walk", "gym" → add "#physical" tag
    - If task mentions "read", "study", "learn" → add "#school" tag
    - If task mentions "buy", "purchase", "shop", "grocery" → add "#shopping" tag
    - If task mentions "creative", "design", "write" → add "#creative" tag
    - If task mentions "break", "rest" → add "#break" tag
    - If task mentions "focus", "concentrate" → add "#focus" tag
    - If task doesn't mention any of these, add whatever tag is relevant to the task
    - And, if the task doesn't seem to fit into any of the categories, make "Other" the category

    Due Date and Time extraction (using current date: ${currentDateString}):
    - Look for date mentions like "tomorrow", "next week", "Friday", "by Monday", "due on 15th", "end of month"
    - Look for time mentions like "at 3pm", "by 2:30", "before noon", "after 5pm", "9am", "midnight"
    - Convert relative dates to YYYY-MM-DD format based on the current date:
      * "tomorrow" → ${new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
      * "next Monday" or "next mon" → calculate next Monday from ${currentDateString}
      * "Friday" or "fri" or "friday" → calculate next Friday from ${currentDateString}
      * "by the 15th" → 15th of current/next month from ${currentDateString}
      * "end of month" → last day of current month from ${currentDateString}
    - Convert times to 24-hour format:
      * "3pm" → "15:00"
      * "2:30pm" → "14:30"
      * "9am" → "09:00"
      * "noon" → "12:00"
      * "midnight" → "00:00"
    - If both date and time are mentioned, set dueDateTime to "YYYY-MM-DDTHH:MM:SS"
    - If only date is mentioned, set dueDate to "YYYY-MM-DD" and dueDateTime to null
    - If only time is mentioned, set dueDateTime to today's date with the specified time
    - If no date or time is mentioned, set both dueDate and dueDateTime to null
    - Only extract dates/times that are clearly due dates/times, not just mentioned dates/times
    - Use the current date (${currentDateString}) as the reference point for all relative date calculations

    Time estimation:
    - Extract time from input (e.g., "30 min", "1 hour", "2 hours", "15 minutes")
    - If no time mentioned, estimate based on task type:
      * Dry cleaning pickup: 15 minutes
      * Quick errands: 30 minutes
      * Work tasks: 60 minutes
      * Exercise: 45 minutes
    - Convert all times to minutes (1 hour = 60 minutes)

    Priority logic:
    - "urgent", "asap", "deadline", "due", "need to" → High
    - "important", "critical" → High
    - Errands and personal tasks → Medium
    - Work tasks → Medium
    - Self-care tasks → Low

    Examples (using current date: ${currentDateString}):
    - "urgent need to pick up dry cleaning tomorrow at 3pm" → category: "Urgent", priority: "High", estimatedTime: 15, dueDate: "${new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}", dueDateTime: "${new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T15:00:00"
    - "call mom in 30 minutes" → category: "Errands", priority: "Medium", estimatedTime: 30, dueDate: null, dueDateTime: null, tags: ["#phone-call"]
    - "finish presentation by Friday 2pm" → category: "Work", priority: "Medium", estimatedTime: 120, dueDate: calculate next Friday from ${currentDateString}, dueDateTime: calculate next Friday from ${currentDateString}T14:00:00
    - "buy dog food" → category: "Errands", priority: "Medium", estimatedTime: 30, dueDate: null, dueDateTime: null, tags: ["#shopping"]
    - "meeting at 9am tomorrow" → category: "Work", priority: "Medium", estimatedTime: 60, dueDate: "${new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}", dueDateTime: "${new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T09:00:00", tags: ["#meeting"]

    Return only valid JSON:`;

    let processedData: {
      title: string;
      description: string;
      category: string;
      priority: string;
      estimatedTime: number;
      dueDate?: string;
      dueDateTime?: string;
      tags: string[];
    } = {
      title: userInput,
      description: "",
      category: "Work",
      priority: "Medium",
      estimatedTime: 30,
      dueDate: undefined,
      dueDateTime: undefined,
      tags: [],
    };

    try {
      const output = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant designed to output JSON in this format: {title: string, description?: string, category: string, priority: string, estimatedTime: number, dueDate?: string, dueDateTime?: string, tags: string[]}. Always return valid JSON. The current date is ${currentDateString} - use this as the reference point for calculating relative dates like "tomorrow", "next week", etc.`,
          },
          { role: "user", content: prompt },
        ],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const messageContent = output.choices[0]?.message.content;
      if (messageContent) {
        const parsedOutput = JSON.parse(messageContent);
        processedData = {
          title: parsedOutput.title || userInput,
          description: parsedOutput.description || "",
          category: parsedOutput.category || "Work",
          priority: parsedOutput.priority || "Medium",
          estimatedTime: typeof parsedOutput.estimatedTime === 'number' ? parsedOutput.estimatedTime : 30,
          dueDate: parsedOutput.dueDate || undefined,
          dueDateTime: parsedOutput.dueDateTime || undefined,
          tags: Array.isArray(parsedOutput.tags) ? parsedOutput.tags : [],
        };
      }
    } catch (error) {
      console.error("Error processing task with AI:", error);
      // Use fallback data with basic date extraction
      const extractedDates = extractDateFromText(userInput);
      processedData = {
        title: userInput,
        description: "",
        category: "Work", // Default category
        priority: "Medium", // Default priority
        estimatedTime: 30, // Default time
        dueDate: extractedDates.dueDate ? extractedDates.dueDate : undefined,
        dueDateTime: extractedDates.dueDateTime ? extractedDates.dueDateTime : undefined,
        tags: [], // No tags without AI
      };
    }

    // Update the task with AI-processed data
    await ctx.runMutation(internal.tasks.updateTaskWithAI, {
      taskId,
      title: processedData.title,
      description: processedData.description,
      category: processedData.category,
      priority: processedData.priority,
      estimatedTime: processedData.estimatedTime,
      dueDate: processedData.dueDate,
      dueDateTime: processedData.dueDateTime,
      tags: processedData.tags,
    });
  },
});

export const updateTaskWithAI = internalMutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    priority: v.string(),
    estimatedTime: v.number(),
    dueDate: v.optional(v.string()),
    dueDateTime: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if the task still exists before updating
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      console.log("Task was deleted before AI processing could complete");
      return; // Task was deleted, don't try to update it
    }

    await ctx.db.patch(args.taskId, {
      title: args.title,
      description: args.description,
      category: args.category,
      priority: args.priority,
      estimatedTime: args.estimatedTime,
      dueDate: args.dueDate,
      dueDateTime: args.dueDateTime,
      tags: args.tags,
      isProcessing: false, // Mark as no longer processing
    });
  },
});

export const createTask = mutation({
  args: {
    userInput: v.string(),
  },
  handler: async (ctx, { userInput }) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Create initial task with processing state
    const taskId = await ctx.db.insert("tasks", {
      userId,
      title: userInput, // Will be updated by AI
      description: "",
      category: "Work", // Default, will be updated by AI
      priority: "Medium", // Default, will be updated by AI
      status: "Pending",
      estimatedTime: 30, // Default, will be updated by AI
      dueDate: undefined, // Will be updated by AI
      dueDateTime: undefined, // Will be updated by AI
      tags: [],
      createdAt: Date.now(),
      isProcessing: true, // Mark as processing while AI works on it
    });

    // Process with AI and update the task
    await ctx.scheduler.runAfter(0, internal.tasks.processTaskWithAI, {
      taskId,
      userInput,
    });

    return taskId;
  },
});

export const getTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { taskId }) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return null;
    }

    const task = await ctx.db.get(taskId);
    if (!task || task.userId !== userId) {
      return null;
    }

    return task;
  },
});

export const getTasks = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    dueDateFilter: v.optional(v.string()), // "overdue", "today", "tomorrow", "this-week", "next-week"
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { status, category, dueDateFilter, userId }) => {
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      effectiveUserId = await getUserId(ctx);
    }
    if (!effectiveUserId) {
      return [];
    }

    let query = ctx.db.query("tasks").filter((q) => q.eq(q.field("userId"), effectiveUserId));

    if (status) {
      query = query.filter((q) => q.eq(q.field("status"), status));
    }

    if (category) {
      query = query.filter((q) => q.eq(q.field("category"), category));
    }

    const tasks = await query.order("desc").collect();

    // Apply due date filtering
    if (dueDateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      return tasks.filter(task => {
        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        switch (dueDateFilter) {
          case "overdue":
            return dueDate < today;
          case "today":
            return dueDate.getTime() === today.getTime();
          case "tomorrow":
            return dueDate.getTime() === tomorrow.getTime();
          case "this-week":
            return dueDate >= today && dueDate <= endOfWeek;
          case "next-week":
            const nextWeekStart = new Date(today);
            nextWeekStart.setDate(nextWeekStart.getDate() + 7);
            const nextWeekEnd = new Date(today);
            nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);
            return dueDate >= nextWeekStart && dueDate <= nextWeekEnd;
          default:
            return true;
        }
      });
    }

    return tasks;
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    priority: v.string(),
    estimatedTime: v.optional(v.number()),
    dueDate: v.optional(v.string()),
    dueDateTime: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(args.taskId, {
      title: args.title,
      description: args.description,
      category: args.category,
      priority: args.priority,
      estimatedTime: args.estimatedTime,
      dueDate: args.dueDate,
      dueDateTime: args.dueDateTime,
      tags: args.tags,
    });
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.string(),
  },
  handler: async (ctx, { taskId, status }) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(taskId, {
      status,
      completedAt: status === "Completed" ? Date.now() : undefined,
    });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { taskId }) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    await ctx.db.delete(taskId);
  },
});

export const getFocusTask = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get the highest priority pending task
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("status"), "Pending"))
      .order("desc")
      .collect();

    if (tasks.length === 0) {
      return null;
    }

    // Sort by priority and return the first one
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    const sortedTasks = tasks.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
      return bPriority - aPriority;
    });

    return sortedTasks[0];
  },
});

// Category management functions
export const getCategories = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return [];
    }

    const userCategories = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("asc")
      .collect();

    // Return default categories + user categories
    const defaultCategories = ["Work", "Errands", "Self-care", "Urgent", "Other"];
    const userCategoryNames = userCategories.map(cat => cat.name);
    
    return [...defaultCategories, ...userCategoryNames];
  },
});

export const addCategory = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if category already exists for this user
    const existingCategory = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("name"), name))
      .first();

    if (existingCategory) {
      throw new Error("Category already exists");
    }

    await ctx.db.insert("categories", {
      userId,
      name: name.trim(),
      createdAt: Date.now(),
    });
  },
});

export const deleteCategory = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const category = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("name"), name))
      .first();

    if (category) {
      await ctx.db.delete(category._id);
    }
  },
});