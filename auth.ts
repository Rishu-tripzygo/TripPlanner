import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const emailConfigured = Boolean(
  process.env.AUTH_EMAIL_SERVER_HOST &&
    process.env.AUTH_EMAIL_SERVER_PORT &&
    process.env.AUTH_EMAIL_SERVER_USER &&
    process.env.AUTH_EMAIL_SERVER_PASSWORD &&
    process.env.AUTH_EMAIL_FROM
);

const googleConfigured = Boolean(
  (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID) &&
    (process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET)
);

const githubConfigured = Boolean(
  process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
);

export const availableAuthProviders = {
  email: emailConfigured,
  google: googleConfigured,
  github: githubConfigured,
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
    newUser: "/onboarding",
  },
  providers: [
    ...(emailConfigured
      ? [
          Nodemailer({
            server: {
              host: process.env.AUTH_EMAIL_SERVER_HOST!,
              port: Number(process.env.AUTH_EMAIL_SERVER_PORT!),
              auth: {
                user: process.env.AUTH_EMAIL_SERVER_USER!,
                pass: process.env.AUTH_EMAIL_SERVER_PASSWORD!,
              },
            },
            from: process.env.AUTH_EMAIL_FROM!,
          }),
        ]
      : []),
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
            clientSecret:
              process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(githubConfigured
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID || "",
            clientSecret: process.env.AUTH_GITHUB_SECRET || "",
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
