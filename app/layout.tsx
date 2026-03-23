import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import AssistantBubble from "@/components/assistant-bubble";
import PWARegister from "@/components/pwa-register";
import { auth } from "@/auth";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wandrly | AI Travel Planner",
  description:
    "Premium AI-powered travel planning, maps, itineraries, and travel memories.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${notoSerif.variable} font-[family-name:var(--font-plus-jakarta-sans)] antialiased`}
      >
        <Navbar session={session} />
        {children}
        <PWARegister />
        <AssistantBubble />
        <Footer />
      </body>
    </html>
  );
}
