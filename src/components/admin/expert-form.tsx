"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ExternalLink, Loader2, Save } from "lucide-react";
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
import { DOMAINS } from "@/lib/data/disciplines";
import { PROFESSION_CATEGORIES } from "@/lib/data/professions";
import { cn } from "@/lib/utils";
import type { Expert } from "@/types/expert";

/** Domaine "Hors domaine" ajouté en fin de liste : sélectionnable, jamais deviné par défaut. */
const DOMAIN_OPTIONS = [...DOMAINS, "Hors domaine"] as const;
const PROFESSION_CATEGORY_OPTIONS = [...PROFESSION_CATEGORIES, "Autre"] as const;

const SELECT_CLASSNAME = cn(
  "flex h-11 w-full rounded-full border border-input bg-card px-6 text-sm shadow-sm transition-colors",
  "hover:border-primary/60",
  "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)]",
);

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
 * Domaine et catégorie de profession sont des menus déroulants (listes
 * fermées : les huit domaines REESAO, les six catégories de profession) —
 * plus rapide à saisir qu'un texte libre, et sans risque de mauvaise
 * classification. Le reste des champs reprend les colonnes du fichier
 * Excel source (prénom, nom, nationalité, établissement, profession,
 * discipline, CV) ; la nationalité seule est encore classée automatiquement
 * (pays, région), voir `src/lib/validation/expert.ts`.
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
  const [professionCategory, setProfessionCategory] = useState(
    expert?.professionCategory ?? PROFESSION_CATEGORY_OPTIONS[0],
  );
  const [specialty, setSpecialty] = useState(expert?.specialtyRaw ?? "");
  const [domain, setDomain] = useState(expert?.domain ?? DOMAIN_OPTIONS[0]);
  const [cvUrl, setCvUrl] = useState(expert?.cvUrl ?? "");
  const [cvFileName, setCvFileName] = useState<string | null>(null);
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

        <FormField id="professionCategory" label="Catégorie de profession" required>
          <select
            id="professionCategory"
            name="professionCategory"
            value={professionCategory}
            onChange={(event) => setProfessionCategory(event.target.value)}
            className={SELECT_CLASSNAME}
          >
            {PROFESSION_CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="specialty" label="Discipline / spécialité" required>
          <Input
            id="specialty"
            name="specialty"
            required
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            placeholder="ex. Génie logiciel"
          />
        </FormField>

        <FormField id="domain" label="Domaine" required hint="Les huit domaines du REESAO.">
          <select
            id="domain"
            name="domain"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            className={SELECT_CLASSNAME}
          >
            {DOMAIN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="space-y-4 rounded-2xl border border-dashed border-border p-4">
        <FormField
          id="cvFile"
          label="CV -téléverser un fichier"
          hint="PDF ou Word, 10 Mo maximum. Remplace le lien ci-dessous s'il est aussi renseigné."
        >
          <input
            id="cvFile"
            name="cvFile"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => setCvFileName(event.target.files?.[0]?.name ?? null)}
            className={cn(
              "block w-full text-sm text-foreground",
              "file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2",
              "file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90",
            )}
          />
        </FormField>

        {cvFileName ? (
          <p className="text-xs text-muted-foreground">
            Fichier sélectionné : <span className="font-medium text-foreground">{cvFileName}</span>
          </p>
        ) : expert?.cvUrl ? (
          <p className="text-xs text-muted-foreground">
            CV actuel :{" "}
            <a
              href={expert.cvUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-gold-ink hover:underline"
            >
              ouvrir le document
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </p>
        ) : null}

        <FormField
          id="cvUrl"
          label="Ou coller un lien"
          hint="Google Drive, etc. Ignoré si un fichier est téléversé ci-dessus."
        >
          <Input
            id="cvUrl"
            name="cvUrl"
            type="url"
            value={cvUrl}
            onChange={(event) => setCvUrl(event.target.value)}
            placeholder="https://"
          />
        </FormField>
      </div>

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
