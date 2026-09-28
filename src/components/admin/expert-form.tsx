"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

import {
  createExpertAction,
  updateExpertAction,
  type ActionState,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Expert } from "@/types/expert";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Save aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}

/**
 * Formulaire de création / édition d'une fiche expert.
 *
 * Les champs reprennent volontairement les colonnes du fichier Excel source
 * (prénom, nom, nationalité, établissement, profession, discipline, CV) :
 * la classification canonique (pays, région, domaine, catégorie de
 * profession) est déduite automatiquement côté serveur, voir
 * `src/lib/validation/expert.ts`.
 */
export function ExpertForm({ expert }: { expert?: Expert }) {
  const action = expert ? updateExpertAction : createExpertAction;
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  useEffect(() => {
    if (state.success) toast.success("Fiche enregistrée", { description: state.success });
    else if (state.error) toast.error("Échec de l'enregistrement", { description: state.error });
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {expert ? <input type="hidden" name="id" value={expert.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="firstName" label="Prénom" required>
          <Input id="firstName" name="firstName" required defaultValue={expert?.firstName} />
        </FormField>

        <FormField id="lastName" label="Nom" required>
          <Input id="lastName" name="lastName" required defaultValue={expert?.lastName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="nationality"
          label="Nationalité"
          required
          hint="Le pays et la région sont déduits automatiquement."
        >
          <Input
            id="nationality"
            name="nationality"
            required
            defaultValue={expert?.nationalityRaw}
            placeholder="ex. Sénégalaise"
          />
        </FormField>

        <FormField id="institution" label="Établissement">
          <Input id="institution" name="institution" defaultValue={expert?.institution ?? ""} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="profession" label="Profession" required>
          <Input
            id="profession"
            name="profession"
            required
            defaultValue={expert?.professionRaw}
            placeholder="ex. Enseignant - Chercheur"
          />
        </FormField>

        <FormField
          id="specialty"
          label="Discipline / spécialité"
          required
          hint="Le domaine scientifique est déduit automatiquement."
        >
          <Input
            id="specialty"
            name="specialty"
            required
            defaultValue={expert?.specialtyRaw}
            placeholder="ex. Sciences et Technologies"
          />
        </FormField>
      </div>

      <FormField id="cvUrl" label="Lien du CV" hint="URL complète (Google Drive, etc.).">
        <Input
          id="cvUrl"
          name="cvUrl"
          type="url"
          defaultValue={expert?.cvUrl ?? ""}
          placeholder="https://"
        />
      </FormField>

      <FormField id="notes" label="Notes internes">
        <Textarea id="notes" name="notes" rows={4} defaultValue={expert?.notes ?? ""} />
      </FormField>

      <SubmitButton label={expert ? "Enregistrer les modifications" : "Créer la fiche"} />
    </form>
  );
}
