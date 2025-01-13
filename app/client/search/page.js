"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import SearchForm from "./search-form";
import SearchResults from "./search-results";

// Capitalize the first letter of each word
function capitalizeWords(name) {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SearchPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load portfolios from Firestore
  const fetchPortfolios = async (searchTerm = "") => {
    setLoading(true);
    try {
      let q;
      if (searchTerm) {
        // Capitalize the search term
        const formattedSearchTerm = capitalizeWords(searchTerm);

        // Basic search by name
        q = query(
          collection(db, "portfolios"),
          where("fullName", ">=", formattedSearchTerm),
          where("fullName", "<=", formattedSearchTerm + "\uf8ff")
        );
      } else {
        // Default: get all portfolios
        q = query(collection(db, "portfolios"), orderBy("createdAt", "desc"));
      }
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPortfolios(items);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch portfolios on initial load
  useEffect(() => {
    fetchPortfolios();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Search Portfolios</h1>
      <SearchForm onSearch={fetchPortfolios} />
      {loading ? <p>Loading...</p> : <SearchResults results={portfolios} />}
    </div>
  );
}
