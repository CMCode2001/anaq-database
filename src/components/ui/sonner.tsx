"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Notifications de succès / d'erreur.
 * Monté une seule fois dans le layout racine.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-border bg-card text-card-foreground shadow-lg",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
