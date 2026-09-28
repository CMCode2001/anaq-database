import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-full border border-input bg-card px-6 py-2 text-base shadow-sm transition-colors",
        "placeholder:text-muted-foreground",
        "hover:border-primary/60",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
