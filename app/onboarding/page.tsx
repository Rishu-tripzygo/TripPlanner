import { auth } from "@/auth";
import OnboardingClaim from "@/components/onboarding/onboarding-claim";
import { redirect } from "next/navigation";

interface OnboardingPageProps {
  searchParams: Promise<{
    claimPreview?: string | string[];
  }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/onboarding");
  }

  const params = await searchParams;
  const claimPreview = Array.isArray(params.claimPreview)
    ? params.claimPreview[0]
    : params.claimPreview;

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <OnboardingClaim shouldClaim={claimPreview === "1"} />
    </div>
  );
}
