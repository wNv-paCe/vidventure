"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/app/_utils/auth-context";

export default function MessageSummaryItem({ summary }) {
  const router = useRouter();
  const { userType } = useUserAuth();

  const handleClick = () => {
    const basePath =
      userType === "videographer"
        ? "/videographer/messages"
        : "/client/messages";

    if (!summary?.id) {
      console.error("No receiver ID found in summary.");
      return;
    }

    router.push(`${basePath}?receiverId=${encodeURIComponent(summary.id)}`);
  };

  return (
    <div
      className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer flex justify-between items-center"
      onClick={handleClick}
    >
      <div>
        <h2 className="text-lg font-bold">
          {summary.receiverName || "Unknown"}
        </h2>
        <p className="text-sm text-gray-600">
          <strong>Title: </strong>
          {summary.title || "No title provided."}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Last Message: </strong>
          {summary.lastMessage || "No messages yet."}
        </p>
      </div>
      <p className="text-xs text-gray-400 text-right">
        {summary.lastMessageDate
          ? new Date(summary.lastMessageDate).toLocaleString()
          : "No date available"}
      </p>
    </div>
  );
}
