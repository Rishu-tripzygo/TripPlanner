"use client";

import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles } from "lucide-react";

interface SignInPanelProps {
  callbackUrl: string;
  availableProviders: {
    email: boolean;
    google: boolean;
    github: boolean;
  };
  error?: string | null;
}

function mapError(error?: string | null) {
  if (!error) return null;
  if (error === "OAuthAccountNotLinked") {
    return "This email is already linked to a different sign-in method.";
  }
  if (error === "Verification") {
    return "That email link expired or could not be verified. Please request a new one.";
  }
  return "Sign-in did not complete. Please try again.";
}

export default function SignInPanel({
  callbackUrl,
  availableProviders,
  error,
}: SignInPanelProps) {
  const [email, setEmail] = useState("");
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const errorMessage = useMemo(() => mapError(error), [error]);

  async function handleOAuth(provider: "google" | "github") {
    setLoadingProvider(provider);
    await signIn(provider, { callbackUrl });
  }

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingProvider("nodemailer");

    const result = await signIn("nodemailer", {
      email,
      redirect: false,
      callbackUrl,
    });

    setLoadingProvider(null);

    if (result?.ok) {
      setEmailSent(true);
      return;
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
      <section className="app-shell overflow-hidden rounded-[36px] border border-white/55 bg-[linear-gradient(180deg,#ffffff,#f6f4ef)] p-8 shadow-[0_24px_56px_rgba(22,40,64,0.08)] sm:p-10 lg:p-12">
        <div className="max-w-xl">
          <p className="section-label">Welcome to Wandrly</p>
          <h1 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[3rem] font-bold leading-[0.92] tracking-[-0.05em] text-[#024785] sm:text-[4.2rem]">
            Sign in when you want the trip to stay with you.
          </h1>
          <p className="mt-5 text-base leading-8 text-[#61738C] sm:text-lg">
            Generate itineraries, keep route and budget connected, and move every trip into one
            calm workspace you can return to.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Start with AI and save the active itinerary automatically.",
              "Keep route, budget, documents, packing, and notes in sync.",
              "Come back anytime without rebuilding your plan from scratch.",
              "Preview Wandrly first if you are not ready to create an account yet.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/55 bg-white/62 px-5 py-5 text-sm leading-7 text-[#4a617b] shadow-[0_12px_28px_rgba(20,81,139,0.05)] backdrop-blur-xl"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="app-shell rounded-[36px] border border-white/55 bg-white/64 p-8 shadow-[0_24px_56px_rgba(22,40,64,0.08)] backdrop-blur-[24px] sm:p-10">
        <div className="mx-auto max-w-md">
          <p className="section-label">Access your trips</p>
          <h2 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.4rem] font-bold leading-[0.95] tracking-[-0.04em] text-[#0f3460]">
            Pick the easiest way to continue.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#61738C]">
            Use email for the smoothest sign-in, or continue with Google or GitHub if those are
            already connected to your account.
          </p>

          {errorMessage ? (
            <div className="mt-6 rounded-[20px] border border-[rgba(186,62,62,0.18)] bg-[rgba(255,244,244,0.92)] px-4 py-4 text-sm leading-7 text-[#8c3f3f]">
              {errorMessage}
            </div>
          ) : null}

          {emailSent ? (
            <div className="mt-8 rounded-[24px] border border-white/55 bg-[#F4F3F1] px-5 py-6 text-sm leading-7 text-[#4a617b]">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-white text-[#14518b]">
                <Mail className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#0f3460]">Check your email</h3>
              <p className="mt-2">
                We sent a secure sign-in link to <span className="font-semibold">{email}</span>.
                It stays active for 10 minutes.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 rounded-full"
                onClick={() => setEmailSent(false)}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              {availableProviders.email ? (
                <form className="mt-8 space-y-4" onSubmit={handleEmail}>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#0f3460]">
                      Email magic link
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="h-14 w-full rounded-[20px] border border-white/55 bg-white/76 px-4 text-sm text-[#0f3460] outline-none transition focus:border-[#8db7e0] focus:bg-white"
                      required
                    />
                  </label>

                  <Button
                    type="submit"
                    disabled={!email || loadingProvider === "nodemailer"}
                    className="h-14 w-full rounded-full text-base"
                  >
                    {loadingProvider === "nodemailer" ? "Sending link..." : "Continue with email"}
                  </Button>
                </form>
              ) : (
                <div className="mt-8 rounded-[22px] border border-white/55 bg-[#F4F3F1] px-5 py-5 text-sm leading-7 text-[#61738C]">
                  Email magic links are ready in the product, but SMTP is not configured in this
                  environment yet.
                </div>
              )}

              <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-[0.22em] text-[#8a9ab0]">
                <span className="h-px flex-1 bg-[rgba(20,81,139,0.12)]" />
                Or continue with
                <span className="h-px flex-1 bg-[rgba(20,81,139,0.12)]" />
              </div>

              <div className="mt-6 space-y-3">
                {availableProviders.google ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 w-full rounded-full border-white/55 bg-white/72 text-base"
                    onClick={() => handleOAuth("google")}
                  >
                    {loadingProvider === "google" ? "Connecting..." : "Continue with Google"}
                  </Button>
                ) : null}

                {availableProviders.github ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 w-full rounded-full border-white/55 bg-white/72 text-base"
                    onClick={() => handleOAuth("github")}
                  >
                    {loadingProvider === "github" ? "Connecting..." : "Continue with GitHub"}
                  </Button>
                ) : null}

                {!availableProviders.google && !availableProviders.github ? (
                  <div className="rounded-[22px] border border-white/55 bg-[#F4F3F1] px-5 py-5 text-sm leading-7 text-[#61738C]">
                    Social sign-in providers are not configured in this environment yet.
                  </div>
                ) : null}
              </div>
            </>
          )}

          <div className="mt-8 rounded-[24px] border border-white/55 bg-[linear-gradient(135deg,rgba(20,81,139,0.08),rgba(255,255,255,0.62))] px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white text-[#14518b]">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0f3460]">Want to try Wandrly first?</p>
                <p className="mt-1 text-sm leading-7 text-[#61738C]">
                  Generate one guest preview before you create an account.
                </p>
              </div>
            </div>

            <Link
              href="/ai-trip-planner?mode=guest"
              className="mt-4 inline-flex items-center rounded-full border border-white/55 bg-white/78 px-5 py-3 text-sm font-semibold text-[#14518b]"
            >
              Continue as guest
            </Link>
          </div>

          <p className="mt-6 text-xs leading-6 text-[#7A8EA8]">
            By continuing, you agree to Wandrly&apos;s{" "}
            <Link className="underline" href="/terms">
              Terms
            </Link>{" "}
            and{" "}
            <Link className="underline" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
