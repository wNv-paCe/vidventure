"use client";

import React, { useState } from "react";
import { db } from "@/app/_utils/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

export default function MessageSender({ userId, receiverId, onMessageSent }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const senderMessageData = {
      from: userId,
      to: receiverId,
      content: message.trim(),
      date: new Date().toISOString(),
      read: true,
    };

    const receiverMessageData = {
      ...senderMessageData,
      read: false,
    };

    console.log("User ID:", userId);
    console.log("Receiver ID:", receiverId);
    console.log("Message Content:", message.trim());

    try {
      setLoading(true);
      setError(""); // Clear previous errors

      // Write message to sender's collection
      const senderMessagesRef = collection(
        db,
        "users",
        userId,
        "messages",
        receiverId,
        "chats"
      );
      await addDoc(senderMessagesRef, senderMessageData);

      // Write message to receiver's collection
      const receiverMessagesRef = collection(
        db,
        "users",
        receiverId,
        "messages",
        userId,
        "chats"
      );
      await addDoc(receiverMessagesRef, receiverMessageData);

      // Update summary for the current user
      const userSummaryRef = doc(db, "users", userId, "messages", receiverId);
      await updateDoc(userSummaryRef, {
        lastMessage: message,
        lastMessageDate: new Date().toISOString(),
      });

      // Update summary for the receiver
      const receiverSummaryRef = doc(
        db,
        "users",
        receiverId,
        "messages",
        userId
      );
      await updateDoc(receiverSummaryRef, {
        lastMessage: message,
        lastMessageDate: new Date().toISOString(),
      });

      setMessage(""); // Clear input field
      if (onMessageSent) onMessageSent(messageData); // Notify parent
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send the message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow border rounded-lg p-2 border-blue-300"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        />
        <button
          className={`px-4 py-2 rounded-lg ${
            loading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-black text-white"
          }`}
          onClick={handleSendMessage}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
