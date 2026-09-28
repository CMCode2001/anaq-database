/**
 * Constantes applicatives.
 * Un seul endroit à modifier pour les libellés institutionnels.
 */

export const ORG = {
  shortName: "ANAQ-Sup",
  /** Dénomination officielle complète. */
  name: "Autorité nationale d'Assurance Qualité de l'Enseignement supérieur, de la Recherche et de l'Innovation",
  nameCompact: "Assurance Qualité de l'Enseignement supérieur",
  appTitle: "Base des experts QA-Doc",
  appSubtitle:
    "Répartition, recherche et gestion du réseau d'experts évaluateurs.",
  /** Logo officiel, utilisé à l'écran. */
  logoPath: "/logo-anaqsup.png",
  /** Icône de base de données, lisible sur fond clair comme sur fond sombre. */
  favicon: "/favicon-database.png",
  /** Dimensions natives du logo, pour préserver ses proportions. */
  logoWidth: 801,
  logoHeight: 304,
} as const;

/** Rapport largeur / hauteur du logo officiel. */
export const LOGO_RATIO = ORG.logoWidth / ORG.logoHeight;

export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Plafond de lignes exportables en une fois (protection mémoire / coût). */
export const EXPORT_MAX_ROWS = 10_000;
