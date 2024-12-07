"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Reservations() {
  const reservations = [
    {
      id: 1,
      client: "John Doe",
      date: "2023-07-01",
      event: "Wedding",
      status: "Confirmed",
    },
    {
      id: 2,
      client: "Jane Smith",
      date: "2023-07-15",
      event: "Corporate Event",
      status: "Pending",
    },
    {
      id: 3,
      client: "Bob Johnson",
      date: "2023-07-20",
      event: "Birthday Party",
      status: "Confirmed",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reservations</h1>
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <CardTitle>{reservation.event}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>Client:</strong> {reservation.client}
              </p>
              <p className="mb-2">
                <strong>Date:</strong> {reservation.date}
              </p>
              <p className="mb-4">
                <strong>Status:</strong> {reservation.status}
              </p>
              <Button
                variant={
                  reservation.status === "Pending" ? "default" : "outline"
                }
              >
                {reservation.status === "Pending" ? "Confirm" : "View Details"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
