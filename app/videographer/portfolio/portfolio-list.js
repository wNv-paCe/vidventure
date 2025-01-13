"use client";

import React from "react";
import PortfolioItem from "./portfolio-item";

export default function PortfolioList({ items, onEdit, onDelete }) {
  if (!items || items.length === 0) {
    return <p className="text-gray-500">No portfolio items found.</p>;
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <PortfolioItem
          key={item.id}
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </div>
  );
}
