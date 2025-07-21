"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import Header from "@/components/Header";
import TaskList from "@/components/tasks/TaskList";

export default function TasksPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const [taskInput, setTaskInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedDueDateFilter, setSelectedDueDateFilter] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  
  const tasks = useQuery(api.tasks.getTasks, { 
    category: selectedCategory || undefined,
    dueDateFilter: selectedDueDateFilter || undefined
  });
  const focusTask = useQuery(api.tasks.getFocusTask);
  const createTask = useMutation(api.tasks.createTask);
  const deleteCategory = useMutation(api.tasks.deleteCategory);
  const updateTask = useMutation(api.tasks.updateTask);

  const handleCreateTask = async () => {
    if (!taskInput.trim()) return;
    
    setIsCreating(true);
    try {
      await createTask({ userInput: taskInput.trim() });
      setTaskInput("");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 500);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || task.category === selectedCategory;
    const matchesTag = !selectedTag || (task.tags && task.tags.includes(selectedTag));
    
    return matchesSearch && matchesCategory && matchesTag;
  }) || [];

  const addCategory = useMutation(api.tasks.addCategory);
  const categories = useQuery(api.tasks.getCategories) || ["Work", "Errands", "Self-care", "Urgent", "Other"];
  const [tags, setTags] = useState(["Important", "Quick", "Meeting", "Deadline", "Personal"]);

  const handleAddCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      try {
        await addCategory({ name: newCategory.trim() });
        setNewCategory("");
        setShowAddCategory(false);
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };

  const handleDeleteCategory = async (categoryToDelete: string) => {
    try {
      await deleteCategory({ name: categoryToDelete });
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory("");
      }
      // Optionally, you can refetch categories or filter them out locally if needed
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setShowAddTag(false);
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
    if (selectedTag === tagToDelete) {
      setSelectedTag("");
    }
    // Remove tag from all tasks in the database
    if (tasks) {
      for (const task of tasks) {
        if (task.tags && task.tags.includes(tagToDelete)) {
          try {
            await updateTask({
              taskId: task._id,
              title: task.title,
              description: task.description || "",
              category: task.category,
              priority: task.priority,
              estimatedTime: task.estimatedTime || 30,
              dueDate: task.dueDate || undefined,
              dueDateTime: task.dueDateTime || undefined,
              tags: task.tags.filter((t: string) => t !== tagToDelete),
            });
          } catch (error) {
            console.error(`Error removing tag from task ${task._id}:`, error);
          }
        }
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to access your tasks
          </h1>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out animate-fade-in">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Task Added!
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tasks
              </h1>
            </div>
            
            <button
              onClick={() => {
                if (focusTask === undefined) {
                  alert('Loading, please wait while we load your tasks...');
                  return;
                }
                if (focusTask) {
                  window.location.href = `/focus?taskId=${focusTask._id}`;
                } else {
                  alert('No pending tasks available for focus mode. Create a task first!');
                }
              }}
              className={`relative px-5 py-2 bg-white border border-blue-100 rounded-lg font-medium text-blue-600 transition-colors shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                focusTask ? "cursor-pointer" : "text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
              disabled={!focusTask}
            >
              <span className="text-base font-medium">Focus Mode</span>
              {focusTask && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white px-5 pb-5 mb-6">
            <button
              onClick={() => setActiveTab(0)}
              className={`flex-1 py-3 px-4 mx-1 rounded-xl font-semibold text-sm transition-colors ${
                activeTab === 0
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Create Task
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`flex-1 py-3 px-4 mx-1 rounded-xl font-semibold text-sm transition-colors ${
                activeTab === 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              My Tasks ({filteredTasks.length})
            </button>
          </div>

          {activeTab === 0 ? (
            /* Create Task Tab */
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What do you need to do?"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  rows={4}
                />
                <button
                  onClick={handleCreateTask}
                  disabled={!taskInput.trim() || isCreating}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    !taskInput.trim() || isCreating
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isCreating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </div>
          ) : (
            /* Tasks List Tab */
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex items-center bg-white rounded-lg shadow-sm border p-4">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-gray-900 placeholder-gray-500 focus:outline-none"
                />
              </div>

              {/* Filter Chips */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Categories:</h3>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <button
                          onClick={() => setSelectedCategory(selectedCategory === category ? "" : category)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          {category}
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="ml-1 p-1 text-red-500 hover:text-red-700 transition-colors"
                          title="Delete category"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {showAddCategory ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="New category"
                          className="px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                          autoFocus
                        />
                        <button
                          onClick={handleAddCategory}
                          className="px-3 py-2 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategory("");
                          }}
                          className="px-3 py-2 bg-gray-500 text-white rounded-full text-sm hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddCategory(true)}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 border-dashed flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Category
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Tags:</h3>
                  <div className="flex gap-2 flex-wrap">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center">
                        <button
                          onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedTag === tag
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          {tag}
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag)}
                          className="ml-1 p-1 text-red-500 hover:text-red-700 transition-colors"
                          title="Delete tag"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {showAddTag ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="New tag"
                          className="px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          autoFocus
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-3 py-2 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddTag(false);
                            setNewTag("");
                          }}
                          className="px-3 py-2 bg-gray-500 text-white rounded-full text-sm hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddTag(true)}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 border-dashed flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Tag
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Due Date:</h3>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: "overdue", label: "Overdue" },
                      { value: "today", label: "Today" },
                      { value: "tomorrow", label: "Tomorrow" },
                      { value: "this-week", label: "This Week" },
                      { value: "next-week", label: "Next Week" },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setSelectedDueDateFilter(selectedDueDateFilter === filter.value ? "" : filter.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedDueDateFilter === filter.value
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Task List */}
              <TaskList tasks={filteredTasks} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 