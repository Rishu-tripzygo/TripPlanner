"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TripCollaboratorRecord,
  TripShareRecord,
} from "@/lib/phase-one-types";
import {
  Check,
  Copy,
  Mail,
  Send,
  Share2,
  Trash2,
  UserPlus2,
} from "lucide-react";

type ShareSettingsResponse = TripShareRecord & {
  viewerRole: "OWNER" | "EDITOR" | "VIEWER";
  canManage: boolean;
};

export default function TripSharePanel({
  tripId,
  tripTitle,
}: {
  tripId: string;
  tripTitle: string;
}) {
  const [share, setShare] = useState<ShareSettingsResponse | null>(null);
  const [collaborators, setCollaborators] = useState<TripCollaboratorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCollaboratorSaving, setIsCollaboratorSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [inviteDraft, setInviteDraft] = useState<{
    email: string;
    role: "EDITOR" | "VIEWER";
  }>({
    email: "",
    role: "EDITOR",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadShareState() {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const [shareResponse, collaboratorResponse] = await Promise.all([
          fetch(`/api/trip-shares/${tripId}`),
          fetch(`/api/trips/${tripId}/collaborators`),
        ]);
        const shareData = await shareResponse.json();
        const collaboratorData = await collaboratorResponse.json();

        if (!shareResponse.ok) {
          throw new Error(shareData.error || "Failed to load trip share settings.");
        }

        if (!collaboratorResponse.ok) {
          throw new Error(
            collaboratorData.error || "Failed to load trip collaborators."
          );
        }

        if (!cancelled) {
          setShare(shareData as ShareSettingsResponse);
          setCollaborators(collaboratorData as TripCollaboratorRecord[]);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load trip sharing."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadShareState();

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
    setSuccessMessage(null);

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

      setShare(data as ShareSettingsResponse);
      setSuccessMessage(
        isPublic
          ? "Public link is live. Anyone with the link can view this trip."
          : "Public link is private again. Collaborator access is unchanged."
      );
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

  async function inviteCollaborator() {
    if (!inviteDraft.email.trim()) return;

    setIsCollaboratorSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/trips/${tripId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteDraft.email.trim(),
          role: inviteDraft.role,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite collaborator.");
      }

      setCollaborators((current) => {
        const next = current.filter((entry) => entry.id !== data.id);
        return [...next, data as TripCollaboratorRecord];
      });
      setInviteDraft({ email: "", role: "EDITOR" });
      setSuccessMessage("Collaborator access updated.");
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Unable to invite collaborator."
      );
    } finally {
      setIsCollaboratorSaving(false);
    }
  }

  async function updateCollaboratorRole(
    collaboratorId: string,
    role: "EDITOR" | "VIEWER"
  ) {
    setIsCollaboratorSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/trips/${tripId}/collaborators/${collaboratorId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update collaborator role.");
      }

      setCollaborators((current) =>
        current.map((entry) =>
          entry.id === collaboratorId ? (data as TripCollaboratorRecord) : entry
        )
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update collaborator role."
      );
    } finally {
      setIsCollaboratorSaving(false);
    }
  }

  async function removeCollaborator(collaboratorId: string) {
    setIsCollaboratorSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/trips/${tripId}/collaborators/${collaboratorId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove collaborator.");
      }

      setCollaborators((current) =>
        current.filter((entry) => entry.id !== collaboratorId)
      );
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove collaborator."
      );
    } finally {
      setIsCollaboratorSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-label">Trip Sharing</p>
            <CardTitle className="mt-2 text-2xl text-white">
              Public link and collaborators
            </CardTitle>
          </div>
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#8B9BB4]">
            {share?.canManage
              ? share?.isPublic
                ? "Owner / Public"
                : "Owner / Private"
              : `${share?.viewerRole || "Viewer"} access`}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-7 text-[#8B9BB4]">
          Share a polished public trip page when the plan is ready, or invite
          collaborators to help shape the route and prep work inside Wandrly.
        </p>

        {isLoading ? (
          <div className="h-[112px] animate-pulse rounded-[18px] border border-white/8 bg-white/[0.03]" />
        ) : (
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4A5568]">
              Share URL
            </p>
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

        {successMessage ? (
          <div className="rounded-[14px] border border-[#14518b]/20 bg-[#14518b]/10 px-4 py-3 text-sm text-[#D8E2F1]">
            {successMessage}
          </div>
        ) : null}

        <div className="space-y-4 rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={share?.isPublic ? "outline" : "default"}
              onClick={() => void updatePublicState(!share?.isPublic)}
              disabled={isLoading || isSaving || !share?.canManage}
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

          {!share?.canManage ? (
            <p className="text-sm leading-7 text-[#8B9BB4]">
              Only the trip owner can change public visibility or invite
              collaborators. Your current access is{" "}
              {share?.viewerRole?.toLowerCase() || "viewer"}.
            </p>
          ) : (
            <div className="grid gap-3 rounded-[16px] border border-white/8 bg-black/10 p-4 lg:grid-cols-[1.2fr_0.7fr_auto]">
              <input
                value={inviteDraft.email}
                onChange={(event) =>
                  setInviteDraft((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="Invite by email"
                className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-[#8B9BB4] focus:border-white/20 focus:outline-none"
              />
              <select
                value={inviteDraft.role}
                onChange={(event) =>
                  setInviteDraft((current) => ({
                    ...current,
                    role: event.target.value as "EDITOR" | "VIEWER",
                  }))
                }
                className="rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white focus:border-white/20 focus:outline-none"
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <Button
                type="button"
                onClick={() => void inviteCollaborator()}
                disabled={isCollaboratorSaving || !inviteDraft.email.trim()}
                className="rounded-full"
              >
                <span className="inline-flex items-center gap-2">
                  <UserPlus2 className="size-4" />
                  {isCollaboratorSaving ? "Saving..." : "Invite"}
                </span>
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8B9BB4]">
              Collaborators
            </p>
            <p className="text-sm text-[#61738C]">
              Editors can update the trip. Viewers can follow along without changing it.
            </p>
          </div>

          <div className="space-y-3">
            {collaborators.length > 0 ? (
              collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="grid gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] p-4 lg:grid-cols-[1fr_auto_auto]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#D8E2F1]">
                      {collaborator.name || collaborator.email}
                    </p>
                    <p className="mt-1 text-sm text-[#8B9BB4]">
                      {collaborator.email}
                    </p>
                  </div>

                  {collaborator.isOwner ? (
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[#D8E2F1]">
                      Owner
                    </div>
                  ) : share?.canManage ? (
                    <select
                      value={collaborator.role}
                      onChange={(event) =>
                        void updateCollaboratorRole(
                          collaborator.id,
                          event.target.value as "EDITOR" | "VIEWER"
                        )
                      }
                      disabled={isCollaboratorSaving}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
                    >
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  ) : (
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[#D8E2F1]">
                      {collaborator.role}
                    </div>
                  )}

                  {collaborator.isOwner ? (
                    <div />
                  ) : share?.canManage ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void removeCollaborator(collaborator.id)}
                      disabled={isCollaboratorSaving}
                      className="rounded-full"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Trash2 className="size-4" />
                        Remove
                      </span>
                    </Button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm leading-7 text-[#8B9BB4]">
                No collaborators yet.{" "}
                {share?.canManage
                  ? "Invite someone when you want help reviewing or editing the trip."
                  : "The owner can invite collaborators here when needed."}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
