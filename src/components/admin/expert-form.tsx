"use client";

import { useActionState, useState } from "react";
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
 *
 * Champs contrôlés : un <form action={...}> vide les champs non contrôlés
 * après chaque soumission, y compris en cas d'erreur de validation -on ne
 * veut pas faire retaper toute la fiche pour corriger un seul champ.
 */
export function ExpertForm({
  expert,
  onSaved,
}: {
  expert?: Expert;
  /** Appelé après une modification réussie (pas une création, qui redirige). */
  onSaved?: () => void;
}) {
  const action = expert ? updateExpertAction : createExpertAction;
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  const [firstName, setFirstName] = useState(expert?.firstName ?? "");
  const [lastName, setLastName] = useState(expert?.lastName ?? "");
  const [nationality, setNationality] = useState(expert?.nationalityRaw ?? "");
  const [institution, setInstitution] = useState(expert?.institution ?? "");
  const [profession, setProfession] = useState(expert?.professionRaw ?? "");
  const [specialty, setSpecialty] = useState(expert?.specialtyRaw ?? "");
  const [cvUrl, setCvUrl] = useState(expert?.cvUrl ?? "");
  const [notes, setNotes] = useState(expert?.notes ?? "");

  useEffect(() => {
    if (state.success) {
      toast.success("Fiche enregistrée", { description: state.success });
      onSaved?.();
    } else if (state.error) {
      toast.error("Échec de l'enregistrement", { description: state.error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {expert ? <input type="hidden" name="id" value={expert.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="firstName" label="Prénom" required>
          <Input
            id="firstName"
            name="firstName"
            required
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </FormField>

        <FormField id="lastName" label="Nom" required>
          <Input
            id="lastName"
            name="lastName"
            required
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
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
            value={nationality}
            onChange={(event) => setNationality(event.target.value)}
            placeholder="ex. Sénégalaise"
          />
        </FormField>

        <FormField id="institution" label="Établissement">
          <Input
            id="institution"
            name="institution"
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="profession" label="Profession" required>
          <Input
            id="profession"
            name="profession"
            required
            value={profession}
            onChange={(event) => setProfession(event.target.value)}
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
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            placeholder="ex. Sciences et Technologies"
          />
        </FormField>
      </div>

      <FormField id="cvUrl" label="Lien du CV" hint="URL complète (Google Drive, etc.).">
        <Input
          id="cvUrl"
          name="cvUrl"
          type="url"
          value={cvUrl}
          onChange={(event) => setCvUrl(event.target.value)}
          placeholder="https://"
        />
      </FormField>

      <FormField id="notes" label="Notes internes">
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </FormField>

      <SubmitButton label={expert ? "Enregistrer les modifications" : "Créer la fiche"} />
    </form>
  );
}
