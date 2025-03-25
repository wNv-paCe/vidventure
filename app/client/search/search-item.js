"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import CreateRequest from "@/app/components/create-request";
import ContactButton from "@/app/components/contact-button";

export default function SearchItem({ item }) {
  const router = useRouter();

  return (
    <div className="border rounded-lg shadow-md p-4 bg-white max-w-[350px] w-full mx-auto">
      {/* Clickable content area with hover and routing */}
      <div
        className="hover:scale-105 hover:shadow-lg transition-transform duration-300 cursor-pointer"
        onClick={() =>
          item.type === "portfolio"
            ? router.push(`/profile/${item.userId}`)
            : router.push(`/servicePackage/${item.id}`)
        }
      >
        {item.type === "portfolio" ? (
          <>
            <Image
              src={item.thumbnailUrl || "https://via.placeholder.com/150"}
              alt={item.title}
              width={350}
              height={300}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h3 className="text-base font-bold h-14">{item.title}</h3>
            <p className="text-sm text-gray-600 h-8">{item.fullName}</p>
            <p className="text-gray-500 text-sm h-20">{item.description}</p>
          </>
        ) : (
          <>
            {item.media && item.media.length > 0 ? (
              <iframe
                src={item.media[0].url}
                title={item.media[0].name}
                width={350}
                height={300}
                className="w-full h-48 object-cover rounded-t-lg"
                allowFullScreen
              ></iframe>
            ) : (
              <Image
                src="/images/default-image.png"
                alt="Default Service Package"
                width={350}
                height={300}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            )}
            <h3 className="text-base font-bold pt-4 h-24">{item.title}</h3>
            <p className="text-lg font-bold text-blue-600">${item.price}</p>
          </>
        )}
      </div>

      {/* Action buttons - independent of hover and click */}
      {item.type === "portfolio" && (
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
      )}
    </div>
  );
}
