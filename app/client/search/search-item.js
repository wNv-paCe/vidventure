"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import CreateRequest from "@/app/components/create-request";
import ContactButton from "@/app/components/contact-button";

export default function SearchItem({ item }) {
  const router = useRouter();

  return (
    <div className="border rounded-lg shadow-md p-4 bg-white max-w-[350px] w-full mx-auto">
      <Image
        src={item.thumbnailUrl || "https://via.placeholder.com/150"}
        alt={item.title}
        width={350}
        height={300}
        className="w-full h-40 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-bold h-14">{item.title}</h3>
      <p className="text-sm text-gray-600 h-8">{item.fullName}</p>
      <p className="text-gray-500 text-sm h-14">{item.description}</p>
      <div className="mt-4 flex justify-around space-x-4">
        <ContactButton
          otherUserId={item.userId}
          otherUserName={item.fullName}
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
