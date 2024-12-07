import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Search() {
  const videographers = [
    { id: 1, name: "John Doe", specialization: "Wedding Videography" },
    { id: 2, name: "Jane Smith", specialization: "Corporate Events" },
    { id: 3, name: "Mike Johnson", specialization: "Music Videos" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Search Videographers</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by name or specialization"
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videographers.map((videographer) => (
          <Card key={videographer.id}>
            <CardHeader>
              <CardTitle>{videographer.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Specialization: {videographer.specialization}
              </p>
              <Button>View Profile</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
