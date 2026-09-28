import type { Metadata } from "next";

import { ExpertForm } from "@/components/admin/expert-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Ajouter un expert" };

export default function NewExpertPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Ajouter un expert
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle fiche</CardTitle>
          <CardDescription>
            La nationalité, la profession et la discipline sont classées
            automatiquement pour alimenter le tableau de bord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpertForm />
        </CardContent>
      </Card>
    </div>
  );
}
