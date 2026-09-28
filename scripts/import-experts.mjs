#!/usr/bin/env node
/**
 * Importe la feuille « BdD experts QA-Doc » du classeur Excel source et
 * génère `supabase/seed.sql` (instructions INSERT prêtes à exécuter dans
 * Supabase > SQL Editor, après les migrations).
 *
 * La feuille « BdD experts QA-Doc » est préférée à « Réponses au formulaire 1 » :
 * comparaison faite, c'est la version relue et corrigée (établissements
 * complétés, casse des nationalités harmonisée) -la véritable « base de
 * données », par opposition aux réponses brutes du formulaire.
 *
 * Les tables de correspondance (nationalité → pays/région, discipline →
 * domaine, profession → catégorie) sont volontairement dupliquées ici en
 * JavaScript simple : ce script est un outil ponctuel exécuté avec Node, pas
 * un module de l'application Next.js, et n'a donc pas accès aux alias `@/*`
 * ni au chargement de fichiers `.ts`. Toute correction d'une correspondance
 * doit être répercutée à la fois ici et dans `src/lib/data/`.
 *
 * Usage :
 *   node scripts/import-experts.mjs --input /chemin/vers/BdD_experts_QADoc.xlsx
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";

const args = process.argv.slice(2);
const inputFlagIndex = args.indexOf("--input");
const inputPath = inputFlagIndex >= 0 ? args[inputFlagIndex + 1] : null;

if (!inputPath) {
  console.error(
    "Usage: node scripts/import-experts.mjs --input <chemin vers le fichier .xlsx>",
  );
  process.exit(1);
}

const SHEET_NAME = "BdD experts QA-Doc";
const OUTPUT_PATH = resolve(process.cwd(), "supabase/seed.sql");

/* -------------------------------------------------------------------------- */
/* Nationalités -> pays / région (voir src/lib/data/nationalities.ts)          */
/* -------------------------------------------------------------------------- */

const NATIONALITIES = {
  "tunisienne": { label: "Tunisienne", country: "Tunisie", iso2: "TN", region: "Afrique du Nord" },
  "mocambicana": { label: "Mozambicaine", country: "Mozambique", iso2: "MZ", region: "Afrique australe" },
  "senegalaise": { label: "Sénégalaise", country: "Sénégal", iso2: "SN", region: "Afrique de l'Ouest" },
  "malienne": { label: "Malienne", country: "Mali", iso2: "ML", region: "Afrique de l'Ouest" },
  "guineenne": { label: "Guinéenne", country: "Guinée", iso2: "GN", region: "Afrique de l'Ouest" },
  "marocaine": { label: "Marocaine", country: "Maroc", iso2: "MA", region: "Afrique du Nord" },
  "congolaise": { label: "Congolaise", country: "Congo", iso2: "CG", region: "Afrique centrale" },
  "rd congolaise": { label: "Congolaise (RDC)", country: "République démocratique du Congo", iso2: "CD", region: "Afrique centrale" },
  "mauritanienne": { label: "Mauritanienne", country: "Mauritanie", iso2: "MR", region: "Afrique de l'Ouest" },
  "kenyan": { label: "Kényane", country: "Kenya", iso2: "KE", region: "Afrique de l'Est" },
  "ugandan": { label: "Ougandaise", country: "Ouganda", iso2: "UG", region: "Afrique de l'Est" },
  "beninoise": { label: "Béninoise", country: "Bénin", iso2: "BJ", region: "Afrique de l'Ouest" },
  "burkinabe": { label: "Burkinabè", country: "Burkina Faso", iso2: "BF", region: "Afrique de l'Ouest" },
  "burundaise": { label: "Burundaise", country: "Burundi", iso2: "BI", region: "Afrique de l'Est" },
  "camerounaise": { label: "Camerounaise", country: "Cameroun", iso2: "CM", region: "Afrique centrale" },
  "rwandan": { label: "Rwandaise", country: "Rwanda", iso2: "RW", region: "Afrique de l'Est" },
  "ivoirienne": { label: "Ivoirienne", country: "Côte d'Ivoire", iso2: "CI", region: "Afrique de l'Ouest" },
  "tchadienne": { label: "Tchadienne", country: "Tchad", iso2: "TD", region: "Afrique centrale" },
  "nigerienne": { label: "Nigérienne", country: "Niger", iso2: "NE", region: "Afrique de l'Ouest" },
  "nigerian": { label: "Nigériane", country: "Nigeria", iso2: "NG", region: "Afrique de l'Ouest" },
  "togolaise": { label: "Togolaise", country: "Togo", iso2: "TG", region: "Afrique de l'Ouest" },
  "algerienne": { label: "Algérienne", country: "Algérie", iso2: "DZ", region: "Afrique du Nord" },
  "brasileira": { label: "Brésilienne", country: "Brésil", iso2: "BR", region: "Amérique" },
  "angolana": { label: "Angolaise", country: "Angola", iso2: "AO", region: "Afrique australe" },
  "espagne": { label: "Espagnole", country: "Espagne", iso2: "ES", region: "Europe" },
  "marocaine et francaise": { label: "Marocaine et Française", country: "Maroc / France", iso2: null, region: "Afrique du Nord / Europe" },
  "portugaise-francaise": { label: "Portugaise et Française", country: "Portugal / France", iso2: null, region: "Europe" },
  "francais/tunisien": { label: "Française et Tunisienne", country: "France / Tunisie", iso2: null, region: "Europe / Afrique du Nord" },
  "benin and canada": { label: "Béninoise et Canadienne", country: "Bénin / Canada", iso2: null, region: "Afrique de l'Ouest / Amérique" },
};

