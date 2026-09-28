import "server-only";

import { randomBytes } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

/**
 * Gestion des comptes administrateurs -provisionnement, liste, activation.
 *
 * Ces opérations passent toutes par `createAdminClient()` (clé `service_role`) :
 * créer un utilisateur Supabase Auth n'est possible qu'avec cette clé, et
 * `admin_users` n'a volontairement aucune policy RLS d'écriture pour le rôle
 * `authenticated` -seul ce client, réservé aux tâches d'administration
 * serveur, peut y écrire. L'autorisation (« l'appelant est-il
 * super-administrateur ? ») est vérifiée en amont, dans les Server Actions.
 */

export type AdminAccount = Database["public"]["Tables"]["admin_users"]["Row"] & {
  /** Dernière connexion réussie, telle que suivie par Supabase Auth. */
  lastSignInAt: string | null;
};

export class AdminManagementError extends Error {}

export async function listAdmins(): Promise<AdminAccount[]> {
  const client = createAdminClient();

  const [{ data, error }, { data: authUsers, error: authError }] = await Promise.all([
    client
      .from("admin_users")
      .select("user_id, email, full_name, role, is_active, created_at")
      .order("created_at", { ascending: true }),
    // La date de dernière connexion vit dans Supabase Auth (auth.users), pas
    // dans admin_users : un seul appel à la place d'un par administrateur.
    // 200 comptes couvre très largement une équipe d'administrateurs.
    client.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);

  if (error) {
    throw new AdminManagementError("Impossible de charger la liste des administrateurs.");
  }
  if (authError) {
    throw new AdminManagementError("Impossible de charger les dates de connexion.");
  }

  const lastSignInByUserId = new Map(
    authUsers.users.map((user) => [user.id, user.last_sign_in_at ?? null]),
  );

  return (data ?? []).map((admin) => ({
    ...admin,
    lastSignInAt: lastSignInByUserId.get(admin.user_id) ?? null,
  }));
}

export interface CreateAdminInput {
  email: string;
  fullName: string;
  role: "admin" | "super_admin";
  /** Mot de passe choisi par le super-administrateur ; généré si absent. */
  password?: string;
}

/** Mot de passe temporaire à usage unique, utilisé si aucun n'est fourni. */
function generateTemporaryPassword(): string {
  return randomBytes(15).toString("base64url");
}

export async function createAdmin(
  input: CreateAdminInput,
): Promise<{ password: string; generated: boolean }> {
  const client = createAdminClient();
  const generated = !input.password;
  const password = input.password ?? generateTemporaryPassword();

  const { data, error } = await client.auth.admin.createUser({
    email: input.email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new AdminManagementError(
      error?.message.toLowerCase().includes("already")
        ? "Un compte existe déjà avec cet email."
        : "Impossible de créer ce compte.",
    );
  }

  const { error: profileError } = await client.from("admin_users").insert({
    user_id: data.user.id,
    email: input.email,
    full_name: input.fullName,
    role: input.role,
    is_active: true,
  });

  if (profileError) {
    throw new AdminManagementError(
      "Le compte a été créé mais l'habilitation a échoué -contactez le support Supabase.",
    );
  }

  return { password, generated };
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function countActiveSuperAdmins(client: AdminClient): Promise<number> {
  const { count } = await client
    .from("admin_users")
    .select("user_id", { count: "exact", head: true })
    .eq("role", "super_admin")
    .eq("is_active", true);

  return count ?? 0;
}

export async function setAdminActive(
  userId: string,
  isActive: boolean,
  actingUserId: string,
): Promise<void> {
  if (userId === actingUserId && !isActive) {
    throw new AdminManagementError("Vous ne pouvez pas désactiver votre propre compte.");
  }

  const client = createAdminClient();

  if (!isActive) {
    const { data: target } = await client
      .from("admin_users")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (target?.role === "super_admin" && (await countActiveSuperAdmins(client)) <= 1) {
      throw new AdminManagementError(
        "Impossible de désactiver le dernier super-administrateur actif.",
      );
    }
  }

  const { error } = await client
    .from("admin_users")
    .update({ is_active: isActive })
    .eq("user_id", userId);

  if (error) {
    throw new AdminManagementError("La mise à jour du compte a échoué.");
  }
}

export interface UpdateAdminInput {
  email: string;
  fullName: string;
  role: "admin" | "super_admin";
}

export async function updateAdmin(
  userId: string,
  input: UpdateAdminInput,
  actingUserId: string,
): Promise<void> {
  const client = createAdminClient();

  const { data: current } = await client
    .from("admin_users")
    .select("email, role, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (!current) {
    throw new AdminManagementError("Ce compte n'existe plus.");
  }

  const losesLastSuperAdmin =
    userId === actingUserId &&
    current.role === "super_admin" &&
    current.is_active &&
    input.role !== "super_admin";

  if (losesLastSuperAdmin && (await countActiveSuperAdmins(client)) <= 1) {
    throw new AdminManagementError(
      "Impossible de retirer votre propre rôle de super-administrateur : vous êtes le seul actif.",
    );
  }

  if (input.email !== current.email) {
    const { error: authError } = await client.auth.admin.updateUserById(userId, {
      email: input.email,
      email_confirm: true,
    });

    if (authError) {
      throw new AdminManagementError(
        authError.message.toLowerCase().includes("already")
          ? "Un compte existe déjà avec cet email."
          : "Impossible de mettre à jour cet email.",
      );
    }
  }

  const { error } = await client
    .from("admin_users")
    .update({ email: input.email, full_name: input.fullName, role: input.role })
    .eq("user_id", userId);

  if (error) {
    throw new AdminManagementError("La mise à jour du compte a échoué.");
  }
}

export async function deleteAdmin(userId: string, actingUserId: string): Promise<void> {
  if (userId === actingUserId) {
    throw new AdminManagementError("Vous ne pouvez pas supprimer votre propre compte.");
  }

  const client = createAdminClient();

  const { data: target } = await client
    .from("admin_users")
    .select("role, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (
    target?.role === "super_admin" &&
    target.is_active &&
    (await countActiveSuperAdmins(client)) <= 1
  ) {
    throw new AdminManagementError("Impossible de supprimer le dernier super-administrateur actif.");
  }

  // La suppression du compte Supabase Auth entraîne celle de sa ligne
  // admin_users (contrainte ON DELETE CASCADE, migration 0001) : inutile de
  // supprimer les deux lignes séparément.
  const { error } = await client.auth.admin.deleteUser(userId);

  if (error) {
    throw new AdminManagementError("La suppression du compte a échoué.");
  }
}
