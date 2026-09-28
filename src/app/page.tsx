import Link from "next/link";
import { ArrowRight, BarChart3, Users } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ORG } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="bg-institutional flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <BrandMark height={56} />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {ORG.appTitle}
            </h1>
            <p className="text-sm text-muted-foreground">{ORG.appSubtitle}</p>
          </div>
        </div>

        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted p-4 text-center">
              <Users className="size-6 text-gold-ink" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Un réseau d&apos;experts recensé par nationalité, institution,
                profession et domaine scientifique.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted p-4 text-center">
              <BarChart3 className="size-6 text-gold-ink" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Un tableau de bord avec des statistiques claires sur sa
                répartition.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button asChild size="lg">
          <Link href="/admin/login">
            Accéder à l&apos;espace administrateur
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
