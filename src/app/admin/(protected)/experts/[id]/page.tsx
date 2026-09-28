import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { DeleteExpertDialog } from "@/components/admin/delete-expert-dialog";
import { ExpertForm } from "@/components/admin/expert-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatFullName } from "@/lib/utils";
import { getExpert } from "@/lib/services/experts";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const expert = await getExpert(id);
  return { title: expert ? formatFullName(expert.firstName, expert.lastName) : "Expert" };
}

export default async function ExpertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expert = await getExpert(id);

  if (!expert) notFound();

  const fullName = formatFullName(expert.firstName, expert.lastName);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/experts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour à la liste
        </Link>

        <DeleteExpertDialog
          expertId={expert.id}
          expertName={fullName}
          redirectTo="/admin/experts"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{fullName}</CardTitle>
          <CardDescription>Classification déduite de la fiche</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{expert.domain}</Badge>
            <Badge variant="secondary">{expert.professionCategory}</Badge>
            <Badge variant="outline">{expert.region}</Badge>
          </div>

          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Nationalité</dt>
              <dd className="font-medium text-foreground">
                {expert.nationality}
                {expert.nationalityRaw !== expert.nationality ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (saisie : {expert.nationalityRaw})
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pays</dt>
              <dd className="font-medium text-foreground">{expert.country}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Établissement</dt>
              <dd className="font-medium text-foreground">
                {expert.institution ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Profession (saisie)</dt>
              <dd className="font-medium text-foreground">{expert.professionRaw}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Discipline / spécialité (saisie)</dt>
              <dd className="font-medium text-foreground">{expert.specialtyRaw}</dd>
            </div>
            {expert.cvUrl ? (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">CV</dt>
                <dd>
                  <a
                    href={expert.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-gold-ink hover:underline"
                  >
                    Ouvrir le document
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modifier la fiche</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpertForm expert={expert} />
        </CardContent>
      </Card>

      <Separator className="opacity-0" aria-hidden="true" />

      <div className="pb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/experts">
            <ArrowLeft aria-hidden="true" />
            Retour à la liste
          </Link>
        </Button>
      </div>
    </div>
  );
}
