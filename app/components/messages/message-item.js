"use client";

export default function MessageItem({ message, userId }) {
  const isSentByCurrentUser = message.from === userId;

  return (
    <div
      className={`flex ${
        isSentByCurrentUser ? "justify-end" : "justify-start"
      } my-2`}
    >
      <div
        className={`p-4 rounded-lg w-1/2 ${
          isSentByCurrentUser
            ? "bg-blue-600 text-white text-right"
            : "bg-red-500 text-white text-left"
        }`}
      >
        <p className="text-sm text-gray-200 mb-1">
          {new Date(message.date).toLocaleString()}
        </p>
        <p className="text-lg font-medium">{message.content}</p>
      </div>
    </div>
  );
}
