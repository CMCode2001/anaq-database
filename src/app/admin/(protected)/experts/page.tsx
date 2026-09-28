import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { UserRoundPlus } from "lucide-react";

import { ExpertsFilters } from "@/components/admin/experts-filters";
import { ExpertsTable } from "@/components/admin/experts-table";
import { ExportButtons } from "@/components/admin/export-buttons";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getExpertFacets, listExperts } from "@/lib/services/experts";
import { parseExpertQuery, type RawSearchParams } from "@/lib/validation/filters";

export const metadata: Metadata = { title: "Experts" };
export const dynamic = "force-dynamic";

export default function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Experts</h1>

        <div className="flex items-center gap-2">
          <ExportButtons />
          <Button asChild size="sm">
            <Link href="/admin/experts/new">
              <UserRoundPlus aria-hidden="true" />
              Ajouter un expert
            </Link>
          </Button>
        </div>
      </header>

      <Suspense fallback={<ExpertsPageSkeleton />}>
        <ExpertsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ExpertsContent({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const query = parseExpertQuery(await searchParams);
  const [result, facets] = await Promise.all([listExperts(query), getExpertFacets()]);

  return (
    <div className="space-y-5">
      <ExpertsFilters
        query={query}
        domains={facets.domains}
        regions={facets.regions}
        professionCategories={facets.professionCategories}
      />
      <ExpertsTable result={result} query={query} />
      <Pagination result={result} query={query} />
    </div>
  );
}

function ExpertsPageSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-[220px] w-full rounded-2xl" />
      <Skeleton className="h-[420px] w-full rounded-2xl" />
    </div>
  );
}
