import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne des classes Tailwind sans conflit (convention shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "UTC",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeZone: "UTC",
});

const DATE_LONG_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "UTC",
});

/**
 * Les dates sont formatées en UTC côté serveur ET côté client : cela évite
 * les erreurs d'hydratation React et garantit un export identique partout.
 * (Le Sénégal est à UTC+0, l'affichage correspond donc à l'heure locale.)
 */
export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return DATE_TIME_FORMATTER.format(date);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return DATE_FORMATTER.format(date);
}

export function formatDateLong(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return DATE_LONG_FORMATTER.format(date);
}

/** "YYYY-MM-DD" en UTC, utilisé pour les noms de fichiers et les filtres. */
export function toIsoDay(date: Date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Initiales d'un visiteur, pour les avatars de la fiche détaillée. */
export function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** Tronque proprement une chaîne pour l'affichage en tableau. */
export function truncate(value: string, max = 60) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/* -------------------------------------------------------------------------- */
/* Typographie des noms                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Presentation unifiee de l'etat civil, appliquee a l'affichage et aux
 * exports — jamais au stockage. La base conserve la saisie d'origine : on
 * peut donc changer d'avis sur la convention sans migration, et les fiches
 * deja enregistrees suivent immediatement.
 *
 * Convention retenue, celle des registres administratifs :
 *   NOM en capitales, Prenom en casse de titre.
 */

/** « diallo » ou « Diallo » deviennent « DIALLO ». */
export function formatLastName(value: string) {
  return value.toLocaleUpperCase("fr-FR");
}

/**
 * « fatou » devient « Fatou », « MARIE-CLAIRE » devient « Marie-Claire ».
 * La majuscule repart apres un espace, un trait d'union ou une apostrophe,
 * ce qui couvre « N'Diaye » comme « Awa-Bineta ».
 */
export function formatFirstName(value: string) {
  return value
    .toLocaleLowerCase("fr-FR")
    .replace(/(^|[\s'’-])(\p{L})/gu, (_match, separateur: string, lettre: string) =>
      separateur + lettre.toLocaleUpperCase("fr-FR"),
    );
}

/** « fatou » + « diallo » → « Fatou DIALLO ». */
export function formatFullName(firstName: string, lastName: string) {
  return `${formatFirstName(firstName)} ${formatLastName(lastName)}`;
}
