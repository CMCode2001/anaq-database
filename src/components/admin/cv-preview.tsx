import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { driveEmbedUrl } from "@/lib/drive";

/**
 * Aperçu intégré du CV.
 *
 * Deux cas s'affichent en aperçu : un lien Google Drive reconnu (via son URL
 * `/preview` dédiée à l'intégration), ou un PDF hébergé directement (upload
 * dans Supabase Storage, ou tout autre lien direct vers un .pdf) -les
 * navigateurs savent afficher un PDF nativement dans une iframe. Un fichier
 * Word ou un lien non reconnu retombe sur le seul lien d'ouverture : aucun
 * navigateur ne rend un .docx dans une iframe.
 *
 * Le lien d'ouverture reste toujours affiché, indispensable pour un fichier
 * Drive non partagé publiquement (l'aperçu affiche alors l'écran de demande
 * d'accès de Google, à l'intérieur du cadre).
 */
export function CvPreview({ url }: { url: string }) {
  const driveUrl = driveEmbedUrl(url);
  const isDirectPdf = !driveUrl && url.toLowerCase().split("?")[0]?.endsWith(".pdf");
  const embedUrl = driveUrl ?? (isDirectPdf ? url : null);

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

      {driveUrl ? (
        <p className="text-xs text-muted-foreground">
          Aperçu vide ou accès demandé ? Le fichier n&apos;est probablement pas partagé en
          « Toute personne disposant du lien » sur Google Drive -un réglage du fichier, pas de
          la plateforme.
        </p>
      ) : null}
    </div>
  );
}
