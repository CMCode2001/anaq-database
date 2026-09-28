"use client";

import * as React from "react";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, Copy, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { createAdminAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <UserPlus aria-hidden="true" />
      )}
      Créer le compte
    </Button>
  );
}

/**
 * Formulaire d'ajout d'un administrateur.
 *
 * Crée directement le compte Supabase Auth (email confirmé) et l'habilite
 * dans `admin_users` -aucune étape manuelle dans le tableau de bord Supabase.
 * Un mot de passe temporaire est généré côté serveur et affiché une seule
 * fois : à communiquer à la personne concernée par un canal sûr.
 */
export function NewAdminForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createAdminAction, {});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.error) toast.error("Échec de la création", { description: state.error });
    setCopied(false);
  }, [state]);

  const copyPassword = async () => {
    if (!state.tempPassword) return;
    await navigator.clipboard.writeText(state.tempPassword);
    setCopied(true);
  };

  return (
    <div className="space-y-4">
      <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_12rem_auto] sm:items-end">
        <FormField id="fullName" label="Nom complet" required>
          <Input id="fullName" name="fullName" required placeholder="Prénom Nom" />
        </FormField>

        <FormField id="email" label="Adresse email" required>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="nom@organisation.org"
          />
        </FormField>

        <FormField id="role" label="Rôle" required>
          <select
            id="role"
            name="role"
            defaultValue="admin"
            className={cn(
              "flex h-11 w-full rounded-full border border-input bg-card px-6 text-sm shadow-sm transition-colors",
              "hover:border-primary/60",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)]",
            )}
          >
            <option value="admin">Administrateur</option>
            <option value="super_admin">Super administrateur</option>
          </select>
        </FormField>

        <SubmitButton />
      </form>

      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </p>
      ) : null}

      {state.tempPassword ? (
        <Card className="border-primary/40 bg-gold-soft/60">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-medium text-foreground">
              {state.success} Mot de passe temporaire -à communiquer une seule fois par un
              canal sûr, il ne sera plus jamais affiché ici :
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-full border border-input bg-card px-4 py-2 font-mono text-sm">
                {state.tempPassword}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyPassword}
                title="Copier le mot de passe"
              >
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                <span className="sr-only">Copier le mot de passe</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
