"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { updateAdminAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AdminAccount } from "@/lib/services/admins";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      Enregistrer
    </Button>
  );
}

/** Modification du nom, de l'email ou du rôle d'un administrateur existant. */
export function EditAdminDialog({ admin }: { admin: AdminAccount }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(updateAdminAction, {});

  useEffect(() => {
    if (!open) return;
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error("Échec de la modification", { description: state.error });
    }
  }, [state, open, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Pencil aria-hidden="true" />
          Modifier
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le compte</DialogTitle>
          <DialogDescription>
            {admin.full_name ?? admin.email}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="userId" value={admin.user_id} />

          <FormField id={`edit-fullName-${admin.user_id}`} label="Nom complet" required>
            <Input
              id={`edit-fullName-${admin.user_id}`}
              name="fullName"
              required
              defaultValue={admin.full_name ?? ""}
            />
          </FormField>

          <FormField id={`edit-email-${admin.user_id}`} label="Adresse email" required>
            <Input
              id={`edit-email-${admin.user_id}`}
              name="email"
              type="email"
              required
              defaultValue={admin.email ?? ""}
            />
          </FormField>

          <FormField id={`edit-role-${admin.user_id}`} label="Rôle" required>
            <select
              id={`edit-role-${admin.user_id}`}
              name="role"
              defaultValue={admin.role}
              className={cn(
                "flex h-11 w-full rounded-full border border-input bg-card px-6 text-sm shadow-sm transition-colors",
                "hover:border-primary/60",
                "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)]",
              )}
            >
              <option value="admin">Administrateur</option>
              <option value="super_admin">Super administrateur</option>
            </select>
          </FormField>

          {state.error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-medium text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{state.error}</span>
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <SaveButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
