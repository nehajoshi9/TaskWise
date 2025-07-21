import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(), // "Work", "Errands", "Self-care", "Urgent"
    priority: v.string(), // "High", "Medium", "Low"
    status: v.string(), // "Pending", "In Progress", "Completed"
    estimatedTime: v.optional(v.number()), // in minutes
    dueDate: v.optional(v.string()), // YYYY-MM-DD format
    dueDateTime: v.optional(v.string()), // ISO string with date and time
    tags: v.array(v.string()), // ["#urgent", "#5-min-task", etc.]
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    isProcessing: v.optional(v.boolean()), // true while AI is processing
  }),
  categories: defineTable({
    userId: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }),
});
