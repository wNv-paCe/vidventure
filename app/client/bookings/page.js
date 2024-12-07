import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Bookings() {
  const bookings = [
    {
      id: 1,
      videographer: "John Doe",
      event: "Wedding",
      date: "2023-08-15",
      status: "Confirmed",
    },
    {
      id: 2,
      videographer: "Jane Smith",
      event: "Corporate Event",
      date: "2023-09-01",
      status: "Pending",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle>{booking.event}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>Videographer:</strong> {booking.videographer}
              </p>
              <p className="mb-2">
                <strong>Date:</strong> {booking.date}
              </p>
              <p className="mb-4">
                <strong>Status:</strong> {booking.status}
              </p>
              <Button
                variant={booking.status === "Confirmed" ? "outline" : "default"}
              >
                {booking.status === "Confirmed"
                  ? "View Details"
                  : "Confirm Booking"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
