"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import SearchForm from "./search-form";
import SearchResults from "./search-results";

// Capitalize the first letter of each word
const capitalizeWords = (name) => {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function SearchPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rename and modify the function
  const fetchData = async (searchTerm = "") => {
    setLoading(true);
    try {
      // 拉全量 portfolios 和 servicePackage
      const [portfolioSnap, packageSnap] = await Promise.all([
        getDocs(
          query(collection(db, "portfolios"), orderBy("createdAt", "desc"))
        ),
        getDocs(collection(db, "servicePackage")),
      ]);

      let portfolios = portfolioSnap.docs.map((doc) => ({
        id: doc.id,
        type: "portfolio",
        ...doc.data(),
      }));

      let packages = packageSnap.docs.map((doc) => ({
        id: doc.id,
        type: "package",
        ...doc.data(),
      }));

      // 如果有searchTerm，统一前端过滤
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        portfolios = portfolios.filter(
          (item) =>
            item.fullName?.toLowerCase().includes(lowerTerm) ||
            item.title?.toLowerCase().includes(lowerTerm)
        );

        packages = packages.filter((item) =>
          item.title?.toLowerCase().includes(lowerTerm)
        );
      }

      // Combine both results
      setPortfolios([...portfolios, ...packages]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect and SearchForm
  useEffect(() => {
    fetchData();
  }, []);

  const portfolioItems = portfolios.filter((item) => item.type === "portfolio");
  const packageItems = portfolios.filter((item) => item.type === "package");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      <SearchForm onSearch={fetchData} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Portfolios</h2>
            <SearchResults results={portfolioItems} title="Portfolios" />
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Service Packages</h2>
            <SearchResults results={packageItems} title="Service Packages" />
          </section>
        </>
      )}
    </div>
  );
}
