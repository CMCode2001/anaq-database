import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Users } from "lucide-react";

import { ExpertRow } from "@/components/admin/expert-row";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { buildExpertSearchParams } from "@/lib/validation/filters";
import type { ExpertQuery, ExpertSortField, PaginatedExperts } from "@/types/expert";

const SORTABLE_COLUMNS: Array<{ field: ExpertSortField; label: string }> = [
  { field: "first_name", label: "Prénom" },
  { field: "last_name", label: "Nom" },
  { field: "nationality", label: "Nationalité" },
  { field: "institution", label: "Établissement" },
  { field: "domain", label: "Domaine" },
];

/**
 * Tableau des experts (Server Component).
 *
 * Le tri passe par des liens : il fonctionne sans JavaScript et reste
 * partageable via l’URL. Chaque ligne est déléguée à un composant client,
 * seul à avoir besoin d’interactivité.
 */
export function ExpertsTable({
  result,
  query,
}: {
  result: PaginatedExperts;
  query: ExpertQuery;
}) {
  if (result.items.length === 0) {
    const filtered = Boolean(
      query.search || query.domain || query.region || query.professionCategory,
    );

    return (
      <EmptyState
        icon={<Users className="size-5" />}
        title={
          filtered
            ? "Aucun expert ne correspond à ces critères"
            : "Aucun expert enregistré pour le moment"
        }
        description={
          filtered
            ? "Modifiez la recherche ou les filtres pour élargir les résultats."
            : "Importez la base source ou ajoutez une première fiche."
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {SORTABLE_COLUMNS.map((column) => (
              <TableHead
                key={column.field}
                aria-sort={ariaSort(query, column.field)}
              >
                <SortLink column={column.field} label={column.label} query={query} />
              </TableHead>
            ))}

            <TableHead>Profession</TableHead>

            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {result.items.map((expert) => (
            <ExpertRow key={expert.id} expert={expert} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Valeur `aria-sort` de la colonne, annoncée par les lecteurs d’écran. */
function ariaSort(
  query: ExpertQuery,
  field: ExpertSortField,
): "ascending" | "descending" | "none" {
  if (query.sort !== field) return "none";
  return query.direction === "asc" ? "ascending" : "descending";
}

/** En-tête cliquable : bascule asc/desc et repart en page 1. */
function SortLink({
  column,
  label,
  query,
}: {
  column: ExpertSortField;
  label: string;
  query: ExpertQuery;
}) {
  const isActive = query.sort === column;
  const nextDirection = isActive && query.direction === "desc" ? "asc" : "desc";

  const params = buildExpertSearchParams({
    ...query,
    sort: column,
    direction: nextDirection,
    page: 1,
  });

  const Icon = !isActive
    ? ArrowUpDown
    : query.direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <Link
      href={`/admin/experts?${params.toString()}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:text-foreground",
        isActive && "text-gold-ink",
      )}
    >
      {label}
      <Icon className="size-3.5" aria-hidden="true" />
    </Link>
  );
}
