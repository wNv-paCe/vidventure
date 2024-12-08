"use client";

import React, { useState } from "react";

export default function SearchForm({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm); // 将搜索词传递给父组件
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-4 mb-6">
      <input
        type="text"
        placeholder="Search by photographer's name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded-md p-2 w-full"
      />
      <button
        type="submit"
        className="bg-black text-white rounded-md px-4 py-2"
      >
        Search
      </button>
    </form>
  );
}
