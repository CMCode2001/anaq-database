import * as XLSX from "xlsx";

import { ORG } from "@/lib/constants";
import { formatDateTime, formatFirstName, formatLastName } from "@/lib/utils";
import type { Expert, ExpertQuery } from "@/types/expert";

/**
 * Génération du classeur Excel.
 *
 * Le fichier contient deux feuilles :
 *   « Experts » -une ligne par expert, en-têtes figés et auto-filtre ;
 *   « Informations » -contexte de l'export (filtres actifs, total).
 */

const HEADERS = [
  "Prénom",
  "Nom",
  "Nationalité",
  "Pays",
  "Région",
  "Établissement",
  "Profession",
  "Catégorie de profession",
  "Domaine",
  "Discipline / spécialité",
  "CV",
  "Ajouté le",
] as const;

const COLUMN_WIDTHS = [18, 18, 18, 20, 22, 34, 30, 22, 32, 40, 40, 18];

export function buildExpertsWorkbook(
  experts: Expert[],
  query: Pick<
    ExpertQuery,
    "search" | "institution" | "domain" | "region" | "professionCategory"
  >,
): Buffer {
  const rows = experts.map((expert) => [
    formatFirstName(expert.firstName),
    formatLastName(expert.lastName),
    expert.nationality,
    expert.country,
    expert.region,
    expert.institution ?? "",
    expert.professionRaw,
    expert.professionCategory,
    expert.domain,
    expert.specialtyRaw,
    expert.cvUrl ?? "",
    formatDateTime(expert.createdAt),
  ]);

  const sheet = XLSX.utils.aoa_to_sheet([[...HEADERS], ...rows]);
  sheet["!cols"] = COLUMN_WIDTHS.map((width) => ({ wch: width }));
  sheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(rows.length, 1), c: HEADERS.length - 1 },
    }),
  };

  const info = XLSX.utils.aoa_to_sheet([
    [ORG.appTitle],
    [ORG.name],
    [],
    ["Date de génération", formatDateTime(new Date())],
    ["Recherche", query.search ?? "-"],
    ["Filtre établissement", query.institution ?? "-"],
    ["Filtre domaine", query.domain ?? "-"],
    ["Filtre région", query.region ?? "-"],
    ["Filtre catégorie de profession", query.professionCategory ?? "-"],
    ["Nombre total d'experts", experts.length],
  ]);
  info["!cols"] = [{ wch: 30 }, { wch: 52 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Experts");
  XLSX.utils.book_append_sheet(workbook, info, "Informations");

  workbook.Props = {
    Title: "Liste des experts QA-Doc",
    Subject: ORG.appTitle,
    Author: ORG.shortName,
    CreatedDate: new Date(),
  };

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
