"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Portfolio() {
  const portfolioItems = [
    {
      id: 1,
      title: "Wedding Video",
      description: "A beautiful summer wedding",
    },
    { id: 2, title: "Corporate Event", description: "Annual tech conference" },
    { id: 3, title: "Music Video", description: "Local band's debut single" },
    { id: 4, title: "Short Film", description: "Award-winning short drama" },
    {
      id: 5,
      title: "Product Launch",
      description: "New smartphone release event",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>
      <Button className="mb-6">Add New Item</Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{item.description}</p>
              <Button variant="outline">Edit</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
