import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Search,
  FileText,
  MessageSquare,
  Star,
  Calendar,
  UserCircle,
  Image,
  Clock,
  BookOpen,
  Package,
} from "lucide-react";

const Sidebar = ({ userType }) => {
  const pathname = usePathname();

  const clientLinks = [
    { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/client/search", label: "Search Videographers", icon: Search },
    { href: "/client/requests", label: "My Requests", icon: FileText },
    { href: "/client/messages", label: "Messages", icon: MessageSquare },
    { href: "/client/favorites", label: "My Favorites", icon: Star },
    { href: "/client/bookings", label: "Bookings", icon: Calendar },
    { href: "/client/profile", label: "Profile", icon: UserCircle },
  ];

  const videographerLinks = [
    {
      href: "/videographer/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { href: "/videographer/packages", label: "Packages", icon: Package },
    { href: "/videographer/portfolio", label: "My Portfolio", icon: Image },
    { href: "/videographer/schedule", label: "Schedule", icon: Clock },
    {
      href: "/videographer/reservations",
      label: "Reservations",
      icon: BookOpen,
    },
    { href: "/videographer/messages", label: "Messages", icon: MessageSquare },
    { href: "/videographer/profile", label: "Profile", icon: UserCircle },
  ];

  const links = userType === "client" ? clientLinks : videographerLinks;

  return (
    <div className="bg-secondary text-secondary-foreground w-64 min-h-screen p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} passHref>
            <Button
              variant={pathname === link.href ? "default" : "ghost"}
              className="w-full justify-start"
            >
              {link.icon && <link.icon className="mr-2 h-4 w-4" />}
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;