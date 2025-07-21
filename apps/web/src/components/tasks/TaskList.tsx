"use client";

import { useState } from "react";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { CheckCircleIcon, XMarkIcon, ClockIcon, PencilIcon } from "@heroicons/react/24/outline";
import { FiClock, FiX } from "react-icons/fi";
import EditTask from "./EditTask";

interface Task {
  _id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  estimatedTime?: number;
  dueDate?: string;
  dueDateTime?: string;
  tags: string[];
  createdAt: number;
  isProcessing?: boolean;
}

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-600 bg-red-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Urgent": return "bg-red-500";
      case "Work": return "bg-blue-500";
      case "Errands": return "bg-green-500";
      case "Self-care": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({ taskId: taskId as any, status: newStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask({ taskId: taskId as any });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-300 mb-4">
          <CheckCircleIcon className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No tasks yet</h3>
        <p className="text-gray-500 text-sm">Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task._id}
          className={`bg-white rounded-2xl shadow-sm border p-5 transition-all ${
            task.status === "Completed" ? "opacity-75" : ""
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 mr-3">
              <h3 className={`text-base font-semibold mb-2 ${
                task.status === "Completed" ? "line-through text-gray-500" : "text-gray-900"
              }`}>
                {task.title}
              </h3>
              {task.isProcessing ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                  Processing...
                </span>
              ) : (
                <span className={`px-2 py-1 rounded-lg text-xs font-medium text-white ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!task.isProcessing && (
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  title="Edit task"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
              {!task.isProcessing && task.status !== "Completed" && (
                <>
                  <button
                    onClick={() => {
                      window.location.href = `/focus?taskId=${task._id}`;
                    }}
                    className="flex items-center justify-center p-1 m-0 bg-transparent rounded-full w-auto h-auto transition-colors focus:outline-none hover:bg-gray-100"
                    title="Start Focus"
                  >
                    <FiClock size={18} color="#6366F1" />
                  </button>
                  <button
                    onClick={() => handleStatusChange(task._id, "Completed")}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Mark as completed"
                  >
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  </button>
                </>
              )}
              {!task.isProcessing && (
                <button
                  onClick={() => handleDelete(task._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete task"
                >
                  <XMarkIcon className="h-6 w-6 text-red-500" />
                </button>
              )}
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{task.description}</p>
          )}
          
          <div className="flex items-center flex-wrap gap-2">
            {task.isProcessing ? (
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3 animate-pulse" />
                <span className="text-xs text-gray-500 animate-pulse">Processing...</span>
              </div>
            ) : (
              <>
                {task.category && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium">
                    {task.category}
                  </span>
                )}
                {task.estimatedTime && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                    <ClockIcon className="h-3 w-3" />
                    <span>{task.estimatedTime}m</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg">
                    <ClockIcon className="h-3 w-3" />
                    <span>
                      Due: {task.dueDateTime 
                        ? new Date(task.dueDateTime).toLocaleString() 
                        : new Date(task.dueDate).toLocaleDateString()
                      }
                    </span>
                  </div>
                )}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    {task.tags.slice(0, 2).map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
      
      {editingTask && (
        <EditTask
          taskId={editingTask._id as any}
          initialData={{
            title: editingTask.title,
            description: editingTask.description,
            category: editingTask.category,
            priority: editingTask.priority,
            estimatedTime: editingTask.estimatedTime,
            dueDate: editingTask.dueDate || "",
            dueDateTime: editingTask.dueDateTime || "",
            tags: editingTask.tags,
            status: editingTask.status,
          }}
          onClose={() => setEditingTask(null)}
          onSave={() => setEditingTask(null)}
        />
      )}
    </div>
  );
} 