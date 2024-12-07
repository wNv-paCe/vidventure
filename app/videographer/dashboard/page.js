"use client";

import React from "react";
import { useUserAuth } from "@/app/_utils/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VideographerDashboard() {
  const { user } = useUserAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.email}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You have 5 items in your portfolio.</p>
            <Button>Manage Portfolio</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You have 2 upcoming reservations.</p>
            <Button>View Reservations</Button>
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
