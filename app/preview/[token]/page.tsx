import Link from "next/link";
import GuestPreviewView from "@/components/guest-preview-view";
import { findGuestPreviewByPublicToken } from "@/lib/guest-preview";
import { PersistedItinerary } from "@/lib/phase-one-types";

interface GuestPreviewPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function GuestPreviewPage({ params }: GuestPreviewPageProps) {
  const { token } = await params;
  const preview = await findGuestPreviewByPublicToken(token);

  if (!preview) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="app-shell mx-auto max-w-3xl rounded-[36px] border border-white/55 bg-[linear-gradient(180deg,#ffffff,#f6f4ef)] p-8 shadow-[0_24px_56px_rgba(22,40,64,0.08)] sm:p-12">
          <p className="section-label">Preview unavailable</p>
          <h1 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2.8rem] font-bold leading-[0.95] tracking-[-0.05em] text-[#024785]">
            This guest preview has expired.
          </h1>
          <p className="mt-5 text-base leading-8 text-[#61738C]">
            Guest previews stay available for one hour. You can generate a fresh one or sign in to
            keep future trips saved automatically.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/ai-trip-planner?mode=guest"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-6 py-3 text-sm font-semibold text-white"
            >
              Generate a new preview
            </Link>
            <Link
              href="/auth/signin?callbackUrl=/trips"
              className="inline-flex items-center justify-center rounded-full border border-white/55 bg-white/72 px-6 py-3 text-sm font-semibold text-[#14518b]"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <GuestPreviewView
        itinerary={preview.itineraryData as unknown as PersistedItinerary}
        ctaHref="/auth/signin?callbackUrl=%2Fonboarding%3FclaimPreview%3D1"
      />
    </div>
  );
}
