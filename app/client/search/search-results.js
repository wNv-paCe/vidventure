"use client";

import React from "react";
import SearchItem from "./search-item";

export default function SearchResults({ results, title }) {
  if (!results || results.length === 0) {
    return <p>No {title} found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center">
      {results.map((item) => (
        <SearchItem key={item.id} item={item} />
      ))}
    </div>
  );
}
