"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteExpertAction, type ActionState } from "@/app/admin/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Bouton de confirmation.
 * On n'utilise pas `AlertDialogAction` : celui-ci referme la boîte de dialogue
 * dès le clic, ce qui masquerait l'état de chargement. La fermeture est pilotée
 * par le résultat de la Server Action.
 */
function ConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 aria-hidden="true" />
      )}
      Supprimer définitivement
    </Button>
  );
}

interface DeleteExpertDialogProps {
  expertId: string;
  expertName: string;
  /** Page à ouvrir après suppression (depuis la fiche détaillée). */
  redirectTo?: string;
  trigger?: React.ReactNode;
}

/** Confirmation obligatoire avant toute suppression de fiche. */
export function DeleteExpertDialog({
  expertId,
  expertName,
  redirectTo,
  trigger,
}: DeleteExpertDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(
    deleteExpertAction,
    {},
  );

  React.useEffect(() => {
    if (state.success) {
      toast.success("Fiche supprimée", { description: state.success });
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } else if (state.error) {
      toast.error("Suppression impossible", { description: state.error });
    }
  }, [state, redirectTo, router]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="text-destructive">
            <Trash2 aria-hidden="true" />
            Supprimer
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette fiche ?</AlertDialogTitle>
          <AlertDialogDescription>
            La fiche de <strong className="text-foreground">{expertName}</strong>{" "}
            sera définitivement supprimée de la base de données. Cette action
            est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction}>
          <input type="hidden" name="id" value={expertId} />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
            <ConfirmButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
