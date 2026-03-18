"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotificationRecord } from "@/lib/phase-one-types";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export default function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  async function loadFeed() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load notifications.");
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }

  async function markAsRead(notificationId?: string) {
    setIsMutating(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationId ? { notificationId } : { markAll: true }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update notifications.");
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // keep last known state
    } finally {
      setIsMutating(false);
    }
  }

  useEffect(() => {
    void loadFeed();
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[#00C2FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#08090E]">
            {Math.min(unreadCount, 9)}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-14 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-[20px] border border-[var(--border)] bg-[var(--surface-1)] p-4 shadow-[0_16px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="section-label">Notifications</p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                Reminder center
              </h3>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isMutating || unreadCount === 0}
              onClick={() => void markAsRead()}
            >
              <CheckCheck className="size-4" />
              Mark all
            </Button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <>
                <div className="h-20 animate-pulse rounded-[16px] bg-white/[0.05]" />
                <div className="h-20 animate-pulse rounded-[16px] bg-white/[0.05]" />
              </>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void markAsRead(notification.id)}
                  className={cn(
                    "block w-full rounded-[16px] border p-4 text-left transition",
                    notification.read
                      ? "border-white/6 bg-white/[0.025]"
                      : "border-[#00C2FF]/20 bg-[#00C2FF]/8"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-7 text-[var(--foreground)]">
                      {notification.message}
                    </p>
                    {!notification.read ? (
                      <span className="mt-1 size-2 rounded-full bg-[#00C2FF]" />
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
                    <span>{formatRelativeDate(notification.createdAt)}</span>
                    {notification.tripId ? (
                      <Link
                        href={`/trips/${notification.tripId}`}
                        className="text-[#00C2FF] hover:underline"
                        onClick={() => setIsOpen(false)}
                      >
                        Open trip
                      </Link>
                    ) : null}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-[var(--muted-foreground)]">
                No reminders yet. Once a trip gets closer, countdown alerts and prep prompts will
                show up here.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
