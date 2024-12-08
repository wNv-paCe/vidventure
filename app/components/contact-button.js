"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/app/_utils/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useUserAuth } from "@/app/_utils/auth-context";

export default function ContactButton({ videographerId, videographerName }) {
  const { user } = useUserAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendMessage = async () => {
    if (!user) {
      alert("Please log in to contact the videographer.");
      return;
    }

    if (!title || !content) {
      setErrorMessage("Both title and content are required.");
      return;
    }

    try {
      const messageId = `${user.uid}_${videographerId}_${Date.now()}`;
      const currentDate = new Date().toISOString();
      const initialMessage = {
        id: messageId,
        from: user.uid,
        to: videographerId,
        title,
        content,
        date: currentDate,
        read: false,
      };

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const senderName = userDoc.exists()
        ? userDoc.data().username || userDoc.email || "Unknown User"
        : user.email || "Unknown User";

      // Add message to Firestore (client's collection)
      await setDoc(
        doc(
          collection(
            db,
            "users",
            user.uid,
            "messages",
            videographerId,
            "chats"
          ),
          messageId
        ),
        initialMessage
      );

      // Add message to Firestore (videographer's collection)
      await setDoc(
        doc(
          collection(
            db,
            "users",
            videographerId,
            "messages",
            user.uid,
            "chats"
          ),
          messageId
        ),
        initialMessage
      );

      // Update client's messages summary
      const clientSummary = {
        title,
        lastMessage: content,
        lastMessageDate: currentDate,
        receiverId: videographerId,
        receiverName: videographerName,
      };
      await setDoc(
        doc(db, "users", user.uid, "messages", videographerId),
        clientSummary,
        { merge: true }
      );

      // Update videographer's messages summary
      const videographerSummary = {
        title,
        lastMessage: content,
        lastMessageDate: currentDate,
        receiverId: user.uid,
        receiverName: senderName,
      };
      await setDoc(
        doc(db, "users", videographerId, "messages", user.uid),
        videographerSummary,
        { merge: true }
      );

      alert("Message sent successfully!");
      setShowModal(false);
      setTitle("");
      setContent("");
      router.push(`/client/messages?photographerId=${videographerId}`);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send the message. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex-1 bg-gray-800 text-white rounded-md py-2 hover:bg-gray-900"
      >
        Contact
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">
              Contact {videographerName}
            </h2>
            {errorMessage && (
              <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrorMessage("");
                  }}
                  className="w-full border rounded-md px-2 py-1"
                  placeholder="Enter message title"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setErrorMessage("");
                  }}
                  className="w-full border rounded-md px-2 py-1"
                  rows="4"
                  placeholder="Enter your message"
                  required
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setErrorMessage("");
                }}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
