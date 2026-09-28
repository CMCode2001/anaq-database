import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { driveEmbedUrl } from "@/lib/drive";

/**
 * Aperçu intégré du CV lorsque le lien est reconnu comme un fichier Google
 * Drive, avec le lien d'ouverture en repli -indispensable pour un fichier
 * non partagé publiquement (l'aperçu affiche alors l'écran de demande
 * d'accès de Google, à l'intérieur du cadre) ou un lien qui n'est pas un
 * lien Drive.
 */
export function CvPreview({ url }: { url: string }) {
  const embedUrl = driveEmbedUrl(url);

  return (
    <div className="space-y-3">
      {embedUrl ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          <iframe
            src={embedUrl}
            title="Aperçu du CV"
            loading="lazy"
            allow="autoplay"
            className="h-[650px] w-full sm:h-[850px]"
          />
        </div>
      ) : null}

      <Button asChild variant="outline" size="sm">
        <a href={url} target="_blank" rel="noreferrer">
          Ouvrir le document
          <ExternalLink aria-hidden="true" />
        </a>
      </Button>

      {embedUrl ? (
        <p className="text-xs text-muted-foreground">
          Aperçu vide ou accès demandé ? Le fichier n&apos;est probablement pas partagé en
          « Toute personne disposant du lien » sur Google Drive -un réglage du fichier, pas de
          la plateforme.
        </p>
      ) : null}
    </div>
  );
}
