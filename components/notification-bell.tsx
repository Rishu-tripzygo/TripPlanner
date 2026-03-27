"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
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

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const panelContent = (
    <div className="relative h-full overflow-hidden rounded-[28px] border border-white/55 bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_28px_60px_rgba(22,40,64,0.14)] backdrop-blur-[28px]">
      <div className="absolute -right-6 top-2 h-24 w-24 rounded-full bg-[rgba(0,194,255,0.12)] blur-3xl" />
      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="section-label text-[#14518b]">Notifications</p>
            <h3 className="mt-2 text-lg font-semibold text-[#0f3460]">Reminder center</h3>
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

        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {isLoading ? (
            <>
              <div className="h-20 animate-pulse rounded-[18px] bg-white/45" />
              <div className="h-20 animate-pulse rounded-[18px] bg-white/45" />
            </>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => void markAsRead(notification.id)}
                className={cn(
                  "block w-full rounded-[20px] border p-4 text-left transition",
                  notification.read
                    ? "border-white/50 bg-white/44"
                    : "border-[#14518b]/18 bg-[rgba(20,81,139,0.08)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-7 text-[#30465f]">{notification.message}</p>
                  {!notification.read ? (
                    <span className="mt-1 size-2.5 shrink-0 rounded-full bg-[#14518b]" />
                  ) : null}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#7A8EA8]">
                  <span>{formatRelativeDate(notification.createdAt)}</span>
                  {notification.tripId ? (
                    <Link
                      href={`/trips/${notification.tripId}`}
                      className="font-medium text-[#14518b] hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      Open trip
                    </Link>
                  ) : null}
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-white/55 bg-white/34 p-5 text-sm leading-7 text-[#61738C]">
              No reminders yet. As soon as a saved trip has dates and gets closer, Wandrly will
              surface countdown reminders, prep nudges, and route-related prompts here.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex size-11 items-center justify-center rounded-full border border-white/55 bg-[rgba(255,255,255,0.58)] text-[#0f3460] shadow-[0_12px_28px_rgba(22,40,64,0.08)] backdrop-blur-[22px] transition hover:bg-[rgba(255,255,255,0.74)]"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[#14518b] px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-[0_6px_14px_rgba(20,81,139,0.24)]">
            {Math.min(unreadCount, 9)}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-14 z-50 hidden w-[380px] max-w-[calc(100vw-1.5rem)] sm:block">
          {panelContent}
        </div>
      ) : null}
      {isOpen && mounted
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Close notifications"
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[120] bg-[#0b1220]/24 backdrop-blur-[2px] sm:hidden"
              />
              <div className="fixed inset-x-3 bottom-4 top-20 z-[121] sm:hidden">{panelContent}</div>
            </>,
            document.body
          )
        : null}
    </div>
  );
}
