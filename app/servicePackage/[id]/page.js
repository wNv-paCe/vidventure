"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/_utils/firebase";

export default function ServicePackageDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [servicePackage, setServicePackage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServicePackage() {
      try {
        const docRef = doc(db, "servicePackage", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setServicePackage(docSnap.data());
        } else {
          console.error("Service package not found.");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching service package:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchServicePackage();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!servicePackage) {
    return <p>Service Package not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-500 hover:text-blue-700 font-semibold"
      >
        Back
      </button>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">{servicePackage.title}</h1>

        {/* 显示所有图片或视频 */}
        {servicePackage.media && servicePackage.media.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {servicePackage.media.map((mediaItem, index) => (
              <iframe
                key={index}
                src={mediaItem.url}
                title={mediaItem.name}
                width="100%"
                height="300"
                className="rounded-lg shadow-md"
                allowFullScreen
              ></iframe>
            ))}
          </div>
        )}

        <p className="text-xl font-bold text-blue-600 mb-4">
          Price: ${servicePackage.price}
        </p>

        <p className="text-gray-700">{servicePackage.description}</p>
      </div>
    </div>
  );
}
