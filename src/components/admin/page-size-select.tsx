"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PAGE_SIZE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Nombre de lignes affichées par page.
 *
 * Ce réglage a quitté la barre de filtres : il ne restreint pas les données,
 * il ne fait que régler l’affichage. Sa place est auprès de la pagination,
 * dont il dépend directement.
 */
export function PageSizeSelect({ pageSize }: { pageSize: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", value);
    // Changer la taille des pages invalide le numéro de page courant.
    params.delete("page");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span>Lignes</span>
      <select
        value={pageSize}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-8 rounded-full border border-input bg-card px-3 text-sm text-foreground shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        )}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  );
}
