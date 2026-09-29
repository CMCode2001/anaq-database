import { z } from "zod";

import { DOMAINS } from "@/lib/data/disciplines";
import { resolveNationality } from "@/lib/data/nationalities";
import { PROFESSION_CATEGORIES } from "@/lib/data/professions";
import type { ExpertInput } from "@/lib/repositories/expert-repository";

/**
 * Schéma du formulaire (création / édition d'une fiche expert).
 *
 * Domaine et catégorie de profession sont des listes fermées (huit domaines
 * REESAO, six catégories de profession) : on les fait choisir directement
 * via un menu plutôt que de les deviner à partir d'un texte libre -plus
 * rapide à saisir, et sans risque de mauvaise classification. La
 * nationalité reste du texte libre (nouveaux gentilés possibles) ; elle est
 * classée automatiquement (pays, région) dans `toExpertInput` ci-dessous.
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
  professionCategory: z.enum(PROFESSION_CATEGORIES, {
    message: "La catégorie de profession est obligatoire.",
  }),
  specialty: z
    .string()
    .trim()
    .min(2, "La discipline est obligatoire.")
    .max(300),
  domain: z.enum(DOMAINS, { message: "Le domaine est obligatoire." }),
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
 * Traduit les valeurs du formulaire vers le contrat du repository. Domaine
 * et catégorie de profession viennent directement du formulaire ; seule la
 * nationalité est encore résolue automatiquement (pays, région, ISO2).
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
    professionCategory: values.professionCategory,
    domain: values.domain,
    specialtyRaw: values.specialty,
    cvUrl: values.cvUrl?.trim() || null,
    notes: values.notes?.trim() || null,
  };
}
