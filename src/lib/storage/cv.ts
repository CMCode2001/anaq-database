import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Téléversement des CV dans Supabase Storage.
 *
 * Passe par le client authentifié de la session (pas le client
 * `service_role`) : l'upload est autorisé par les policies RLS du bucket
 * `cvs` (supabase/migrations/0004_cv_storage.sql), réservées aux
 * administrateurs actifs -exactement le même principe que pour la table
 * `experts`.
 *
 * Le bucket est public : comme pour un lien Google Drive partagé, quiconque
 * possède l'URL peut ouvrir le fichier, mais le nom du fichier (un UUID) le
 * rend impossible à deviner ou à lister sans y être autorisé.
 */

const BUCKET = "cvs";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export class CvUploadError extends Error {}

export async function uploadExpertCv(file: File): Promise<string> {
  if (file.size === 0) {
    throw new CvUploadError("Le fichier est vide.");
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new CvUploadError("Le fichier dépasse la taille maximale autorisée (10 Mo).");
  }

  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    throw new CvUploadError("Format de fichier non accepté (PDF ou Word uniquement).");
  }

  const supabase = await createServerSupabaseClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    throw new CvUploadError("Le téléversement du CV a échoué.");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
