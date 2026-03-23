"use client";

import { Download, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function PWARegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [promptEvent, setPromptEvent] = useState<Event | null>(null);

  useEffect(() => {
    function syncOnlineState() {
      setIsOffline(!navigator.onLine);
    }

    function beforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event);
      setCanInstall(true);
    }

    syncOnlineState();
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);
    window.addEventListener("beforeinstallprompt", beforeInstallPrompt);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }

    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
      window.removeEventListener("beforeinstallprompt", beforeInstallPrompt);
    };
  }, []);

  async function installApp() {
    const deferredPrompt = promptEvent as
      | (Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> })
      | null;
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    setCanInstall(false);
    setPromptEvent(null);
  }

  return (
    <>
      {isOffline ? (
        <div className="fixed inset-x-4 top-24 z-[110] mx-auto flex max-w-xl items-center gap-3 rounded-full bg-[#B84A43] px-4 py-3 text-sm text-white shadow-[0_12px_24px_rgba(184,74,67,0.24)]">
          <WifiOff className="size-4" />
          You are offline. Cached Wandrly pages and saved routes remain available.
        </div>
      ) : null}

      {canInstall ? (
        <button
          type="button"
          onClick={() => void installApp()}
          className="fixed bottom-22 left-3 z-40 inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-[#024785] shadow-[0_16px_30px_rgba(26,28,27,0.12)] transition hover:bg-[#F4F3F1] sm:bottom-6 sm:left-6"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">Install Wandrly</span>
          <span className="sm:hidden">Install</span>
        </button>
      ) : null}
    </>
  );
}
