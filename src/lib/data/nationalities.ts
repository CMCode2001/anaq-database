/**
 * Table de correspondance « nationalité brute (saisie libre au formulaire) »
 * → nationalité canonique, pays et région géographique.
 *
 * Construite à la main à partir des 29 valeurs distinctes réellement présentes
 * dans la base source (fautes de frappe, casse et doubles nationalités
 * comprises) : un dictionnaire generique de gentilés ferait deviner des
 * correspondances au lieu de documenter les vraies données.
 */
export interface NationalityInfo {
  /** Libellé affiché, casse corrigée. */
  label: string;
  /** Pays (ou paire de pays pour une double nationalité). */
  country: string;
  /** Code ISO 3166-1 alpha-2, absent pour les doubles nationalités. */
  iso2: string | null;
  /** Région géographique, pour les regroupements du tableau de bord. */
  region: string;
}

const RAW_TO_INFO: Record<string, NationalityInfo> = {
  "tunisienne": { label: "Tunisienne", country: "Tunisie", iso2: "TN", region: "Afrique du Nord" },
  "mocambicana": { label: "Mozambicaine", country: "Mozambique", iso2: "MZ", region: "Afrique australe" },
  "sénégalaise": { label: "Sénégalaise", country: "Sénégal", iso2: "SN", region: "Afrique de l'Ouest" },
  "malienne": { label: "Malienne", country: "Mali", iso2: "ML", region: "Afrique de l'Ouest" },
  "guinéenne": { label: "Guinéenne", country: "Guinée", iso2: "GN", region: "Afrique de l'Ouest" },
  "marocaine": { label: "Marocaine", country: "Maroc", iso2: "MA", region: "Afrique du Nord" },
  "congolaise": { label: "Congolaise", country: "Congo", iso2: "CG", region: "Afrique centrale" },
  "rd congolaise": { label: "Congolaise (RDC)", country: "République démocratique du Congo", iso2: "CD", region: "Afrique centrale" },
  "mauritanienne": { label: "Mauritanienne", country: "Mauritanie", iso2: "MR", region: "Afrique de l'Ouest" },
  "kenyan": { label: "Kényane", country: "Kenya", iso2: "KE", region: "Afrique de l'Est" },
  "ugandan": { label: "Ougandaise", country: "Ouganda", iso2: "UG", region: "Afrique de l'Est" },
  "béninoise": { label: "Béninoise", country: "Bénin", iso2: "BJ", region: "Afrique de l'Ouest" },
  "burkinabè": { label: "Burkinabè", country: "Burkina Faso", iso2: "BF", region: "Afrique de l'Ouest" },
  "burundaise": { label: "Burundaise", country: "Burundi", iso2: "BI", region: "Afrique de l'Est" },
  "camerounaise": { label: "Camerounaise", country: "Cameroun", iso2: "CM", region: "Afrique centrale" },
  "rwandan": { label: "Rwandaise", country: "Rwanda", iso2: "RW", region: "Afrique de l'Est" },
  "ivoirienne": { label: "Ivoirienne", country: "Côte d'Ivoire", iso2: "CI", region: "Afrique de l'Ouest" },
  "tchadienne": { label: "Tchadienne", country: "Tchad", iso2: "TD", region: "Afrique centrale" },
  "nigerienne": { label: "Nigérienne", country: "Niger", iso2: "NE", region: "Afrique de l'Ouest" },
  "nigerian": { label: "Nigériane", country: "Nigeria", iso2: "NG", region: "Afrique de l'Ouest" },
  "togolaise": { label: "Togolaise", country: "Togo", iso2: "TG", region: "Afrique de l'Ouest" },
  "algérienne": { label: "Algérienne", country: "Algérie", iso2: "DZ", region: "Afrique du Nord" },
  "brasileira": { label: "Brésilienne", country: "Brésil", iso2: "BR", region: "Amérique" },
  "angolana": { label: "Angolaise", country: "Angola", iso2: "AO", region: "Afrique australe" },
  "espagne": { label: "Espagnole", country: "Espagne", iso2: "ES", region: "Europe" },

  // Doubles nationalités : pas de code pays unique, région combinée.
  "marocaine et francaise": { label: "Marocaine et Française", country: "Maroc / France", iso2: null, region: "Afrique du Nord / Europe" },
  "portugaise-française": { label: "Portugaise et Française", country: "Portugal / France", iso2: null, region: "Europe" },
  "francais/tunisien": { label: "Française et Tunisienne", country: "France / Tunisie", iso2: null, region: "Europe / Afrique du Nord" },
  "benin and canada": { label: "Béninoise et Canadienne", country: "Bénin / Canada", iso2: null, region: "Afrique de l'Ouest / Amérique" },
};

function normalizeKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");
}

// Les clés ci-dessus sont volontairement accentuées pour rester lisibles ;
// on construit ici un second index sans accents pour matcher la saisie réelle
// (« Sénégalaise » et « senegalaise » doivent tomber sur la même fiche).
const NORMALIZED_INDEX = new Map<string, NationalityInfo>();
for (const [key, info] of Object.entries(RAW_TO_INFO)) {
  NORMALIZED_INDEX.set(normalizeKey(key), info);
}

export const UNKNOWN_NATIONALITY: NationalityInfo = {
  label: "Non renseignée",
  country: "Non renseigné",
  iso2: null,
  region: "Non renseignée",
};

/** Résout une nationalité brute vers sa fiche canonique (pays, région, ISO2). */
export function resolveNationality(raw: string | null | undefined): NationalityInfo {
  if (!raw?.trim()) return UNKNOWN_NATIONALITY;
  const match = NORMALIZED_INDEX.get(normalizeKey(raw));
  if (match) return match;

  // Valeur non répertoriée (nouvelle saisie future) : on affiche la casse
  // d'origine plutôt que d'échouer silencieusement.
  return { label: raw.trim(), country: raw.trim(), iso2: null, region: "Autre" };
}
