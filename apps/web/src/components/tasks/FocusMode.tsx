import React, { useState, useEffect, useMemo } from "react";
import { IoIosArrowBack, IoMdPlay, IoMdPause, IoMdSquare } from "react-icons/io";
import { FiZap } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface FocusModeProps {
  task: any;
  navigation?: any;
}

const FocusMode = ({ task, navigation }: FocusModeProps) => {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(task ? task.estimatedTime * 60 : 0); // seconds
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!task) {
      if (navigation?.goBack) {
        navigation.goBack();
      } else {
        router.back();
      }
    }
  }, [task, navigation, router]);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && !isPaused && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startFocus = () => {
    setIsActive(true);
    setIsPaused(false);
  };
  const pauseFocus = () => setIsPaused(true);
  const resumeFocus = () => setIsPaused(false);
  const stopFocus = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(task.estimatedTime * 60);
  };
  const progress = (((task?.estimatedTime * 60) - timeLeft) / (task?.estimatedTime * 60)) * 100;

  if (!task) return null;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-6 py-6 bg-white border-b border-gray-100">
        <button
          onClick={() => {
            if (navigation?.goBack) {
              navigation.goBack();
            } else {
              router.back();
            }
          }}
          className="p-2"
        >
          <IoIosArrowBack size={24} color="#6366F1" />
        </button>
        <span className="text-lg font-semibold text-gray-900">Focus Mode</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Task Info */}
      <div className="bg-white rounded-2xl shadow-md mt-8 mb-4 px-6 py-5 w-full max-w-md">
        <div className="flex items-center mb-3">
          <span className="w-2 h-2 rounded-full mr-2" style={{ background: getPriorityColor(task.priority) }} />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{task.priority}</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{task.title}</div>
        {task.description && (
          <div className="text-base text-gray-500 leading-snug">{task.description}</div>
        )}
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center my-10">
        <div className="relative flex flex-col items-center justify-center w-52 h-52 rounded-full bg-white shadow-lg">
          <span className="text-5xl font-bold text-gray-900 mb-2">{formatTime(timeLeft)}</span>
          <span className="text-base text-gray-400">{isActive ? (isPaused ? "Paused" : "Focusing...") : "Ready to focus"}</span>
          {/* Progress Bar (horizontal) */}
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-200 rounded-b-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center mb-10">
        {!isActive ? (
          <button className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow font-semibold text-lg transition" onClick={startFocus}>
            <IoMdPlay size={24} color="#fff" />
            <span className="ml-3">Start Focus</span>
          </button>
        ) : (
          <div className="flex flex-row gap-4">
            {isPaused ? (
              <button className="flex items-center bg-indigo-50 px-6 py-3 rounded-lg" onClick={resumeFocus}>
                <IoMdPlay size={24} color="#6366F1" />
                <span className="ml-2 text-indigo-600 font-semibold">Resume</span>
              </button>
            ) : (
              <button className="flex items-center bg-yellow-50 px-6 py-3 rounded-lg" onClick={pauseFocus}>
                <IoMdPause size={24} color="#F59E0B" />
                <span className="ml-2 text-yellow-500 font-semibold">Pause</span>
              </button>
            )}
            <button className="flex items-center bg-red-50 px-6 py-3 rounded-lg" onClick={stopFocus}>
              <IoMdSquare size={24} color="#EF4444" />
              <span className="ml-2 text-red-500 font-semibold">Stop</span>
            </button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="flex items-center bg-white px-6 py-4 rounded-xl shadow w-full max-w-md mb-10">
        <FiZap size={20} color="#6366F1" />
        <span className="ml-3 text-gray-500 text-base">
          {isActive
            ? "Stay focused on this task. You can do it!"
            : "Find a quiet place and eliminate distractions to maximize your focus."}
        </span>
      </div>
    </div>
  );
};

function getPriorityColor(priority: string) {
  switch (priority) {
    case "High": return "#EF4444";
    case "Medium": return "#F59E0B";
    case "Low": return "#10B981";
    default: return "#6B7280";
  }
}

export default FocusMode; 






