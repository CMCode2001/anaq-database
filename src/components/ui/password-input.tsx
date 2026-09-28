"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Champ mot de passe avec bouton « afficher / masquer ».
 *
 * Le bouton reste accessible au clavier et annonce son état via
 * `aria-pressed`. Le champ redevient masqué à chaque montage : l'état n'est
 * jamais mémorisé.
 */
const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-14", className)}
        {...props}
      />

      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={
          visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
        }
        aria-pressed={visible}
        aria-controls={props.id}
        title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className={cn(
          "absolute right-2.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full",
          "text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        )}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
