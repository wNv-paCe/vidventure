"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import MessageSummaryItem from "./message-summary-item";

export default function MessageSummaryList({ userId, onSelectChat }) {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const summaryRef = collection(db, "users", userId, "messages");
    const unsubscribe = onSnapshot(summaryRef, (snapshot) => {
      const fetchedSummaries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSummaries(fetchedSummaries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return <p>Loading message summaries...</p>;
  }

  if (!summaries.length) {
    return <p>No messages to display.</p>;
  }

  return (
    <div className="space-y-4">
      {summaries.map((summary) => (
        <MessageSummaryItem
          key={summary.id}
          summary={{
            id: summary.id,
            receiverName: summary.receiverName || "Unknown",
            title: summary.title || "No title provided.",
            lastMessage: summary.lastMessage || "No messages yet.",
            lastMessageDate: summary.lastMessageDate || null,
          }}
          onClick={() => onSelectChat(summary.id)}
        />
      ))}
    </div>
  );
}
