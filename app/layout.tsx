import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import AssistantBubble from "@/components/assistant-bubble";
import PWARegister from "@/components/pwa-register";
import AppSessionProvider from "@/components/session-provider";
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
  title: {
    default: "Wandrly",
    template: "%s | Wandrly",
  },
  applicationName: "Wandrly",
  description:
    "Premium AI-powered travel planning, maps, itineraries, and travel memories.",
  icons: {
    icon: [
      { url: "/icon?size=192", sizes: "192x192", type: "image/png" },
      { url: "/icon?size=512", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/icon?size=192", type: "image/png" }],
    apple: [{ url: "/icon?size=192", sizes: "192x192", type: "image/png" }],
  },
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
        <AppSessionProvider session={session}>
          <Navbar session={session} />
          {children}
          <PWARegister />
          <AssistantBubble />
          <Footer />
        </AppSessionProvider>
      </body>
    </html>
  );
}
