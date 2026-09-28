import { ORG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Hauteur du badge en pixels. */
  height?: number;
  className?: string;
  /** Affiche la dénomination complète à côté du badge. */
  tagline?: boolean;
  /** Empile le libellé sous le badge plutôt qu'à sa droite (barre latérale). */
  stacked?: boolean;
}

/**
 * Marque de l'application : un badge monogramme (pas de logo officiel fourni)
 * plutôt qu'une image, pour ne pas dépendre d'un fichier binaire versionné.
 * Remplacer par un vrai logo en éditant simplement ce composant.
 */
export function BrandMark({
  height = 38,
  className,
  tagline = false,
  stacked = false,
}: BrandMarkProps) {
  const fontSize = Math.round(height * 0.42);

  return (
    <span
      className={cn(
        "inline-flex",
        stacked ? "flex-col items-start gap-2" : "items-center gap-3",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex shrink-0 items-center justify-center rounded-2xl bg-navy font-bold text-primary"
          style={{ height, width: height, fontSize }}
        >
          QA
        </span>
        <span
          className="font-bold tracking-tight text-foreground"
          style={{ fontSize: Math.round(height * 0.46) }}
        >
          {ORG.shortName}
        </span>
      </span>

      {tagline ? (
        <span
          className={cn(
            "text-[11px] font-light leading-snug text-muted-foreground",
            stacked
              ? "block"
              : "hidden sm:block sm:max-w-[22rem] sm:border-l sm:border-border sm:pl-3",
          )}
        >
          {ORG.name}
        </span>
      ) : null}
    </span>
  );
}
