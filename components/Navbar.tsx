"use client";

import { login, logout } from "@/lib/auth-actions";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

export default function Navbar({ session }: { session: Session | null }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/70 py-4 shadow-sm shadow-sky-100/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-950 p-2 shadow-lg shadow-sky-200/40">
            <Image src="/logo.png" alt="logo" width={32} height={32} />
          </div>
          <div>
            <span className="block text-lg font-semibold tracking-tight text-slate-950">
              Travel Planner
            </span>
            <span className="block text-xs uppercase tracking-[0.22em] text-slate-500">
              Build trips beautifully
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            href="/ai-trip-planner"
            className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 transition hover:bg-sky-100"
          >
            AI Trip Planner
          </Link>
          {session ? (
            <>
              <Link
                href="/trips"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-sky-600"
              >
                My Trips
              </Link>
              <Link
                href="/globe"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-sky-600"
              >
                Globe
              </Link>

              <button
                className="flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              className="flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              onClick={login}
            >
              Sign In
              <svg
                className="ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.24 1.83 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3.01.41 2.29-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.81 1.1.81 2.23 0 1.61-.02 2.91-.02 3.31 0 .32.22.69.83.57C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
