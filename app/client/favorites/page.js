import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  const favorites = [
    { id: 1, name: "John Doe", specialization: "Wedding Videography" },
    { id: 2, name: "Jane Smith", specialization: "Corporate Events" },
    { id: 3, name: "Mike Johnson", specialization: "Music Videos" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => (
          <Card key={favorite.id}>
            <CardHeader>
              <CardTitle>{favorite.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Specialization: {favorite.specialization}</p>
              <Button variant="outline" className="mr-2">
                View Profile
              </Button>
              <Button>Contact</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
