/**
 * Palette des graphiques : deux familles seulement, or et marine, declinees
 * en alternance pour rester lisibles cote a cote et en niveaux de gris a
 * l'impression. Les valeurs sont resolues au moment du rendu, donc elles
 * suivent le theme clair ou sombre.
 */
export const CHART_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
] as const;
