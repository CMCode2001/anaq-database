import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Building2,
  Globe2,
  GraduationCap,
  LayoutGrid,
  UserRoundPlus,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { RankingChart } from "@/components/charts/ranking-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/guards";
import { getExpertStats } from "@/lib/services/experts";

export const metadata: Metadata = { title: "Tableau de bord" };

// Les compteurs doivent refléter l'état réel de la base à chaque affichage.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const identity = await requireAdmin();
  const prenom = (identity.fullName?.trim() || identity.email).split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bonjour {prenom}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Répartition du réseau des experts QA-Doc
          </p>
        </div>

        <Button asChild variant="navy" size="sm">
          <Link href="/admin/experts/new">
            <UserRoundPlus aria-hidden="true" />
            Ajouter un expert
          </Link>
        </Button>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const stats = await getExpertStats();
  const vide = stats.total === 0;

  if (vide) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={<Users className="size-5" />}
            title="Aucun expert enregistré pour le moment"
            description="Importez la base source (scripts/import-experts.mjs) ou ajoutez une première fiche."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/experts/new">Ajouter un expert</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <section
        aria-label="Indicateurs de répartition"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard label="Experts" value={stats.total} icon={<Users />} tone="navy" />
        <StatCard
          label="Nationalités"
          value={stats.distinctNationalities}
          icon={<Globe2 />}
          tone="gold"
        />
        <StatCard
          label="Domaines"
          value={stats.distinctDomains}
          icon={<GraduationCap />}
          tone="success"
        />
        <StatCard
          label="Établissements"
          value={stats.distinctInstitutions}
          icon={<Building2 />}
          tone="neutral"
        />
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle>Répartition par domaine scientifique</CardTitle>
            <CardDescription>
              Les dix macro-domaines utilisés pour classer les disciplines.
            </CardDescription>
          </div>
          <LayoutGrid
            className="hidden size-5 shrink-0 text-muted-foreground sm:block"
            aria-hidden="true"
          />
        </CardHeader>
        <CardContent>
          <DonutChart
            data={stats.byDomain}
            total={stats.total}
            centerLabel="experts"
            unitLabel="expert"
            ariaLabel="Répartition des experts par domaine scientifique"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nationalités les plus représentées</CardTitle>
            <CardDescription>Les huit nationalités les plus fréquentes.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topNationalities.length === 0 ? (
              <EmptyState icon={<Globe2 className="size-5" />} title="Aucune donnée" />
            ) : (
              <RankingChart
                data={stats.topNationalities}
                ariaLabel="Classement des nationalités les plus représentées"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Établissements les plus représentés</CardTitle>
            <CardDescription>Les huit institutions les plus fréquentes.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topInstitutions.length === 0 ? (
              <EmptyState icon={<Building2 className="size-5" />} title="Aucune donnée" />
            ) : (
              <RankingChart
                data={stats.topInstitutions}
                ariaLabel="Classement des établissements les plus représentés"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition géographique</CardTitle>
            <CardDescription>Par région du monde.</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={stats.byRegion}
              total={stats.total}
              centerLabel="experts"
              unitLabel="expert"
              ariaLabel="Répartition des experts par région géographique"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professions</CardTitle>
            <CardDescription>Répartition par catégorie de profession.</CardDescription>
          </CardHeader>
          <CardContent>
            <RankingChart
              data={stats.byProfessionCategory}
              ariaLabel="Répartition des experts par catégorie de profession"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[84px] w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[260px] w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
