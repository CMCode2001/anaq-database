"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExpertQuery } from "@/types/expert";

const ALL = "__all__";

interface ExpertsFiltersProps {
  query: ExpertQuery;
  domains: string[];
  regions: string[];
  professionCategories: string[];
}

/**
 * Recherche et filtres de la liste des experts.
 *
 * Trois filtres : le domaine scientifique, la région géographique et la
 * catégorie de profession -les trois axes de répartition mis en avant sur
 * le tableau de bord. La recherche libre couvre le nom, l'établissement,
 * la nationalité et la spécialité précise.
 */
export function ExpertsFilters({
  query,
  domains,
  regions,
  professionCategories,
}: ExpertsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(query.search ?? "");
  const [, startTransition] = React.useTransition();

  React.useEffect(() => {
    setSearch(query.search ?? "");
  }, [query.search]);

  const pushWith = React.useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }

      params.delete("page");

      startTransition(() => {
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
      });
    },
    [pathname, router, searchParams],
  );

  // Recherche différée : on n’interroge le serveur qu’après une pause de saisie.
  React.useEffect(() => {
    const current = query.search ?? "";
    if (search === current) return;

    const timer = setTimeout(() => {
      pushWith({ search: search.trim() || undefined });
    }, 400);

    return () => clearTimeout(timer);
  }, [search, query.search, pushWith]);

  const hasActiveFilters = Boolean(
    query.search || query.domain || query.region || query.professionCategory,
  );

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm no-print">
      <div className="min-w-0 space-y-2">
        <Label htmlFor="search">Recherche</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom, établissement, nationalité, spécialité…"
            className="pl-11"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="domain-filter">Domaine</Label>
          <Select
            value={query.domain ?? ALL}
            onValueChange={(value) => pushWith({ domain: value === ALL ? undefined : value })}
          >
            <SelectTrigger id="domain-filter">
              <SelectValue placeholder="Tous les domaines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les domaines</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="region-filter">Région</Label>
          <Select
            value={query.region ?? ALL}
            onValueChange={(value) => pushWith({ region: value === ALL ? undefined : value })}
          >
            <SelectTrigger id="region-filter">
              <SelectValue placeholder="Toutes les régions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les régions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="profession-filter">Profession</Label>
          <Select
            value={query.professionCategory ?? ALL}
            onValueChange={(value) =>
              pushWith({ professionCategory: value === ALL ? undefined : value })
            }
          >
            <SelectTrigger id="profession-filter">
              <SelectValue placeholder="Toutes les professions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les professions</SelectItem>
              {professionCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Les filtres actifs s’appliquent également à l’export Excel.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              pushWith({
                search: undefined,
                domain: undefined,
                region: undefined,
                professionCategory: undefined,
              })
            }
          >
            <X aria-hidden="true" />
            Réinitialiser
          </Button>
        </div>
      ) : null}
    </div>
  );
}
