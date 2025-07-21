"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Button } from "../common/button";
import { X, Save, Clock, Tag, FileText, Calendar, Plus } from "lucide-react";
import clsx from "clsx";

interface EditTaskProps {
  taskId: Id<"tasks">;
  initialData: {
    title: string;
    description?: string;
    category: string;
    priority: string;
    estimatedTime?: number;
    dueDate?: string;
    dueDateTime?: string;
    tags: string[];
    status?: string;
  };
  onClose: () => void;
  onSave: () => void;
}

const priorities = ["High", "Medium", "Low"];

export default function EditTask({ taskId, initialData, onClose, onSave }: EditTaskProps) {
  const updateTask = useMutation(api.tasks.updateTask);
  const addCategory = useMutation(api.tasks.addCategory);
  const categories = useQuery(api.tasks.getCategories) || ["Work", "Errands", "Self-care", "Urgent", "Other"];
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description || "",
    category: initialData.category,
    priority: initialData.priority,
    estimatedTime: initialData.estimatedTime || 30,
    dueDate: initialData.dueDate || "",
    dueDateTime: initialData.dueDateTime || "",
    tags: initialData.tags,
  });

  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const [isCompleted, setIsCompleted] = useState(initialData.status === "Completed");

  useEffect(() => {
    setIsCompleted(initialData.status === "Completed");
  }, [initialData.status]);

  const handleStatusToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsCompleted(checked);
    try {
      await updateTaskStatus({ taskId, status: checked ? "Completed" : "Pending" });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const [newTag, setNewTag] = useState("");

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateTask({
        taskId,
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        priority: formData.priority,
        estimatedTime: formData.estimatedTime || undefined,
        dueDate: formData.dueDate || undefined,
        dueDateTime: formData.dueDateTime || undefined,
        tags: formData.tags,
        status: formData.status,
      });
      onSave();
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

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

  const handleCategoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Complete/Incomplete toggle */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              checked={isCompleted}
              onChange={handleStatusToggle}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="status" className="text-gray-700 text-base select-none">
              Mark as completed
            </label>
          </div>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a description..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex gap-2">
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {!showAddCategory ? (
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  title="Add new category"
                >
                  <Plus size={16} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={handleCategoryKeyPress}
                    placeholder="New category"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={!newCategory.trim()}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategory("");
                    }}
                    className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <div className="relative flex items-center">
              <button
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.dueDate ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-300 bg-gray-50 text-gray-400'}`}
                onClick={() => document.getElementById('edit-task-date-input')?.click()}
              >
                <span>{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Select date'}</span>
                {formData.dueDate && (
                  <span
                    className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer"
                    onClick={e => { e.stopPropagation(); handleInputChange('dueDate', ''); handleInputChange('dueDateTime', ''); }}
                    title="Clear date"
                  >
                    <X size={16} />
                  </span>
                )}
              </button>
              <input
                id="edit-task-date-input"
                type="date"
                value={formData.dueDate}
                onChange={e => handleInputChange('dueDate', e.target.value)}
                className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Due Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Time
            </label>
            <div className="relative flex items-center">
              <button
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.dueDateTime ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-300 bg-gray-50 text-gray-400'}`}
                onClick={() => document.getElementById('edit-task-time-input')?.click()}
                disabled={!formData.dueDate}
                title={formData.dueDate ? '' : 'Select a date first'}
              >
                <span>{formData.dueDateTime ? formData.dueDateTime.split('T')[1]?.substring(0, 5) : 'Select time'}</span>
                {formData.dueDateTime && (
                  <span
                    className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer"
                    onClick={e => { e.stopPropagation(); handleInputChange('dueDateTime', ''); }}
                    title="Clear time"
                  >
                    <X size={16} />
                  </span>
                )}
              </button>
              <input
                id="edit-task-time-input"
                type="time"
                value={formData.dueDateTime ? formData.dueDateTime.split('T')[1]?.substring(0, 5) : ''}
                onChange={e => {
                  const date = formData.dueDate || new Date().toISOString().split('T')[0];
                  const time = e.target.value;
                  const dateTime = `${date}T${time}:00`;
                  handleInputChange('dueDateTime', dateTime);
                }}
                className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                tabIndex={-1}
                disabled={!formData.dueDate}
              />
            </div>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              value={formData.estimatedTime}
              onChange={(e) => handleInputChange("estimatedTime", parseInt(e.target.value) || 0)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className={clsx(
                    "inline-flex items-center rounded-full text-sm font-medium transition-colors",
                    "px-3 py-1",
                    formData.tags.includes(tag)
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-800"
                  )}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className={clsx(
                      "ml-1 flex items-center justify-center rounded-full focus:outline-none",
                      formData.tags.includes(tag)
                        ? "bg-blue-500 hover:bg-blue-700"
                        : "bg-blue-200 hover:bg-blue-300"
                    )}
                    style={{ width: 18, height: 18 }}
                  >
                    <X size={12} className={formData.tags.includes(tag) ? "text-white" : "text-gray-500"} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-4 py-2"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 
 
 