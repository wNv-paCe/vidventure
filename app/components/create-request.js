"use client";

import { useRouter } from "next/navigation";
import { doc, collection, writeBatch } from "firebase/firestore";
import { db, auth } from "@/app/_utils/firebase";

export default function CreateRequest({
  videographerId,
  videographerName,
  onSuccess,
}) {
  const router = useRouter();

  const handleCreateRequest = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("You must be logged in to send a request.");
      return;
    }

    const clientName = prompt("Enter your name:");
    if (!clientName) {
      alert("Your name is required.");
      return;
    }

    // Get event title from user input
    const eventTitle = prompt("Enter the event title:");
    if (!eventTitle) {
      alert("Event title is required.");
      return;
    }

    // Get event date from user input
    const eventDate = prompt("Enter the event date (YYYY-MM-DD):");
    if (!eventDate) {
      alert("Please enter a valid event date.");
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!dateRegex.test(eventDate)) {
      alert(
        "Invalid date format. Please enter a date in the format YYYY-MM-DD."
      );
      return;
    }

    // Validate date
    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) {
      alert("Invalid date. Please enter a valid date.");
      return;
    }

    try {
      const requestId = `${userId}_${videographerId}_${Date.now()}`;
      const requestData = {
        clientId: userId,
        clientName,
        videographerId,
        videographerName,
        title: eventTitle, // Add title
        date: eventDate,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // Firestore batch write
      const batch = writeBatch(db);

      // Client requests collection path
      const clientRequestsRef = doc(
        collection(doc(db, "users", userId), "requests"),
        requestId
      );
      batch.set(clientRequestsRef, requestData);

      // Videographer requests collection path
      const videographerRequestsRef = doc(
        collection(doc(db, "users", videographerId), "requests"),
        requestId
      );
      batch.set(videographerRequestsRef, requestData);

      await batch.commit();

      console.log("Request successfully created:", requestId);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/client/requests`);
      }
    } catch (err) {
      console.error("Error creating request:", err.message);
      alert("Failed to create request. Please try again.");
    }
  };

  return (
    <button
      onClick={handleCreateRequest}
      className="w-28 bg-red-500 text-white rounded-md py-2 hover:bg-red-600"
    >
      Request
    </button>
  );
}
