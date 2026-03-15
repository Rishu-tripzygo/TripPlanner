"use client";

import { useEffect, useState } from "react";

export default function AITypingEffect({
  text,
  speed = 18,
  className = "",
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    setVisibleText("");
    const words = text.split(" ");
    let index = 0;

    const interval = window.setInterval(() => {
      index += 1;
      setVisibleText(words.slice(0, index).join(" "));
      if (index >= words.length) {
        window.clearInterval(interval);
      }
    }, speed * 10);

    return () => window.clearInterval(interval);
  }, [speed, text]);

  return (
    <p className={className}>
      {visibleText}
      <span className="ml-1 inline-block h-[1em] w-[1px] animate-pulse bg-current align-middle" />
    </p>
  );
}
