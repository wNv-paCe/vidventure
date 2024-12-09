"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";
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

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
      setLoading(false);

      // Mark unread messages as read
      try {
        const unreadMessages = snapshot.docs.filter(
          (doc) => doc.data().read === false && doc.data().to === userId
        );
        const updatePromises = unreadMessages.map(async (doc) => {
          const docRef = doc.ref;

          // Verify the document exists before updating
          try {
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
              return updateDoc(docRef, { read: true });
            } else {
              console.warn(`Document does not exist: ${docRef.path}`);
              return Promise.resolve(); // Skip this document
            }
          } catch (err) {
            console.error(
              `Error checking document existence: ${docRef.path}`,
              err
            );
            return Promise.resolve(); // Skip this document on error
          }
        });
        await Promise.all(updatePromises);
        console.log("Unread messages marked as read.");
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
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
