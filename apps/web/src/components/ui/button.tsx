import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[color:rgba(143,250,209,0.32)] bg-[var(--accent)] px-5 py-2.5 text-[#04110d] shadow-[0_0_28px_rgba(87,227,174,0.22)] hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_0_36px_rgba(87,227,174,0.28)]",
        secondary:
          "border-[color:var(--border-strong)] bg-[var(--surface-strong)] px-5 py-2.5 text-[var(--text-primary)] hover:-translate-y-0.5 hover:bg-[var(--surface-elevated)]",
        ghost:
          "border-transparent bg-transparent px-4 py-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
