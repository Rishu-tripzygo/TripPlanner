import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="app-shell mx-auto max-w-2xl rounded-[36px] border border-white/55 bg-[linear-gradient(180deg,#ffffff,#f6f4ef)] p-8 text-center shadow-[0_24px_56px_rgba(22,40,64,0.08)] sm:p-12">
        <p className="section-label">Email sent</p>
        <h1 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2.8rem] font-bold leading-[0.95] tracking-[-0.05em] text-[#024785]">
          Check your inbox for the secure sign-in link.
        </h1>
        <p className="mt-5 text-base leading-8 text-[#61738C]">
          The link stays active for 10 minutes. Once you open it, we will bring you straight back
          to Wandrly.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center rounded-full border border-white/55 bg-white/72 px-5 py-3 text-sm font-semibold text-[#14518b]"
          >
            Use another email
          </Link>
          <Link
            href="/ai-trip-planner?mode=guest"
            className="inline-flex items-center rounded-full border border-white/55 bg-white/72 px-5 py-3 text-sm font-semibold text-[#14518b]"
          >
            Try a guest preview instead
          </Link>
        </div>
      </div>
    </div>
  );
}
