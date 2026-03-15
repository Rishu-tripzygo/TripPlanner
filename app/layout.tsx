import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import { auth } from "@/auth";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Voya | AI Travel Planner",
  description:
    "Premium AI-powered travel planning, maps, itineraries, and travel memories.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakartaSans.variable} font-[family-name:var(--font-plus-jakarta-sans)] antialiased`}
      >
        <Navbar session={session} />
        {children}
      </body>
    </html>
  );
}
