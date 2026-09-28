"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Power } from "lucide-react";
import { toast } from "sonner";

import { toggleAdminActiveAction, type ActionState } from "@/app/admin/actions";
import { DeleteAdminDialog } from "@/components/admin/delete-admin-dialog";
import { EditAdminDialog } from "@/components/admin/edit-admin-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { AdminAccount } from "@/lib/services/admins";

/** Doit être un descendant du <form>, pas le composant qui le rend : c'est la
 *  seule façon dont `useFormStatus` connaît son état de soumission. */
function ToggleSubmitButton({ isActive }: { isActive: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      disabled={pending}
      className={isActive ? "text-destructive hover:bg-destructive/10" : ""}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Power aria-hidden="true" />}
      {isActive ? "Désactiver" : "Réactiver"}
    </Button>
  );
}

function ToggleButton({ admin }: { admin: AdminAccount }) {
  const [state, formAction] = useActionState<ActionState, FormData>(toggleAdminActiveAction, {});

  useEffect(() => {
    if (state.error) toast.error("Échec", { description: state.error });
    else if (state.success) toast.success(state.success);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={admin.user_id} />
      <input type="hidden" name="isActive" value={(!admin.is_active).toString()} />
      <ToggleSubmitButton isActive={admin.is_active} />
    </form>
  );
}

export function TeamTable({
  admins,
  currentUserId,
}: {
  admins: AdminAccount[];
  currentUserId: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead>Ajouté le</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.user_id}>
              <TableCell className="font-medium">{admin.full_name ?? "-"}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>
                <Badge variant={admin.role === "super_admin" ? "default" : "secondary"}>
                  {admin.role === "super_admin" ? "Super administrateur" : "Administrateur"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={admin.is_active ? "success" : "destructive"}>
                  {admin.is_active ? "Actif" : "Désactivé"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {admin.lastSignInAt ? formatDateTime(admin.lastSignInAt) : "Jamais connecté"}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(admin.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <EditAdminDialog admin={admin} />
                  {admin.user_id === currentUserId ? (
                    <span className="text-xs text-muted-foreground">Votre compte</span>
                  ) : (
                    <>
                      <ToggleButton admin={admin} />
                      <DeleteAdminDialog
                        adminId={admin.user_id}
                        adminName={admin.full_name ?? admin.email ?? "cet administrateur"}
                      />
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
