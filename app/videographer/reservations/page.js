"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/app/_utils/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ContactButton from "@/app/components/contact-button";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error("User not logged in.");
          return;
        }

        // Fetch all requests for the current videographer
        const requestsRef = collection(db, "users", userId, "requests");
        const snapshot = await getDocs(requestsRef);

        const fetchedReservations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReservations(fetchedReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error("User not logged in.");
        return;
      }

      // Update the status in Firestore for videographer
      const requestDocVideographer = doc(db, "users", userId, "requests", id);
      await updateDoc(requestDocVideographer, { status: newStatus });

      // Fetch clientId from the reservation
      const reservation = reservations.find((res) => res.id === id);
      if (!reservation || !reservation.clientId) {
        console.error("Client ID not found for this reservation.");
        return;
      }

      // Update the status in Firestore for client
      const requestDocClient = doc(
        db,
        "users",
        reservation.clientId,
        "requests",
        id
      );
      await updateDoc(requestDocClient, { status: newStatus });

      // Update the state to reflect the new status
      setReservations((prev) =>
        prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
      );
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reservations</h1>
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <CardTitle>{reservation.title || "No Event Title"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>Client:</strong> {reservation.clientName || "Unknown"}
              </p>
              <p className="mb-2">
                <strong>Date:</strong> {reservation.date || "No Date Provided"}
              </p>
              <p className="mb-4">
                <strong>Status:</strong> {reservation.status || "Unknown"}
              </p>
              {reservation.status === "pending" ? (
                <div className="flex space-x-4">
                  <Button
                    onClick={() =>
                      handleUpdateStatus(reservation.id, "confirmed")
                    }
                    variant="default"
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() =>
                      handleUpdateStatus(reservation.id, "rejected")
                    }
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                // Use ContactButton for confirmed requests
                <div>
                  <ContactButton
                    otherUserId={reservation.clientId}
                    otherUserName={reservation.clientName}
                    userType="videographer"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
