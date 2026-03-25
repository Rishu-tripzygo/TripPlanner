"use server";

import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export const login = async () => {
  redirect("/auth/signin?callbackUrl=/trips");
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
};
