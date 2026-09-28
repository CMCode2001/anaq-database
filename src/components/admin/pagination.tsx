import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PageSizeSelect } from "@/components/admin/page-size-select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildExpertSearchParams } from "@/lib/validation/filters";
import type { ExpertQuery, PaginatedExperts } from "@/types/expert";

const NUMBER_FORMATTER = new Intl.NumberFormat("fr-FR");

/** Pagination par liens : fonctionne sans JavaScript, indexable par le clavier. */
export function Pagination({
  result,
  query,
}: {
  result: PaginatedExperts;
  query: ExpertQuery;
}) {
  if (result.total === 0) return null;

  const first = (result.page - 1) * result.pageSize + 1;
  const last = Math.min(result.page * result.pageSize, result.total);

  const href = (page: number) => {
    const params = buildExpertSearchParams({ ...query, page });
    const queryString = params.toString();
    return queryString ? `/admin/experts?${queryString}` : "/admin/experts";
  };

  const hasPrevious = result.page > 1;
  const hasNext = result.page < result.pageCount;

  return (
    <nav
      aria-label="Pagination des experts"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row no-print"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
        Experts{" "}
        <span className="font-medium text-foreground tabular-nums">
          {NUMBER_FORMATTER.format(first)}–{NUMBER_FORMATTER.format(last)}
        </span>{" "}
        sur{" "}
        <span className="font-medium text-foreground tabular-nums">
            {NUMBER_FORMATTER.format(result.total)}
          </span>
        </p>

        <PageSizeSelect pageSize={result.pageSize} />
      </div>

      <div className="flex items-center gap-2">
        {hasPrevious ? (
          <Link
            href={href(result.page - 1)}
            rel="prev"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ChevronLeft aria-hidden="true" />
            Précédent
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50",
            )}
          >
            <ChevronLeft aria-hidden="true" />
            Précédent
          </span>
        )}

        <span className="px-2 text-sm text-muted-foreground tabular-nums">
          Page {result.page} / {result.pageCount}
        </span>

        {hasNext ? (
          <Link
            href={href(result.page + 1)}
            rel="next"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Suivant
            <ChevronRight aria-hidden="true" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50",
            )}
          >
            Suivant
            <ChevronRight aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
