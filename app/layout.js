import "./globals.css";
import { Inter } from "next/font/google";
import { AuthContextProvider } from "./_utils/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VidVenture",
  description: "Professional videography services for your special moments",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
