"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { CvPreview } from "@/components/admin/cv-preview";
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
import { formatFullName } from "@/lib/utils";
import type { Expert } from "@/types/expert";

/**
 * Le formulaire de modification est masqué par défaut : la fiche est d'abord
 * une vue de consultation, pas un formulaire. Le bouton « Modifier » le
 * révèle, et un enregistrement réussi le referme -la fiche au-dessus est
 * alors rafraîchie pour refléter les nouvelles valeurs.
 */
export function ExpertDetailView({ expert }: { expert: Expert }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);

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

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing((current) => !current)}
          >
            <Pencil aria-hidden="true" />
            Modifier
          </Button>
          <DeleteExpertDialog
            expertId={expert.id}
            expertName={fullName}
            redirectTo="/admin/experts"
          />
        </div>
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
          </dl>
        </CardContent>
      </Card>

      {expert.cvUrl ? (
        <Card>
          <CardHeader>
            <CardTitle>CV</CardTitle>
          </CardHeader>
          <CardContent>
            <CvPreview url={expert.cvUrl} />
          </CardContent>
        </Card>
      ) : null}

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Modifier la fiche</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpertForm
              expert={expert}
              onSaved={() => {
                setEditing(false);
                router.refresh();
              }}
            />
          </CardContent>
        </Card>
      ) : null}

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
