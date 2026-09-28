import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="bg-institutional flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileQuestion className="size-7" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold">Page introuvable</h1>
            <p className="text-sm text-muted-foreground">
              La page demandée n&apos;existe pas ou n&apos;est plus accessible.
            </p>
          </div>

          <Button asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
