/**
 * Classification des professions en six catégories, utilisées pour les
 * statistiques du tableau de bord. L'intitulé d'origine reste toujours
 * affiché (`professionRaw`) : la catégorie ne sert qu'à compter et filtrer.
 */
export const PROFESSION_CATEGORIES = [
  "Enseignant-Chercheur",
  "Enseignant",
  "Chercheur",
  "Direction / Gouvernance",
  "Assurance Qualité / Audit",
  "Doctorant / Assistant",
] as const;

export type ProfessionCategory = (typeof PROFESSION_CATEGORIES)[number] | "Autre";

function normalize(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

const KEYWORD_RULES: Array<{ pattern: RegExp; category: ProfessionCategory }> = [
  // Les intitulés de direction et d'assurance qualité sont vérifiés en premier :
  // un titre comme « Directeur de l'Assurance Qualité et Enseignant-chercheur »
  // combine plusieurs rôles, et c'est la responsabilité de pilotage qui prime.
  { pattern: /assurance qualite|lead auditor|auditeur|quality assurance|qualite de l'enseignement/, category: "Assurance Qualité / Audit" },
  { pattern: /\bdg\b|directeur|directrice|doyen|administra|vice.?president|vice.?reitora|chef de (la )?division|conseiller/, category: "Direction / Gouvernance" },
  { pattern: /doctorant|doctorante|assistant/, category: "Doctorant / Assistant" },
  { pattern: /enseignant.{0,3}chercheu|chercheu.{0,3}enseignant|enseignante chercheuse|professeur hospitalo|prof titulaire|professeur emerite|full professor|professeur en medecine/, category: "Enseignant-Chercheur" },
  { pattern: /chercheur|researcher|pesquisador/, category: "Chercheur" },
  { pattern: /enseignant|teacher|professor|docente/, category: "Enseignant" },
];

/** Résout un intitulé de profession brut vers sa catégorie canonique. */
export function resolveProfessionCategory(
  raw: string | null | undefined,
): ProfessionCategory {
  if (!raw?.trim()) return "Autre";
  const key = normalize(raw);

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(key)) return rule.category;
  }

  return "Autre";
}
