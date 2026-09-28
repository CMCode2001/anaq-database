import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import { NewAdminForm } from "@/components/admin/new-admin-form";
import { TeamTable } from "@/components/admin/team-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/guards";
import { listAdmins } from "@/lib/services/admins";

export const metadata: Metadata = { title: "Administrateurs" };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const identity = await requireAdmin();

  if (identity.role !== "super_admin") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardContent className="flex items-start gap-3 p-6">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <div className="space-y-1">
              <h1 className="font-semibold text-foreground">Accès réservé</h1>
              <p className="text-sm text-muted-foreground">
                Seuls les super-administrateurs peuvent gérer les comptes de la plateforme.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const admins = await listAdmins();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Administrateurs</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un administrateur</CardTitle>
          <CardDescription>
            Crée immédiatement le compte et l&apos;accès à la plateforme -aucune étape
            supplémentaire dans Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewAdminForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comptes existants</CardTitle>
          <CardDescription>{admins.length} compte(s).</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamTable admins={admins} currentUserId={identity.userId} />
        </CardContent>
      </Card>
    </div>
  );
}
