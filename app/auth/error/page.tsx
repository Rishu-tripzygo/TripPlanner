import Link from "next/link";

interface AuthErrorPageProps {
  searchParams: Promise<{
    error?: string | string[];
  }>;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="app-shell mx-auto max-w-2xl rounded-[36px] border border-white/55 bg-[linear-gradient(180deg,#ffffff,#f6f4ef)] p-8 shadow-[0_24px_56px_rgba(22,40,64,0.08)] sm:p-12">
        <p className="section-label">Sign-in issue</p>
        <h1 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2.8rem] font-bold leading-[0.95] tracking-[-0.05em] text-[#024785]">
          We couldn&apos;t complete that sign-in.
        </h1>
        <p className="mt-5 text-base leading-8 text-[#61738C]">
          Error code: <span className="font-semibold text-[#0f3460]">{error || "unknown"}</span>.
          Try again, or use another sign-in method if one is available.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-6 py-3 text-sm font-semibold text-white"
          >
            Return to sign in
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center justify-center rounded-full border border-white/55 bg-white/72 px-6 py-3 text-sm font-semibold text-[#14518b]"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
