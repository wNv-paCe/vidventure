import Link from "next/link";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <h1 className="text-3xl font-bold mb-5">VidVenture Video Production</h1>
        <div className="text-lg">
          <ul>
            <li className="hover:text-green-400 hover:underline">
              <Link href="/login/client">Client Login</Link>
            </li>
            <li className="hover:text-green-400 hover:underline">
              <Link href="/login/video">Videographer Login</Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
