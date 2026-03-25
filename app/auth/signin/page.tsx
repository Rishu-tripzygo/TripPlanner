import { availableAuthProviders } from "@/auth";
import SignInPanel from "@/components/auth/sign-in-panel";

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = Array.isArray(params.callbackUrl) ? params.callbackUrl[0] : params.callbackUrl;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <SignInPanel
      callbackUrl={callbackUrl || "/trips"}
      error={error}
      availableProviders={availableAuthProviders}
    />
  );
}
