"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthButtonProps {
  isLoggedIn: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function AuthButton({
  isLoggedIn,
  className,
  children,
}: AuthButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const loggedIn = Boolean(session?.user) || isLoggedIn;

  const handleClick = async () => {
    if (loggedIn) {
      router.push("/trips");
    } else {
      router.push("/auth/signin?callbackUrl=/trips");
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
