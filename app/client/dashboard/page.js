import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClientDashboard() {
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
            <Button>Start Searching</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You have 2 active requests.</p>
            <Button>View Requests</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You have 3 unread messages.</p>
            <Button>Check Messages</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
