"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/app/_utils/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function ClientDashboard() {
  const router = useRouter();
  const [requestCount, setRequestCount] = React.useState(0);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    // Fetch the number of pending and confirmed requests
    const fetchRequestCount = async () => {
      try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error("User not logged in.");
          return;
        }
        const requestsRef = collection(db, "users", userId, "requests");
        const q = query(
          requestsRef,
          where("status", "in", ["pending", "confirmed"])
        );
        const querySnapshot = await getDocs(q);
        setRequestCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    // Fetch the number of unread messages
    const fetchUnreadMessagesCount = async () => {
      try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error("User not logged in.");
          return;
        }

        // Fetch all chats where read is false
        const messagesRef = collection(db, "users", userId, "messages");
        const receiverSnapshots = await getDocs(messagesRef);

        let totalUnread = 0;

        // Iterate over each receiverId
        for (const receiverDoc of receiverSnapshots.docs) {
          const chatsRef = collection(
            db,
            "users",
            userId,
            "messages",
            receiverDoc.id,
            "chats"
          );
          const unreadQuery = query(chatsRef, where("read", "==", false));
          const unreadSnapshot = await getDocs(unreadQuery);
          totalUnread += unreadSnapshot.size;
        }

        setUnreadCount(totalUnread);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };

    fetchRequestCount();
    fetchUnreadMessagesCount();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Find Videographers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Discover talented videographers for your next project.
            </p>
            <Button
              onClick={() => {
                router.push("/client/search");
              }}
            >
              Start Searching
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You have {requestCount} active request{requestCount !== 1 && "s"}.
            </p>
            <Button
              onClick={() => {
                router.push("/client/requests");
              }}
            >
              View Requests
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You have {unreadCount} unread message
              {unreadCount !== 1 && "s"}.
            </p>
            <Button
              onClick={() => {
                router.push("/client/messages");
              }}
            >
              Check Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
