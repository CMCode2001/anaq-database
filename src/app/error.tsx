"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Frontière d'erreur globale.
 * Le détail technique n'est jamais affiché au visiteur : il part dans les
 * journaux serveur, l'utilisateur reçoit un message compréhensible.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] erreur non gérée", error);
  }, [error]);

  return (
    <div className="bg-institutional flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold">Une erreur est survenue</h1>
            <p className="text-sm text-muted-foreground">
              L&apos;opération n&apos;a pas pu aboutir. Vous pouvez réessayer ;
              si le problème persiste, contactez l&apos;administrateur de
              l&apos;application.
            </p>
            {error.digest ? (
              <p className="pt-2 font-mono text-xs text-muted-foreground">
                Référence : {error.digest}
              </p>
            ) : null}
          </div>

          <Button onClick={reset}>
            <RotateCcw aria-hidden="true" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
