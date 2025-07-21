"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import FocusMode from "@/components/tasks/FocusMode";
import React, { Suspense } from "react";

function FocusPageInner() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const task = useQuery(api.tasks.getTask, taskId ? { taskId: taskId as any } : "skip");

  if (task === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    );
  }
  if (task === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-lg text-gray-500">Task Not Found</span>
      </div>
    );
  }

  return <FocusMode task={task} />;
}

export default function FocusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><span className="text-lg text-gray-500">Loading...</span></div>}>
      <FocusPageInner />
    </Suspense>
  );
} 