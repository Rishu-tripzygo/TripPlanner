import { auth } from "@/auth";
import LandingPageClient from "@/components/landing-page-client";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await auth();
  return <LandingPageClient isLoggedIn={!!session?.user} />;
}
