import { cn } from "@/lib/utils";
import * as React from "react";

export default function GlassWidget({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-[20px] backdrop-saturate-[180%] shadow-[0_8px_40px_rgba(0,0,0,0.45)]",
        className
      )}
      {...props}
    />
  );
}
