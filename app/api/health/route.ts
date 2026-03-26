import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim() && !value.startsWith("your-"));
}

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        ok: true,
        service: "wandrly",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: "reachable",
        providers: {
          openai: hasValue(process.env.OPENAI_API_KEY),
          gemini: hasValue(process.env.GEMINI_API_KEY),
          githubAuth: hasValue(process.env.AUTH_GITHUB_ID),
          googleAuth: hasValue(process.env.AUTH_GOOGLE_ID),
          emailAuth:
            hasValue(process.env.AUTH_EMAIL_SERVER_HOST) &&
            hasValue(process.env.AUTH_EMAIL_FROM),
        },
        latencyMs: Date.now() - startedAt,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "wandrly",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: "unreachable",
        latencyMs: Date.now() - startedAt,
        error:
          error instanceof Error ? error.message : "Unknown health check error.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
