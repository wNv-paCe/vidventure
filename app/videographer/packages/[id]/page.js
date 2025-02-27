"use client";

import { useParams, useRouter } from "next/navigation";

export default function EditPackage() {
    const { id } = useParams(); // 从 URL 解析 id
    const router = useRouter();

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Editing Package ID: {id}</h1>
            <button onClick={() => router.push("/videographer/packages")}>Back</button>
        </div>
    );
}
