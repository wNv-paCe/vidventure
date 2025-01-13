"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserAuth } from "@/app/_utils/auth-context";
import MessageSummaryList from "@/app/components/messages/message-summary-list";
import MessageList from "@/app/components/messages/message-list";
import MessageSender from "@/app/components/messages/message-sender";

export default function MessagesPage() {
  const { user } = useUserAuth(); // 获取当前用户
  const router = useRouter();
  const searchParams = useSearchParams(); // 解析 URL 参数
  const [selectedReceiverId, setSelectedReceiverId] = useState(null); // 当前选中的接收方 ID

  useEffect(() => {
    // 等待用户登录
    if (!user) {
      return <p>Loading...</p>;
    }

    // 从 URL 参数中获取 receiverId
    const receiverId = searchParams.get("receiverId");
    if (receiverId) {
      setSelectedReceiverId(receiverId); // 将 receiverId 设置为当前选中的接收方
    }
  }, [searchParams]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      {/* 如果没有选中接收方，显示摘要列表 */}
      {!selectedReceiverId ? (
        <MessageSummaryList
          userId={user.uid} // 当前用户 ID
          onSelectChat={(receiverId) => setSelectedReceiverId(receiverId)} // 处理选中聊天
        />
      ) : (
        <div>
          <button
            className="text-blue-600 hover:underline mb-4"
            onClick={() => {
              setSelectedReceiverId(null);
              router.push("/client/messages");
            }}
          >
            Back to conversations
          </button>
          {/* 显示选中接收方的消息列表 */}
          <MessageList
            userId={user.uid} // 当前用户 ID
            receiverId={selectedReceiverId} // 接收方 ID
          />
          {/* 消息发送框 */}
          <MessageSender
            receiverId={selectedReceiverId} // 接收方 ID
            userId={user.uid} // 当前用户 ID
          />
        </div>
      )}
    </div>
  );
}
