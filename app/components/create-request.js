"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, collection, writeBatch } from "firebase/firestore";
import { db, auth } from "@/app/_utils/firebase";

export default function CreateRequest({
  videographerId,
  videographerName,
  onSuccess,
}) {
  const router = useRouter();

  // Form state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [clientName, setClientName] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");

  const handleCreateRequest = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("You must be logged in to send a request.");
      return;
    }

    // Validate inputs
    if (!clientName || !eventTitle || !eventDate) {
      alert("All fields are required.");
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
        title: eventTitle,
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

      // Reset form state
      setClientName("");
      setEventTitle("");
      setEventDate("");
      setIsModalVisible(false);

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
    <>
      {/* Request Button */}
      <button
        onClick={() => setIsModalVisible(true)}
        className="w-28 bg-red-500 text-white rounded-md py-2 hover:bg-red-600"
      >
        Request
      </button>

      {/* Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-4">Create Request</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateRequest();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white p-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalVisible(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
