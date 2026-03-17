"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TripShareRecord } from "@/lib/phase-one-types";
import { Check, Copy, Mail, Send, Share2 } from "lucide-react";

export default function TripSharePanel({
  tripId,
  tripTitle,
}: {
  tripId: string;
  tripTitle: string;
}) {
  const [share, setShare] = useState<TripShareRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadShare() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/trip-shares/${tripId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load trip share settings.");
        }

        if (!cancelled) {
          setShare(data as TripShareRecord);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load trip share settings."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadShare();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const shareUrl = useMemo(() => {
    if (!share) return "";
    if (typeof window === "undefined") return `/shared/${share.token}`;
    return `${window.location.origin}/shared/${share.token}`;
  }, [share]);

  async function updatePublicState(isPublic: boolean) {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/trip-shares/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update share visibility.");
      }

      setShare(data as TripShareRecord);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to update sharing."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-label">Trip Sharing</p>
            <CardTitle className="mt-2 text-2xl text-white">
              Public link and share actions
            </CardTitle>
          </div>
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#8B9BB4]">
            {share?.isPublic ? "Public" : "Private"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-7 text-[#8B9BB4]">
          Create a read-only trip page you can send to friends. Collaboration and invite-based
          editing can build on this next.
        </p>

        {isLoading ? (
          <div className="h-[112px] animate-pulse rounded-[18px] border border-white/8 bg-white/[0.03]" />
        ) : (
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4A5568]">Share URL</p>
            <p className="mt-3 break-all text-sm leading-7 text-[#D8E2F1]">
              {shareUrl || "Link unavailable"}
            </p>
          </div>
        )}

        {error ? (
          <div className="rounded-[14px] border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#FFB4B4]">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={share?.isPublic ? "outline" : "default"}
            onClick={() => void updatePublicState(!share?.isPublic)}
            disabled={isLoading || isSaving}
          >
            <span className="inline-flex items-center gap-2">
              <Share2 className="size-4" />
              {isSaving
                ? "Updating..."
                : share?.isPublic
                  ? "Make Private"
                  : "Publish Link"}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => void copyLink()}
            disabled={!share?.isPublic}
          >
            <span className="inline-flex items-center gap-2">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy Link"}
            </span>
          </Button>

          <a
            href={
              share?.isPublic
                ? `https://wa.me/?text=${encodeURIComponent(
                    `Take a look at my trip plan for ${tripTitle}: ${shareUrl}`
                  )}`
                : undefined
            }
            target="_blank"
            rel="noreferrer"
          >
            <Button type="button" variant="outline" disabled={!share?.isPublic}>
              <span className="inline-flex items-center gap-2">
                <Send className="size-4" />
                WhatsApp
              </span>
            </Button>
          </a>

          <a
            href={
              share?.isPublic
                ? `mailto:?subject=${encodeURIComponent(
                    `Trip plan: ${tripTitle}`
                  )}&body=${encodeURIComponent(
                    `Here is my shared trip page for ${tripTitle}: ${shareUrl}`
                  )}`
                : undefined
            }
          >
            <Button type="button" variant="outline" disabled={!share?.isPublic}>
              <span className="inline-flex items-center gap-2">
                <Mail className="size-4" />
                Email
              </span>
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
