"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Schedule() {
  const scheduleItems = [
    { id: 1, date: "2023-06-15", time: "10:00 AM", event: "Wedding Shoot" },
    { id: 2, date: "2023-06-17", time: "2:00 PM", event: "Corporate Event" },
    {
      id: 3,
      date: "2023-06-20",
      time: "11:00 AM",
      event: "Product Photography",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Schedule</h1>
      <Button className="mb-6">Add New Event</Button>
      <div className="space-y-4">
        {scheduleItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.date}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>Time:</strong> {item.time}
              </p>
              <p className="mb-4">
                <strong>Event:</strong> {item.event}
              </p>
              <Button variant="outline">Edit</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