/* -------------------------------------------------------------------------- */
/* Disciplines -> domaine (voir src/lib/data/disciplines.ts)                   */
/* -------------------------------------------------------------------------- */

const DOMAINS = {
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

const DOMAIN_KEYWORD_RULES = [
  [/sante|medic|medec|clinique|pharma|psycholog/, "Sciences de la Santé"],
  [/agro|agricol|alimen|sol|soil|crop/, "Sciences Agronomiques"],
  [/droit|juridi|politi|administrati|defense|strateg|securite/, "Sciences Juridiques, Politiques et de l'Administration"],
  [/economi|gestion|management|finance/, "Sciences Économiques et de Gestion"],
  [/education|formation|pedagog|enseignement/, "Sciences de l'Éducation et de la Formation"],
  [/lettre|langue|art|litterature|philosoph/, "Lettres, Langues et Arts"],
  [/homme|societe|social|humanit|communication|religion/, "Sciences de l'Homme et de la Société"],
  [/technolog|science|ingenier|informati|spectroscop|architect|urban|terre|geograph|hydrolog|environnement|climat/, "Sciences et Technologies"],
];

/* -------------------------------------------------------------------------- */
/* Professions -> catégorie (voir src/lib/data/professions.ts)                 */
/* -------------------------------------------------------------------------- */

const PROFESSION_KEYWORD_RULES = [
  [/assurance qualite|lead auditor|auditeur|quality assurance|qualite de l'enseignement/, "Assurance Qualité / Audit"],
  [/\bdg\b|directeur|directrice|doyen|administra|vice.?president|vice.?reitora|chef de (la )?division|conseiller/, "Direction / Gouvernance"],
  [/doctorant|doctorante|assistant/, "Doctorant / Assistant"],
  [/enseignant.{0,3}chercheu|chercheu.{0,3}enseignant|enseignante chercheuse|professeur hospitalo|prof titulaire|professeur emerite|full professor|professeur en medecine/, "Enseignant-Chercheur"],
  [/chercheur|researcher|pesquisador/, "Chercheur"],
  [/enseignant|teacher|professor|docente/, "Enseignant"],
];

/* -------------------------------------------------------------------------- */
/* Normalisation                                                               */
/* -------------------------------------------------------------------------- */

function stripAccents(value) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function normalizeKey(raw) {
  return stripAccents(raw.trim().toLowerCase())
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");
}

function resolveNationality(raw) {
  const key = normalizeKey(raw);
  return (
    NATIONALITIES[key] ?? {
      label: raw.trim(),
      country: raw.trim(),
      iso2: null,
      region: "Autre",
    }
  );
}

function resolveDomain(raw) {
  const first = raw.split(";")[0] ?? raw;
  const key = normalizeKey(first);
  if (DOMAINS[key]) return DOMAINS[key];
  for (const [pattern, domain] of DOMAIN_KEYWORD_RULES) {
    if (pattern.test(key)) return domain;
  }
  return "Autre";
}

function resolveProfessionCategory(raw) {
  const key = normalizeKey(raw);
  for (const [pattern, category] of PROFESSION_KEYWORD_RULES) {
    if (pattern.test(key)) return category;
  }
  return "Autre";
}

/** « diallo » -> « Diallo » ; « MARIE-CLAIRE » -> « Marie-Claire ». */
function toTitleCase(value) {
  return value
    .toLocaleLowerCase("fr-FR")
    .replace(/(^|[\s'’-])(\p{L})/gu, (_m, sep, letter) => sep + letter.toLocaleUpperCase("fr-FR"));
}

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

/* -------------------------------------------------------------------------- */
/* Lecture du classeur                                                         */
/* -------------------------------------------------------------------------- */

const buffer = readFileSync(resolve(inputPath));
const workbook = XLSX.read(buffer, { type: "buffer" });
const sheet = workbook.Sheets[SHEET_NAME];

if (!sheet) {
  console.error(`Feuille "${SHEET_NAME}" introuvable. Feuilles disponibles :`, workbook.SheetNames);
  process.exit(1);
}

// La feuille commence en colonne B (la colonne A n'existe pas dans sa plage
// de données -SheetJS ne renvoie donc que B..H, sans décalage à corriger).
const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 2, blankrows: false });

const experts = [];
const warnings = [];

for (const row of rawRows) {
  const [firstNameRaw, lastNameRaw, nationalityRaw, institutionRaw, professionRaw, disciplineRaw, cvRaw] = row;

  if (!firstNameRaw && !lastNameRaw) continue;

  const firstName = String(firstNameRaw ?? "").trim();
  const lastName = String(lastNameRaw ?? "").trim();
  const nationalityValue = String(nationalityRaw ?? "").trim();
  const institution = String(institutionRaw ?? "").trim();
  const professionValue = String(professionRaw ?? "").trim();
  const disciplineValue = String(disciplineRaw ?? "").trim();
  const cvValue = String(cvRaw ?? "").trim();

  if (!firstName || !lastName) {
    warnings.push(`Ligne ignorée (prénom ou nom manquant) : ${JSON.stringify(row)}`);
    continue;
  }

  const nationalityInfo = resolveNationality(nationalityValue);

  experts.push({
    firstName: toTitleCase(firstName),
    lastName: lastName.toLocaleUpperCase("fr-FR"),
    nationalityRaw: nationalityValue,
    nationality: nationalityInfo.label,
    country: nationalityInfo.country,
    countryCode: nationalityInfo.iso2,
    region: nationalityInfo.region,
    institution: institution || null,
    professionRaw: professionValue,
    professionCategory: resolveProfessionCategory(professionValue),
    domain: resolveDomain(disciplineValue),
    specialtyRaw: disciplineValue,
    // Un même expert a parfois plusieurs liens (Google Drive), séparés par
    // une virgule dans la saisie d'origine : on ne garde que le premier pour
    // la colonne cv_url, les autres restent visibles dans specialty_raw...
    // non -on les garde tous, séparés par un espace, la colonne est un texte
    // libre côté base (cv_url n'est pas contrainte à une seule URL par le
    // schéma, seulement au préfixe http(s) du premier lien).
    cvUrl: cvValue.split(",")[0]?.trim() || null,
  });
}

/* -------------------------------------------------------------------------- */
/* Génération du seed SQL                                                      */
/* -------------------------------------------------------------------------- */

const columns = [
  "first_name",
  "last_name",
  "nationality_raw",
  "nationality",
  "country",
  "country_code",
  "region",
  "institution",
  "profession_raw",
  "profession_category",
  "domain",
  "specialty_raw",
  "cv_url",
];

const values = experts.map((expert) =>
  "  (" +
  [
    sqlString(expert.firstName),
    sqlString(expert.lastName),
    sqlString(expert.nationalityRaw),
    sqlString(expert.nationality),
    sqlString(expert.country),
    sqlString(expert.countryCode),
    sqlString(expert.region),
    sqlString(expert.institution),
    sqlString(expert.professionRaw),
    sqlString(expert.professionCategory),
    sqlString(expert.domain),
    sqlString(expert.specialtyRaw),
    sqlString(expert.cvUrl),
  ].join(", ") +
  ")",
);

const sql = `-- =============================================================================
-- QA-Doc -- Peuplement initial de la base des experts
-- Généré par scripts/import-experts.mjs à partir du classeur Excel source
-- (feuille « BdD experts QA-Doc »). Ré-exécutable : les doublons éventuels ne
-- sont pas dédupliqués automatiquement, vérifier avant de rejouer ce script
-- sur une base déjà peuplée.
-- =============================================================================

insert into public.experts (${columns.join(", ")})
values
${values.join(",\n")}
;

select count(*) as total_experts from public.experts;
`;

writeFileSync(OUTPUT_PATH, sql, "utf-8");

console.log(`${experts.length} experts écrits dans ${OUTPUT_PATH}`);
if (warnings.length > 0) {
  console.log(`${warnings.length} ligne(s) ignorée(s) :`);
  for (const warning of warnings) console.log(`  - ${warning}`);
}

const domainCounts = new Map();
for (const expert of experts) {
  domainCounts.set(expert.domain, (domainCounts.get(expert.domain) ?? 0) + 1);
}
console.log("\nRépartition par domaine :");
for (const [domain, count] of [...domainCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(count).padStart(4)}  ${domain}`);
}
