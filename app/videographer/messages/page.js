"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Messages() {
  const messages = [
    {
      id: 1,
      from: "John Doe",
      subject: "Wedding Inquiry",
      date: "2023-06-10",
      read: false,
    },
    {
      id: 2,
      from: "Jane Smith",
      subject: "Corporate Event Details",
      date: "2023-06-09",
      read: true,
    },
    {
      id: 3,
      from: "Bob Johnson",
      subject: "Photo Shoot Question",
      date: "2023-06-08",
      read: false,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardHeader>
              <CardTitle className={message.read ? "" : "font-bold"}>
                {message.subject}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>From:</strong> {message.from}
              </p>
              <p className="mb-4">
                <strong>Date:</strong> {message.date}
              </p>
              <Button variant={message.read ? "outline" : "default"}>
                {message.read ? "View" : "Read"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
