import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";
import { BrandMark } from "@/components/brand-mark";
import { SetupNotice } from "@/components/setup-notice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Connexion administrateur",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; reason?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { redirect, reason } = await searchParams;

  return (
    <div className="bg-institutional flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark height={52} />
          <h1 className="text-xl font-bold tracking-tight">
            Espace administrateur
          </h1>
        </div>

        {reason === "forbidden" ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-medium text-destructive"
          >
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Votre session n&apos;autorise pas l&apos;accès à cet espace.
              Veuillez vous reconnecter avec un compte administrateur.
            </span>
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Accès réservé aux agents habilités du réseau QA-Doc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm redirectTo={redirect} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
