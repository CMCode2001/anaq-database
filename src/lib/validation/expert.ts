import { z } from "zod";

import { resolveDomain } from "@/lib/data/disciplines";
import { resolveNationality } from "@/lib/data/nationalities";
import { resolveProfessionCategory } from "@/lib/data/professions";
import type { ExpertInput } from "@/lib/repositories/expert-repository";

/**
 * Schéma du formulaire (création / édition d'une fiche expert).
 *
 * Volontairement calqué sur les colonnes de la base source (prénom, nom,
 * nationalité, établissement, profession, discipline, CV) : un administrateur
 * qui a l'habitude du fichier Excel retrouve les mêmes champs. La
 * classification (nationalité canonique, domaine, catégorie de profession)
 * est déduite automatiquement côté serveur -voir `toExpertInput` ci-dessous.
 */
export const expertFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(100),
  lastName: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100),
  nationality: z
    .string()
    .trim()
    .min(2, "La nationalité est obligatoire.")
    .max(100),
  institution: z.string().trim().max(200).optional().or(z.literal("")),
  profession: z
    .string()
    .trim()
    .min(2, "La profession est obligatoire.")
    .max(200),
  specialty: z
    .string()
    .trim()
    .min(2, "La discipline est obligatoire.")
    .max(300),
  cvUrl: z
    .string()
    .trim()
    .url("Le lien du CV doit être une URL valide.")
    .max(500)
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type ExpertFormValues = z.infer<typeof expertFormSchema>;

/**
 * Traduit les valeurs du formulaire vers le contrat du repository, en
 * appliquant la même classification que l'import initial : la base reste
 * cohérente que la fiche vienne du fichier Excel d'origine ou d'une saisie
 * manuelle ultérieure.
 */
export function toExpertInput(values: ExpertFormValues): ExpertInput {
  const nationalityInfo = resolveNationality(values.nationality);

  return {
    firstName: values.firstName,
    lastName: values.lastName,
    nationalityRaw: values.nationality,
    nationality: nationalityInfo.label,
    country: nationalityInfo.country,
    countryCode: nationalityInfo.iso2,
    region: nationalityInfo.region,
    institution: values.institution?.trim() || null,
    professionRaw: values.profession,
    professionCategory: resolveProfessionCategory(values.profession),
    domain: resolveDomain(values.specialty),
    specialtyRaw: values.specialty,
    cvUrl: values.cvUrl?.trim() || null,
    notes: values.notes?.trim() || null,
  };
}
