import { Settings2 } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Écran affiché tant que la connexion Supabase n'est pas configurée.
 * Évite une erreur 500 opaque au premier démarrage et rappelle la marche
 * à suivre documentée dans le README.
 */
export function SetupNotice() {
  return (
    <div className="bg-institutional flex min-h-dvh items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-5 p-8">
          <BrandMark height={40} />

          <div className="flex items-start gap-3 rounded-2xl border border-border bg-gold-soft/70 p-4">
            <Settings2
              className="mt-0.5 size-5 shrink-0 text-gold-ink"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <h1 className="font-semibold">Configuration requise</h1>
              <p className="text-sm text-muted-foreground">
                La connexion à Supabase n&apos;est pas encore configurée.
              </p>
            </div>
          </div>

          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              Copier <code className="font-mono text-xs">.env.example</code> vers{" "}
              <code className="font-mono text-xs">.env.local</code>
            </li>
            <li>
              Renseigner{" "}
              <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              et{" "}
              <code className="font-mono text-xs">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
            </li>
            <li>
              Exécuter les migrations SQL de{" "}
              <code className="font-mono text-xs">supabase/migrations/</code>
            </li>
            <li>Redémarrer le serveur de développement</li>
          </ol>

          <p className="text-xs text-muted-foreground">
            La procédure complète figure au chapitre « Installation » du
            fichier <code className="font-mono">README.md</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
