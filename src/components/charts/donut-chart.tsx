"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { CHART_PALETTE } from "@/components/charts/palette";
import { truncate } from "@/lib/utils";
import type { CountBucket } from "@/types/common";

/**
 * Anneau de repartition, avec le total au centre.
 *
 * Un anneau ne se lit bien qu'au-dela d'une poignee de parts : au-dela de
 * cinq, les tranches deviennent illisibles. Le reste est donc regroupe sous
 * « Autres », et la legende porte les valeurs chiffrees.
 */
export function DonutChart({
  data,
  total,
  centerLabel,
  ariaLabel,
  unitLabel = "fiche",
}: {
  data: CountBucket[];
  total: number;
  centerLabel: string;
  ariaLabel: string;
  unitLabel?: string;
}) {
  const parts = React.useMemo(() => {
    const top = data.slice(0, 5);
    const reste = total - top.reduce((sum, bucket) => sum + bucket.count, 0);
    return reste > 0 ? [...top, { label: "Autres", count: reste }] : top;
  }, [data, total]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative h-[190px] w-full sm:w-[190px] sm:shrink-0">
        <div role="img" aria-label={ariaLabel} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={parts}
                dataKey="count"
                nameKey="label"
                innerRadius="64%"
                outerRadius="94%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {parts.map((part, index) => (
                  <Cell
                    key={part.label}
                    fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--card-foreground)",
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [
                  `${value} ${unitLabel}${value > 1 ? "s" : ""}`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Total au centre de l'anneau : la question la plus frequente. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {total}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {centerLabel}
          </span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2.5">
        {parts.map((part, index) => {
          const share = total > 0 ? Math.round((part.count / total) * 100) : 0;

          return (
            <li key={part.label} className="flex items-center gap-2.5 text-sm">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    CHART_PALETTE[index % CHART_PALETTE.length],
                }}
              />
              <span
                className="min-w-0 flex-1 truncate text-foreground"
                title={part.label}
              >
                {truncate(part.label, 32)}
              </span>
              <span className="shrink-0 font-medium tabular-nums text-foreground">
                {part.count}
              </span>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {share} %
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
