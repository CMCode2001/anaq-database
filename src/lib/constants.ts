/**
 * Constantes applicatives.
 * Un seul endroit à modifier pour les libellés institutionnels.
 */

export const ORG = {
  shortName: "QA-Doc",
  name: "Réseau des experts QA-Doc",
  nameCompact: "Experts QA-Doc",
  appTitle: "Base des experts QA-Doc",
  appSubtitle:
    "Répartition, recherche et gestion du réseau d'experts évaluateurs.",
} as const;

export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Plafond de lignes exportables en une fois (protection mémoire / coût). */
export const EXPORT_MAX_ROWS = 10_000;
