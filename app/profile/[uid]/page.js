"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import Image from "next/image";

export default function VideographerProfile() {
  const router = useRouter();
  // Use the useParams hook to get the uid from the URL
  const params = useParams();
  // Get the uid from the params
  const uid = params.uid;
  const [videographer, setVideographer] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [servicePackages, setServicePackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideographerData() {
      try {
        if (!uid) return;

        // Get the videographer data
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        // If the videographer doesn't exist, redirect to the homepage
        if (!userSnap.exists()) {
          console.error("Videographer not found.");
          router.push("/");
          return;
        }

        setVideographer(userSnap.data());

        // Get the videographer's portfolio
        const portfolioQuery = query(
          collection(db, "portfolios"),
          where("userId", "==", uid)
        );
        const portfolioSnapshot = await getDocs(portfolioQuery);

        const portfolioData = portfolioSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPortfolios(portfolioData);

        // Get the videographer's service packages
        const servicePackageQuery = query(
          collection(db, "servicePackage"),
          where("ownerId", "==", uid)
        );
        const servicePackageSnapshot = await getDocs(servicePackageQuery);

        const serviceData = servicePackageSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setServicePackages(serviceData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching videographer data:", error);
        setLoading(false);
      }
    }

    fetchVideographerData();
  }, [uid]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            Back
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Personal Information */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {videographer?.username || "Videographer"}
          </h1>
          <p className="text-gray-600 mt-4 text-left leading-relaxed w-full">
            {videographer?.bio || "No bio available"}
          </p>
        </section>

        {/* Portfolios Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
          {portfolios.length === 0 ? (
            <p>No portfolio items available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Service Packages Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Service Packages</h2>
          {servicePackages.length === 0 ? (
            <p>No service packages available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicePackages.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden p-4 hover:scale-105 hover:shadow-lg cursor-pointer"
                  onClick={() => router.push(`/servicePackage/${item.id}`)}
                >
                  {/* 显示图片 */}
                  {item.media && item.media.length > 0 ? (
                    <iframe
                      src={item.media[0].url}
                      title={item.media[0].name}
                      width="100%"
                      height="200"
                      className="w-full h-48 object-cover rounded-t-lg"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <Image
                      src="/images/default-image.png"
                      alt="Default Service Package"
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-lg font-bold text-blue-600">
                    ${item.price}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
