/**
 * Reconnaissance des liens Google Drive et construction de leur URL
 * d'aperçu intégrable.
 *
 * Les CV de la base sont des liens de partage Google Drive, sous deux formes
 * possibles : `drive.google.com/open?id=<id>` (format des réponses au
 * formulaire d'origine) et `drive.google.com/file/d/<id>/view`. Google Drive
 * expose par ailleurs un troisième chemin, `/file/d/<id>/preview`, pensé
 * pour être intégré en `<iframe>` -c'est lui que l'on construit ici.
 */

const DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);

/** Extrait l'identifiant de fichier d'un lien Google Drive, ou `null`. */
export function driveFileId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (!DRIVE_HOSTS.has(parsed.hostname)) return null;

  const queryId = parsed.searchParams.get("id");
  if (queryId) return queryId;

  const pathMatch = parsed.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return pathMatch?.[1] ?? null;
}

/**
 * URL d'aperçu intégrable, ou `null` si le lien n'est pas reconnu comme un
 * fichier Google Drive.
 *
 * Ne s'affiche correctement que si le fichier est partagé en « Toute
 * personne disposant du lien » côté Drive -un fichier restreint à des
 * personnes précises affiche un écran de demande d'accès à l'intérieur de
 * l'aperçu, ce que l'application ne peut ni détecter ni contourner : c'est
 * un réglage du fichier, pas de l'application.
 */
export function driveEmbedUrl(url: string): string | null {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}
