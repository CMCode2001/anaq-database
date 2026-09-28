"use client";

import { FileText, Trash2 } from "lucide-react";

import { DeleteExpertDialog } from "@/components/admin/delete-expert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Actions d’une ligne du tableau.
 *
 * Il n’y a pas de bouton « ouvrir » : la ligne entière est cliquable. Ne
 * restent que les actions qui ne sont pas la navigation — ouvrir le CV et
 * supprimer.
 */
export function ExpertRowActions({
  expertId,
  expertName,
  cvUrl,
}: {
  expertId: string;
  expertName: string;
  cvUrl: string | null;
}) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {cvUrl ? (
        <Button
          asChild
          variant="ghost"
          size="icon"
          title={`Ouvrir le CV de ${expertName}`}
        >
          <a href={cvUrl} target="_blank" rel="noreferrer">
            <FileText aria-hidden="true" />
            <span className="sr-only">CV de {expertName}</span>
          </a>
        </Button>
      ) : null}

      <DeleteExpertDialog
        expertId={expertId}
        expertName={expertName}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title={`Supprimer la fiche de ${expertName}`}
          >
            <Trash2 aria-hidden="true" />
            <span className="sr-only">Supprimer la fiche de {expertName}</span>
          </Button>
        }
      />
    </div>
  );
}
