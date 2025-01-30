"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch portfolio items from Firestore
  useEffect(() => {
    async function fetchPortfolio() {
      try {
        // Query the 4 portfolio items
        const portfolioRef = collection(db, "portfolios");

        // Using orderBy and createdAt to get the latest 4 items
        const q = query(portfolioRef, orderBy("createdAt", "desc"), limit(4));

        const querySnapshot = await getDocs(q);

        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Shuffle the items
        const shuffledItems = items.sort(() => 0.5 - Math.random());

        setPortfolioItems(shuffledItems);
        setLoading(false);
      } catch (error) {
        console.error("Error loading portfolio items: ", error);
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">VidVenture</h1>
          <nav>
            <Button asChild className="mr-4">
              <Link href="/login/client">Client Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login/videographer">Videographer Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <div className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-extrabold">
              Capture Your Moments with VidVenture
            </h2>
            <p className="mt-4 text-xl">
              Professional videography services for your special events
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
            Featured Portfolio
          </h2>

          {loading ? (
            <p>Loading portfolio...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer"
                  onClick={() => router.push(`/profile/${item.userId}`)}
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
                    <p className="text-sm text-gray-600">{item.fullName}</p>
                    <p className="text-sm text-gray-700">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
              About Us
            </h2>
            <p className="text-lg text-gray-700">
              VidVenture is your go-to platform for professional videography
              services. We connect clients with talented videographers to
              capture life&apos;s most precious moments. Whether you&apos;re
              planning a wedding, corporate event, or need a promotional video,
              our network of skilled professionals is here to bring your vision
              to life.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2023 VidVenture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
