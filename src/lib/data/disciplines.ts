/**
 * Classification des disciplines.
 *
 * La base source mélange deux niveaux : un intitulé « macro-domaine »
 * trilingue (FR // EN // PT), commun à la majorité des fiches, et des
 * intitulés libres beaucoup plus précis (« Physiologie Animale, Toxicologie,
 * nanomédecine », combinaisons séparées par « ; », fautes de casse…).
 *
 * `resolveDomain` ramène n'importe quel intitulé brut à l'un des huit
 * domaines du REESAO (Réseau pour l'Excellence de l'Enseignement Supérieur
 * en Afrique de l'Ouest), utilisés pour les statistiques et les filtres. Le
 * texte d'origine reste toujours affiché intégralement (`specialtyRaw`) : on
 * classe pour compter, on n'efface jamais la précision saisie par l'expert.
 */

export const DOMAINS = [
  "Sciences de la Santé",
  "Sciences et Technologies",
  "Sciences Agronomiques",
  "Sciences Juridiques, Politiques et de l'Administration",
  "Sciences Économiques et de Gestion",
  "Sciences de l'Homme et de la Société",
  "Lettres, Langues et Arts",
  "Sciences de l'Éducation et de la Formation",
] as const;

/**
 * "Hors domaine" est le repli explicite pour un intitulé qui ne correspond
 * à aucun des huit domaines REESAO -jamais un domaine deviné par défaut. Une
 * fiche dans ce cas mérite d'être relue et reclassée à la main.
 */
export type Domain = (typeof DOMAINS)[number] | "Hors domaine";

function normalize(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");
}

/**
 * Correspondances exactes pour les 29 intitulés distincts observés dans la
 * base source (voir scripts/import-experts.mjs pour la ré-extraction).
 *
 * Le référentiel REESAO ne prévoit ni « Architecture et Urbanisme » ni
 * « Sciences de la Terre » comme domaines séparés : ces intitulés rejoignent
 * Sciences et Technologies, le domaine le plus proche.
 */
const EXACT_MATCHES: Record<string, Domain> = {
  "sciences et technologies // science and technology // ciencia e tecnologia": "Sciences et Technologies",
  "sciences de la sante // health sciences // ciencias da saude": "Sciences de la Santé",
  "sciences de l'homme et de la societe // humanities and social sciences // ciencias humanas e sociais": "Sciences de l'Homme et de la Société",
  "sciences economiques et de gestion // economics and management // economia e gestao": "Sciences Économiques et de Gestion",
  "sciences de l'education et de la formation // education and training sciences // ciencias da educacao e da formacao": "Sciences de l'Éducation et de la Formation",
  "lettres, langues et arts // literature, languages and the arts // literatura, linguas e artes": "Lettres, Langues et Arts",
  "sciences agronomiques // agricultural sciences // ciencias agrarias": "Sciences Agronomiques",
  "sciences juridiques, politiques et administratives // law, politics and public administration // direito, politica e administracao publica": "Sciences Juridiques, Politiques et de l'Administration",
  "ciencias da terra": "Sciences et Technologies",
  "architecture et urbanisme": "Sciences et Technologies",
  "securite, strategie et defense": "Sciences Juridiques, Politiques et de l'Administration",
  "ciencias da educacao": "Sciences de l'Éducation et de la Formation",
  "ciencia e tecnologia de alimentos": "Sciences Agronomiques",
  "physiologie animale, toxicologie, nanomedecine": "Sciences de la Santé",
  "sciences de l'information et de la communication": "Sciences de l'Homme et de la Société",
  "educacao e ensino de ciencias/ quimica": "Sciences de l'Éducation et de la Formation",
  "sciences de l'education (arabe)": "Sciences de l'Éducation et de la Formation",
  "religion & development": "Sciences de l'Homme et de la Société",
  "legume-soil-microorganism interactions for healthy soils, crop quality, and environmental preservation": "Sciences Agronomiques",
  "deontologie medicale et sante communautaire": "Sciences de la Santé",
  "lettres/ philosophie": "Lettres, Langues et Arts",
  "sciences exactes + technologies et spectroscopies": "Sciences et Technologies",
  "sciences psychologiques": "Sciences de la Santé",
  "analyses statistiques des systemes biologiques (biostatistique)": "Sciences de la Santé",
  "sciences de l'education et de la formation ; sciences de la sante ; sciences economiques et de gestion": "Sciences de l'Éducation et de la Formation",
  "gestion de projet": "Sciences Économiques et de Gestion",
  "sciences et techniques des activites physiques et sportives-jeunesse et loisirs (staps-jl)": "Sciences de la Santé",
  "geographie physique / hydrologie et gestion integree des ressources en eau": "Sciences et Technologies",
};

/** Filet de sécurité par mots-clés, pour un intitulé futur non répertorié. */
const KEYWORD_RULES: Array<{ pattern: RegExp; domain: Domain }> = [
  { pattern: /sante|medic|medec|sant\b|clinique|pharma|psycholog/, domain: "Sciences de la Santé" },
  { pattern: /agro|agricol|alimen|sol|soil|crop/, domain: "Sciences Agronomiques" },
  { pattern: /droit|juridi|politi|administrati|defense|strateg|securite/, domain: "Sciences Juridiques, Politiques et de l'Administration" },
  { pattern: /economi|gestion|management|finance/, domain: "Sciences Économiques et de Gestion" },
  { pattern: /education|formation|pedagog|enseignement/, domain: "Sciences de l'Éducation et de la Formation" },
  { pattern: /lettre|langue|art|litterature|philosoph/, domain: "Lettres, Langues et Arts" },
  { pattern: /homme|societe|social|humanit|communication|religion/, domain: "Sciences de l'Homme et de la Société" },
  {
    pattern: /technolog|science|ingenier|informati|spectroscop|architect|urban|terre|geograph|hydrolog|environnement|climat/,
    domain: "Sciences et Technologies",
  },
];

/** Résout un intitulé de discipline brut vers son domaine canonique. */
export function resolveDomain(raw: string | null | undefined): Domain {
  if (!raw?.trim()) return "Hors domaine";

  // Intitulés composés (« A ; B ; C ») : on classe sur le premier, en gardant
  // le texte complet ailleurs pour l'affichage et la recherche.
  const first = raw.split(";")[0] ?? raw;
  const key = normalize(first);

  const exact = EXACT_MATCHES[key];
  if (exact) return exact;

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(key)) return rule.domain;
  }

  return "Hors domaine";
}
