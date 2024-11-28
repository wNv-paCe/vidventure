import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const portfolioItems = [
  {
    id: 1,
    title: "Wedding Bliss",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 2,
    title: "Corporate Event",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 3,
    title: "Nature Documentary",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 4,
    title: "Music Video",
    image: "/placeholder.svg?height=300&width=400",
  },
];

export default function Home() {
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
            Our Portfolio
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
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
