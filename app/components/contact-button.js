"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/app/_utils/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useUserAuth } from "@/app/_utils/auth-context";

export default function ContactButton({
  otherUserId,
  otherUserName,
  userType,
}) {
  const { user } = useUserAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendMessage = async () => {
    if (!user) {
      alert("Please log in to contact the user.");
      return;
    }

    if (!title || !content) {
      setErrorMessage("Both title and content are required.");
      return;
    }

    try {
      const messageId = `${user.uid}_${otherUserId}_${Date.now()}`;
      const currentDate = new Date().toISOString();

      // Message for the current user's collection
      const currentUserMessage = {
        id: messageId,
        from: user.uid,
        to: otherUserId,
        title,
        content,
        date: currentDate,
        read: true, // Current user's message marked as read
      };

      // Message for the other user's collection
      const otherUserMessage = {
        id: messageId,
        from: user.uid,
        to: otherUserId,
        title,
        content,
        date: currentDate,
        read: false, // Other user's message marked as unread
      };

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const senderName = userDoc.exists()
        ? userDoc.data().username || userDoc.data().email || "Unknown User"
        : user.email || "Unknown User";

      // Add message to Firestore (current user's collection)
      await setDoc(
        doc(
          collection(db, "users", user.uid, "messages", otherUserId, "chats"),
          messageId
        ),
        currentUserMessage
      );

      // Add message to Firestore (other user's collection)
      await setDoc(
        doc(
          collection(db, "users", otherUserId, "messages", user.uid, "chats"),
          messageId
        ),
        otherUserMessage
      );

      // Update current user's messages summary
      const currentUserSummary = {
        title,
        lastMessage: content,
        lastMessageDate: currentDate,
        receiverId: otherUserId,
        receiverName: otherUserName,
      };
      await setDoc(
        doc(db, "users", user.uid, "messages", otherUserId),
        currentUserSummary,
        { merge: true }
      );

      // Update other user's messages summary
      const otherUserSummary = {
        title,
        lastMessage: content,
        lastMessageDate: currentDate,
        receiverId: user.uid,
        receiverName: senderName,
      };
      await setDoc(
        doc(db, "users", otherUserId, "messages", user.uid),
        otherUserSummary,
        { merge: true }
      );

      alert("Message sent successfully!");
      setShowModal(false);
      setTitle("");
      setContent("");

      // Navigate to the appropriate messages page based on userType
      const messagesPath =
        userType === "videographer"
          ? "/videographer/messages"
          : "/client/messages";
      router.push(`${messagesPath}?receiverId=${otherUserId}`);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send the message. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-28 bg-gray-800 text-white rounded-md py-2 hover:bg-gray-900"
      >
        Contact
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">Contact {otherUserName}</h2>
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
