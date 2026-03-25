"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OnboardingClaim({ shouldClaim }: { shouldClaim: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "claiming" | "done">(
    shouldClaim ? "claiming" : "idle"
  );
  const [message, setMessage] = useState(
    shouldClaim ? "Saving your guest preview into Trips..." : "Your account is ready."
  );

  useEffect(() => {
    if (!shouldClaim) return;

    let active = true;

    async function claimPreview() {
      try {
        const response = await fetch("/api/guest-preview/claim", {
          method: "POST",
        });

        const data = await response.json();
        if (!active) return;

        if (data.claimed && data.tripId) {
          setStatus("done");
          setMessage("Your preview is saved. Opening your trip workspace...");
          router.replace(`/trips/${data.tripId}?welcome=1`);
          return;
        }

        setStatus("idle");
        setMessage("No guest preview was waiting to be claimed. You can start fresh now.");
      } catch {
        if (!active) return;
        setStatus("idle");
        setMessage("We couldn’t import the guest preview automatically, but your account is ready.");
      }
    }

    void claimPreview();

    return () => {
      active = false;
    };
  }, [router, shouldClaim]);

  return (
    <div className="app-shell mx-auto max-w-3xl rounded-[36px] border border-white/55 bg-[linear-gradient(180deg,#ffffff,#f6f4ef)] p-8 shadow-[0_24px_56px_rgba(22,40,64,0.08)] sm:p-12">
      <p className="section-label">Welcome to Wandrly</p>
      <h1 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2.8rem] font-bold leading-[0.95] tracking-[-0.05em] text-[#024785] sm:text-[3.5rem]">
        {status === "claiming" ? "Finishing your first trip..." : "You’re signed in and ready to plan."}
      </h1>
      <p className="mt-5 text-base leading-8 text-[#61738C]">{message}</p>

      {status !== "claiming" ? (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/ai-trip-planner">
            <Button className="rounded-full px-6">Generate my itinerary</Button>
          </Link>
          <Link href="/trips">
            <Button
              variant="outline"
              className="rounded-full border-white/55 bg-white/72 px-6 text-[#14518b]"
            >
              Open Trips
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
