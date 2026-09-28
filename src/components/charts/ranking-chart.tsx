"use client";

import { truncate } from "@/lib/utils";
import type { CountBucket } from "@/types/common";

/**
 * Classement en barres horizontales.
 *
 * Volontairement en HTML et CSS plutot qu'en SVG : pour une dizaine de barres
 * avec un libelle, une valeur et une part, le rendu natif est plus net, se
 * redimensionne mieux et reste lisible par un lecteur d'ecran.
 */
export function RankingChart({
  data,
  ariaLabel,
}: {
  data: CountBucket[];
  ariaLabel: string;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((bucket) => bucket.count), 1);
  const total = data.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <ol aria-label={ariaLabel} className="space-y-3.5">
      {data.map((bucket, index) => {
        const width = Math.max(4, Math.round((bucket.count / max) * 100));
        const share = total > 0 ? Math.round((bucket.count / total) * 100) : 0;

        return (
          <li key={bucket.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground">
                  {index + 1}.
                </span>
                <span
                  className="min-w-0 truncate font-medium text-foreground"
                  title={bucket.label}
                >
                  {truncate(bucket.label, 34)}
                </span>
              </span>

              <span className="shrink-0 tabular-nums text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {bucket.count}
                </span>{" "}
                · {share} %
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
