"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function PortfolioItem({ item, onEdit, onDelete }) {
  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white">
      {/* Thumbnail */}
      <Image
        src={item.thumbnailUrl || "https://via.placeholder.com/150"}
        alt={item.title}
        width={500}
        height={300}
        className="w-full h-40 object-cover rounded-md mb-4"
      />

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          View Work
        </a>
      )}

      {/* Author */}
      <p className="text-gray-500 text-xs mt-2">
        By: {item.fullName || "Unknown"}
      </p>

      {/* Title, Description, and URL */}
      <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{item.description}</p>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button className="w-28" variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button
          className="w-28"
          variant="destructive"
          size="sm"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
