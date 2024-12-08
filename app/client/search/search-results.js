"use client";

import React from "react";
import SearchItem from "./search-item";

export default function SearchResults({ results }) {
  if (!results || results.length === 0) {
    return <p>No portfolios found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {results.map((item) => (
        <SearchItem key={item.id} item={item} />
      ))}
    </div>
  );
}
