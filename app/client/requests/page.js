import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Requests() {
  const requests = [
    {
      id: 1,
      videographer: "John Doe",
      event: "Wedding",
      date: "2023-08-15",
      status: "Pending",
    },
    {
      id: 2,
      videographer: "Jane Smith",
      event: "Corporate Event",
      date: "2023-09-01",
      status: "Accepted",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Requests</h1>
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle>{request.event}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>Videographer:</strong> {request.videographer}
              </p>
              <p className="mb-2">
                <strong>Date:</strong> {request.date}
              </p>
              <p className="mb-4">
                <strong>Status:</strong> {request.status}
              </p>
              <Button
                variant={request.status === "Pending" ? "default" : "outline"}
              >
                {request.status === "Pending"
                  ? "Cancel Request"
                  : "View Details"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
