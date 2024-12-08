"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import CreateRequest from "@/app/components/create-request";
import ContactButton from "@/app/components/contact-button";

export default function SearchItem({ item }) {
  const router = useRouter();

  return (
    <div className="border rounded-lg shadow-md p-4 bg-white max-w-lg mx-auto">
      <Image
        src={item.thumbnailUrl || "https://via.placeholder.com/150"}
        alt={item.title}
        width={500}
        height={300}
        className="w-full h-40 object-cover rounded-md mb-6"
      />
      <h3 className="text-lg font-bold">{item.title}</h3>
      <p className="text-sm text-gray-600">{item.fullName}</p>
      <p className="text-gray-500 text-sm">{item.description}</p>
      <div className="mt-4 flex space-x-4">
        <ContactButton
          videographerId={item.userId}
          videographerName={item.fullName}
        />
        <CreateRequest
          videographerId={item.userId}
          videographerName={item.fullName}
          onSuccess={() => router.push(`/client/requests`)}
        />
      </div>
    </div>
  );
}
