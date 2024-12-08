"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import MessageItem from "./message-item";

export default function MessageList({ receiverId, userId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("receiverId:", receiverId, "userId:", userId);
    if (!receiverId || !userId) return;

    // Firestore query to fetch messages for the selected chat
    const messagesRef = collection(
      db,
      "users",
      userId,
      "messages",
      receiverId,
      "chats"
    );
    const q = query(messagesRef, orderBy("date", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [receiverId, userId]);

  if (loading) {
    return <p>Loading messages...</p>;
  }

  if (!messages.length) {
    return <p>No messages yet.</p>;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} userId={userId} />
      ))}
    </div>
  );
}
