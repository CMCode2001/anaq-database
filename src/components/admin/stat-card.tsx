import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  /** Teinte de la pastille, pour distinguer les indicateurs d un coup d oeil. */
  tone?: "gold" | "navy" | "success" | "neutral";
}

const TONES = {
  gold: "bg-primary/20 text-gold-ink",
  navy: "bg-navy/10 text-navy",
  success: "bg-success/12 text-success",
  neutral: "bg-muted text-muted-foreground",
} as const;

const NUMBER_FORMATTER = new Intl.NumberFormat("fr-FR");

/**
 * Indicateur chiffre : icone a gauche, libelle au centre, valeur a droite.
 *
 * Une seule ligne, hauteur fixe : les quatre cartes d une rangee s alignent
 * au pixel, et l oeil balaie la colonne de chiffres a droite sans avoir a
 * sauter d une carte a l autre.
 *
 * `min-w-0` est indispensable : en tant qu element de grille, la carte a
 * `min-width: auto` et sa colonne ne peut pas descendre sous la largeur
 * minimale de son contenu.
 */
export function StatCard({ label, value, icon, tone = "gold" }: StatCardProps) {
  return (
    <Card className="min-w-0 transition-shadow hover:shadow-md">
      <CardContent className="flex h-[5.25rem] items-center gap-3 px-4 py-0">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-[18px]",
            TONES[tone],
          )}
        >
          {icon}
        </span>

        <p className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        <p className="shrink-0 text-2xl font-bold leading-none tracking-tight tabular-nums text-foreground">
          {NUMBER_FORMATTER.format(value)}
        </p>
      </CardContent>
    </Card>
  );
}
