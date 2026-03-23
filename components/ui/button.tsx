import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[#00C2FF]/30 focus-visible:ring-[3px] focus-visible:ring-[#00C2FF]/25 aria-invalid:ring-destructive/20 aria-invalid:border-destructive active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#024785,#2B5F9E)] text-white shadow-[0_20px_40px_rgba(2,71,133,0.14)] hover:brightness-105",
        destructive:
          "bg-destructive text-white shadow-[0_8px_24px_rgba(239,68,68,0.24)] hover:brightness-110",
        outline:
          "border border-[var(--border)] bg-white text-[var(--foreground)] shadow-[0_12px_24px_rgba(26,28,27,0.05)] hover:bg-[#F4F3F1]",
        secondary:
          "bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-[0_12px_24px_rgba(26,28,27,0.05)] hover:brightness-[1.01]",
        ghost: "text-[var(--foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
        link: "text-[#00C2FF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 px-6 has-[>svg]:px-4",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
