-- =============================================================================
-- QA-Doc -Migration 0002 : promotion d'un compte en administrateur
-- =============================================================================
-- Pre-requis : creer d'abord l'utilisateur dans
--   Supabase > Authentication > Users > "Add user"
--   (cocher "Auto Confirm User" pour eviter l'email de confirmation).
--
-- Remplacer l'adresse ci-dessous, puis executer dans le SQL Editor.
-- =============================================================================

insert into public.admin_users (user_id, email, full_name, role)
select u.id, u.email, 'Administrateur QA-Doc', 'super_admin'
from auth.users u
where u.email = 'admin@example.org'   -- <-- REMPLACER par l'adresse reellement creee
on conflict (user_id) do update
  set is_active = true,
      role      = excluded.role,
      email     = excluded.email;

-- Verification : la ligne doit apparaitre
select a.user_id, a.email, a.role, a.is_active
from public.admin_users a;
