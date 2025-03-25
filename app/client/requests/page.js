"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db, auth } from "@/app/_utils/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  writeBatch,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import ContactButton from "@/app/components/contact-button";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      setError("You must be logged in to view your requests.");
      return;
    }

    const q = query(
      collection(db, `users/${userId}/requests`),
      where("clientId", "==", userId) // Get requests where the client is the current user
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedRequests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(fetchedRequests);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching requests:", err.message);
        setError("Failed to load requests.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCancelRequest = async (requestId, videographerId) => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      alert("You must be logged in to cancel a request.");
      return;
    }

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this request?"
    );
    if (!confirmCancel) return;

    try {
      const batch = writeBatch(db);

      // Client's request path
      const clientRequestRef = doc(db, `users/${userId}/requests/${requestId}`);
      console.log("Deleting client request:", clientRequestRef.path);
      batch.delete(clientRequestRef);

      // Videographer's request path
      const videographerRequestRef = doc(
        db,
        `users/${videographerId}/requests/${requestId}`
      );
      console.log(
        "Deleting videographer request:",
        videographerRequestRef.path
      );
      batch.delete(videographerRequestRef);

      await batch.commit();

      alert("Request successfully canceled.");
    } catch (err) {
      console.error("Error canceling request:", err.message);
      alert("Failed to cancel request. Please try again.");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Studio Visit</h1>
      {requests.length === 0 ? (
        <p className="text-gray-500">You have no Studio Visit.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border rounded-lg shadow">
              <CardHeader>
                <CardTitle>{request.title || "Untitled Event"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  <strong>Videographer:</strong> {request.videographerName}
                </p>
                <p className="mb-2">
                  <strong>Date:</strong> {request.date || "N/A"}
                </p>
                <p className="mb-4">
                  <strong>Status:</strong> {request.status}
                </p>
                <div className="flex w-1/2 justify-start space-x-4">
                  <ContactButton
                    otherUserId={request.videographerId}
                    otherUserName={request.videographerName}
                    onSuccess={() =>
                      router.push(
                        `/client/messages?videographerId=${request.videographerId}`
                      )
                    }
                  />
                  {request.status === "pending" && (
                    <Button
                      onClick={() =>
                        handleCancelRequest(request.id, request.videographerId)
                      }
                      className="w-28 bg-red-500 text-white rounded-md py-2 hover:bg-red-600"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
