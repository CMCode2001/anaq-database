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

export type AdminAccount = Database["public"]["Tables"]["admin_users"]["Row"];

export class AdminManagementError extends Error {}

export async function listAdmins(): Promise<AdminAccount[]> {
  const client = createAdminClient();

  const { data, error } = await client
    .from("admin_users")
    .select("user_id, email, full_name, role, is_active, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new AdminManagementError("Impossible de charger la liste des administrateurs.");
  }

  return data ?? [];
}

export interface CreateAdminInput {
  email: string;
  fullName: string;
  role: "admin" | "super_admin";
}

/** Mot de passe temporaire à usage unique : l'admin invité devra le changer. */
function generateTemporaryPassword(): string {
  return randomBytes(15).toString("base64url");
}

export async function createAdmin(input: CreateAdminInput): Promise<{ tempPassword: string }> {
  const client = createAdminClient();
  const tempPassword = generateTemporaryPassword();

  const { data, error } = await client.auth.admin.createUser({
    email: input.email,
    password: tempPassword,
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

  return { tempPassword };
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

    if (target?.role === "super_admin") {
      const { count } = await client
        .from("admin_users")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "super_admin")
        .eq("is_active", true);

      if ((count ?? 0) <= 1) {
        throw new AdminManagementError(
          "Impossible de désactiver le dernier super-administrateur actif.",
        );
      }
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
