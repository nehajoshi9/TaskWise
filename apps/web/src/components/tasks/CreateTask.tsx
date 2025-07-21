"use client";

import { useState } from "react";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation } from "convex/react";

interface CreateTaskProps {
  onCreateTask: ReturnType<typeof useMutation<typeof api.tasks.createTask>>;
}

export default function CreateTask({ onCreateTask }: CreateTaskProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      await onCreateTask({ userInput: input.trim() });
      setInput("");
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Add a New Task
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-input" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your task in natural language
          </label>
          <textarea
            id="task-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'Call mom tomorrow morning - urgent', 'Quick 5 min walk around the block', 'Finish the presentation by Friday'"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-2">
            AI will automatically categorize, prioritize, and tag your task based on your description.
          </p>
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Add Task"}
        </button>
      </form>
    </div>
  );
} 
 
 