"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function PWARegister() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function syncOnlineState() {
      setIsOffline(!navigator.onLine);
    }

    syncOnlineState();
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });
    }

    if ("caches" in window) {
      void caches.keys().then((keys) => {
        keys
          .filter((key) => key.startsWith("wandrly-"))
          .forEach((key) => {
            void caches.delete(key);
          });
      });
    }

    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
    };
  }, []);

  return (
    <>
      {isOffline ? (
        <div className="fixed inset-x-4 top-24 z-[110] mx-auto flex max-w-xl items-center gap-3 rounded-full bg-[#B84A43] px-4 py-3 text-sm text-white shadow-[0_12px_24px_rgba(184,74,67,0.24)]">
          <WifiOff className="size-4" />
          You are offline. Some Wandrly features may be unavailable until the connection returns.
        </div>
      ) : null}
    </>
  );
}
