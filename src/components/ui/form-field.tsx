import * as React from "react";
import { AlertCircle } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  /** Identifiant du champ, relié au label et au message d'erreur. */
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Enveloppe accessible d'un champ de formulaire :
 * label lié, indication optionnelle, message d'erreur annoncé aux lecteurs
 * d'écran via `role="alert"` et `aria-describedby`.
 */
export function FormField({
  id,
  label,
  required = false,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    // `min-w-0` est indispensable : en tant qu'element de grille, cette
    // enveloppe a `min-width: auto` et ne peut pas descendre sous la largeur
    // minimale de son contenu. Un champ un peu large fait alors deborder
    // toute la carte sur les petits ecrans.
    <div className={cn("min-w-0 space-y-2", className)}>
      <Label htmlFor={id} className={cn(required && "required-marker")}>
        {label}
      </Label>

      {children}

      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-sm font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

/** Construit la valeur `aria-describedby` cohérente avec `FormField`. */
export function describedBy(id: string, hasHint: boolean, hasError: boolean) {
  const ids = [
    hasError ? `${id}-error` : null,
    hasHint && !hasError ? `${id}-hint` : null,
  ].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}
