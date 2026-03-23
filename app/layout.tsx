import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ThemePreference } from "@/lib/phase-one-types";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userThemePreference: ThemePreference =
    session?.user?.id
      ? ((await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { themePreference: true },
        }))?.themePreference as ThemePreference | undefined) || "SYSTEM"
      : "SYSTEM";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=localStorage.getItem('theme-preference');var initial='${userThemePreference}';var pref=(stored==='LIGHT'||stored==='DARK'||stored==='SYSTEM')?stored:initial;var systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=pref==='LIGHT'?'light':pref==='DARK'?'dark':(systemDark?'dark':'light');document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(theme);document.documentElement.dataset.theme=theme;}catch(e){document.documentElement.classList.add('light');document.documentElement.dataset.theme='light';}})();`,
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${notoSerif.variable} font-[family-name:var(--font-plus-jakarta-sans)] antialiased`}
      >
        <ThemeProvider initialPreference={userThemePreference}>
          <Navbar session={session} />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
