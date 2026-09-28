import { toIsoDay } from "@/lib/utils";

/** Nommage normalisé des fichiers exportés : experts_qadoc_2026-09-28.xlsx */
export function expertsExportFilename(extension: "xlsx") {
  return `experts_qadoc_${toIsoDay()}.${extension}`;
}

/** En-tête HTTP téléchargement, avec repli ASCII pour les vieux clients. */
export function contentDisposition(filename: string) {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(
    filename,
  )}`;
}
