"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteAdminAction, type ActionState } from "@/app/admin/actions";
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

/** Confirmation obligatoire avant toute suppression d'un compte administrateur. */
export function DeleteAdminDialog({
  adminId,
  adminName,
}: {
  adminId: string;
  adminName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(deleteAdminAction, {});

  React.useEffect(() => {
    if (state.success) {
      toast.success("Compte supprimé", { description: state.success });
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error("Suppression impossible", { description: state.error });
    }
  }, [state, router]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 aria-hidden="true" />
          Supprimer
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce compte administrateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le compte de <strong className="text-foreground">{adminName}</strong> et son accès à
            la plateforme seront définitivement supprimés. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={formAction}>
          <input type="hidden" name="userId" value={adminId} />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
            <ConfirmButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
