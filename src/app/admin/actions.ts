"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAdminIdentity } from "@/lib/auth/guards";
import { createAdmin, deleteAdmin, setAdminActive, updateAdmin } from "@/lib/services/admins";
import { createExpert, deleteExpert, updateExpert } from "@/lib/services/experts";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { expertFormSchema, toExpertInput } from "@/lib/validation/expert";

/**
 * Server Actions de l'espace administrateur.
 * Chaque action revérifie l'autorisation : on ne se fie jamais au fait que
 * l'appel provienne d'une page déjà protégée.
 */

export interface ActionState {
  error?: string;
  success?: string;
  /** Mot de passe temporaire d'un compte administrateur qui vient d'être créé. */
  tempPassword?: string;
}

const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "L'adresse email est obligatoire.")
    .email("Adresse email invalide."),
  password: z
    .string()
    .min(1, "Le mot de passe est obligatoire.")
    .max(200, "Mot de passe trop long."),
  redirectTo: z.string().optional(),
});

/** Chemin de redirection interne uniquement (protection open redirect). */
function safeRedirect(value: string | undefined) {
  if (!value) return "/admin/dashboard";
  if (!value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin/dashboard";
  }
  return value;
}

export async function signInAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Identifiants invalides." };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // L'utilisateur ne voit qu'un message générique : révéler « email inconnu »
    // indiquerait à un attaquant quels comptes existent. La cause réelle part
    // dans les journaux serveur.
    console.error("[admin/login] échec d'authentification", {
      code: error.code,
      status: error.status,
      message: error.message,
    });

    return { error: "Email ou mot de passe incorrect." };
  }

  const identity = await getAdminIdentity();

  if (!identity) {
    await supabase.auth.signOut();
    return {
      error:
        "Ce compte n'est pas autorisé à accéder à l'espace d'administration.",
    };
  }

  redirect(safeRedirect(parsed.data.redirectTo));
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const deleteSchema = z.object({
  id: z.string().uuid("Identifiant d'expert invalide."),
});

export async function deleteExpertAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await getAdminIdentity();
  if (!identity) {
    return { error: "Accès refusé." };
  }

  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Requête invalide." };
  }

  try {
    await deleteExpert(parsed.data.id);
  } catch (error) {
    console.error("[admin] suppression impossible", error);
    return { error: "La suppression de la fiche a échoué." };
  }

  revalidatePath("/admin/experts");
  revalidatePath("/admin/dashboard");

  return { success: "La fiche de l'expert a été supprimée." };
}

function parseExpertForm(formData: FormData) {
  return expertFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    nationality: formData.get("nationality"),
    institution: formData.get("institution") ?? "",
    profession: formData.get("profession"),
    specialty: formData.get("specialty"),
    cvUrl: formData.get("cvUrl") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export async function createExpertAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await getAdminIdentity();
  if (!identity) return { error: "Accès refusé." };

  const parsed = parseExpertForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  let expertId: string;
  try {
    const expert = await createExpert(toExpertInput(parsed.data));
    expertId = expert.id;
  } catch (error) {
    console.error("[admin] création impossible", error);
    return { error: "La création de la fiche a échoué." };
  }

  revalidatePath("/admin/experts");
  revalidatePath("/admin/dashboard");
  redirect(`/admin/experts/${expertId}`);
}

export async function updateExpertAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await getAdminIdentity();
  if (!identity) return { error: "Accès refusé." };

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Identifiant d'expert manquant." };
  }

  const parsed = parseExpertForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  try {
    await updateExpert(id, toExpertInput(parsed.data));
  } catch (error) {
    console.error("[admin] mise à jour impossible", error);
    return { error: "La mise à jour de la fiche a échoué." };
  }

  revalidatePath("/admin/experts");
  revalidatePath(`/admin/experts/${id}`);
  revalidatePath("/admin/dashboard");

  return { success: "La fiche a été mise à jour." };
}

const createAdminSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "L'adresse email est obligatoire.")
    .email("Adresse email invalide."),
  fullName: z.string().trim().min(2, "Le nom est obligatoire.").max(150),
  role: z.enum(["admin", "super_admin"]),
  // Laissé vide : un mot de passe est généré automatiquement.
  password: z
    .string()
    .trim()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(200)
    .optional()
    .or(z.literal("")),
});

/**
 * Ajoute un compte administrateur (compte Supabase Auth + habilitation).
 * Réservé aux super-administrateurs : c'est la seule action qui accorde de
 * nouveaux accès à la plateforme.
 */
export async function createAdminAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await getAdminIdentity();
  if (!identity || identity.role !== "super_admin") {
    return { error: "Seuls les super-administrateurs peuvent ajouter un compte." };
  }

  const parsed = createAdminSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    password: formData.get("password") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  try {
    const { password, generated } = await createAdmin({
      ...parsed.data,
      password: parsed.data.password || undefined,
    });
    revalidatePath("/admin/team");
    return {
      success: generated
        ? `Compte créé pour ${parsed.data.email}.`
        : `Compte créé pour ${parsed.data.email} avec le mot de passe défini.`,
      // N'est renvoyé au navigateur que s'il a été généré : un mot de passe
      // choisi par le super-administrateur n'a pas besoin d'être réaffiché.
      tempPassword: generated ? password : undefined,
    };
  } catch (error) {
    console.error("[admin/team] création impossible", error);
    return {
      error: error instanceof Error ? error.message : "La création du compte a échoué.",
    };
  }
}

const toggleAdminSchema = z.object({
  userId: z.string().uuid("Identifiant invalide."),
  isActive: z.enum(["true", "false"]),
});

export async function toggleAdminActiveAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await getAdminIdentity();
  if (!identity || identity.role !== "super_admin") {
    return { error: "Accès refusé." };
  }

  const parsed = toggleAdminSchema.safeParse({
    userId: formData.get("userId"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Requête invalide." };
  }

  try {
    await setAdminActive(parsed.data.userId, parsed.data.isActive === "true", identity.userId);
  } catch (error) {
    console.error("[admin/team] mise à jour impossible", error);
    return {
      error: error instanceof Error ? error.message : "La mise à jour a échoué.",
    };
  }

  revalidatePath("/admin/team");
  return { success: "Compte mis à jour." };
}

const updateAdminSchema = z.object({
  userId: z.string().uuid("Identifiant invalide."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "L'adresse email est obligatoire.")
    .email("Adresse email invalide."),
  fullName: z.string().trim().min(2, "Le nom est obligatoire.").max(150),
  role: z.enum(["admin", "super_admin"]),
});

export async function updateAdminAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await getAdminIdentity();
  if (!identity || identity.role !== "super_admin") {
    return { error: "Seuls les super-administrateurs peuvent modifier un compte." };
  }

  const parsed = updateAdminSchema.safeParse({
    userId: formData.get("userId"),
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  try {
    await updateAdmin(
      parsed.data.userId,
      { email: parsed.data.email, fullName: parsed.data.fullName, role: parsed.data.role },
      identity.userId,
    );
  } catch (error) {
    console.error("[admin/team] modification impossible", error);
    return {
      error: error instanceof Error ? error.message : "La modification du compte a échoué.",
    };
  }

  revalidatePath("/admin/team");
  return { success: "Compte modifié." };
}

const deleteAdminSchema = z.object({
  userId: z.string().uuid("Identifiant invalide."),
});

export async function deleteAdminAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identity = await getAdminIdentity();
  if (!identity || identity.role !== "super_admin") {
    return { error: "Accès refusé." };
  }

  const parsed = deleteAdminSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Requête invalide." };
  }

  try {
    await deleteAdmin(parsed.data.userId, identity.userId);
  } catch (error) {
    console.error("[admin/team] suppression impossible", error);
    return {
      error: error instanceof Error ? error.message : "La suppression du compte a échoué.",
    };
  }

  revalidatePath("/admin/team");
  return { success: "Compte supprimé." };
}
