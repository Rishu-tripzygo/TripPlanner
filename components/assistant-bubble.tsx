"use client";

import { MessageSquareText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AssistantBubble() {
  const pathname = usePathname();

  if (pathname.startsWith("/assistant")) {
    return null;
  }

  return (
    <Link
      href="/assistant"
      className="fixed bottom-22 right-3 z-40 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-4 py-3 text-sm font-medium text-white shadow-[0_20px_40px_rgba(2,71,133,0.16)] transition hover:translate-y-[-1px] hover:brightness-105 sm:bottom-6 sm:right-6"
    >
      <MessageSquareText className="size-4" />
      <span className="hidden sm:inline">Ask Wandrly Assistant</span>
    </Link>
  );
}
