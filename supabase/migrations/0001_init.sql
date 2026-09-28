-- =============================================================================
-- QA-Doc -Base des experts
-- Migration 0001 : schéma initial, RLS et rôles administrateurs
-- À exécuter dans Supabase > SQL Editor (ou via `supabase db push`).
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Table des administrateurs
--    Lie un utilisateur Supabase Auth à un rôle applicatif.
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'admin'
             check (role in ('admin', 'super_admin')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Administrateurs autorises a consulter, modifier et exporter la base des experts.';

-- -----------------------------------------------------------------------------
-- 2. Fonction utilitaire : l'utilisateur courant est-il administrateur ?
--    SECURITY DEFINER pour pouvoir lire admin_users depuis une policy
--    sans provoquer de recursion RLS.
-- -----------------------------------------------------------------------------
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $func$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = uid
      and a.is_active
  );
$func$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 3. Table des experts
--
--    Chaque fiche porte à la fois la valeur brute saisie à l'origine
--    (`*_raw`) et sa classification canonique (`nationality`, `country`,
--    `region`, `domain`, `profession_category`), calculée côté application
--    à partir des tables de correspondance de `src/lib/data/`. La valeur
--    brute n'est jamais perdue : c'est elle qui permet de corriger la
--    classification plus tard sans ressaisie.
-- -----------------------------------------------------------------------------
create table if not exists public.experts (
  id                   uuid primary key default gen_random_uuid(),

  first_name           varchar(100) not null,
  last_name            varchar(100) not null,

  nationality_raw      varchar(150) not null,
  nationality          varchar(100) not null,
  country              varchar(150) not null,
  country_code         char(2),
  region               varchar(100) not null,

  institution          varchar(200),

  profession_raw       varchar(300) not null,
  profession_category  varchar(60)  not null,

  domain               varchar(80)  not null,
  specialty_raw        varchar(500) not null,

  cv_url               text,
  notes                text,

  created_at           timestamptz  not null default now(),
  updated_at           timestamptz  not null default now(),

  constraint experts_first_name_not_blank  check (length(btrim(first_name)) >= 2),
  constraint experts_last_name_not_blank   check (length(btrim(last_name))  >= 2),
  constraint experts_nationality_not_blank check (length(btrim(nationality)) >= 2),
  constraint experts_country_not_blank     check (length(btrim(country))    >= 2),
  constraint experts_profession_not_blank  check (length(btrim(profession_raw)) >= 2),
  constraint experts_domain_not_blank      check (length(btrim(domain))     >= 2),
  constraint experts_cv_url_format         check (
    cv_url is null or cv_url ~* '^https?://'
  )
);

comment on table public.experts is
  'Reseau des experts QA-Doc (evaluateurs pairs des formations doctorales).';

create index if not exists experts_created_at_idx  on public.experts (created_at desc);
create index if not exists experts_domain_idx      on public.experts (domain);
create index if not exists experts_region_idx      on public.experts (region);
create index if not exists experts_nationality_idx on public.experts (nationality);
create index if not exists experts_last_name_idx   on public.experts (lower(last_name));
create index if not exists experts_institution_idx on public.experts (lower(institution));

-- -----------------------------------------------------------------------------
-- 4. Horodatage serveur de la mise à jour
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $func$
begin
  new.updated_at := now();
  return new;
end;
$func$;

drop trigger if exists experts_set_updated_at on public.experts;
create trigger experts_set_updated_at
  before update on public.experts
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 5. Row Level Security
--    Base interne : aucun accès public. Seuls les administrateurs actifs
--    peuvent lire, créer, modifier ou supprimer une fiche.
-- -----------------------------------------------------------------------------
alter table public.experts    enable row level security;
alter table public.admin_users enable row level security;

-- Migration re-executable : on repart d'un etat propre
drop policy if exists experts_admin_select   on public.experts;
drop policy if exists experts_admin_insert   on public.experts;
drop policy if exists experts_admin_update   on public.experts;
drop policy if exists experts_admin_delete   on public.experts;
drop policy if exists admin_users_select_self on public.admin_users;

create policy experts_admin_select
  on public.experts
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy experts_admin_insert
  on public.experts
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy experts_admin_update
  on public.experts
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy experts_admin_delete
  on public.experts
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- Un administrateur peut lire sa propre fiche (nom affiche, role).
create policy admin_users_select_self
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 6. Privileges de table (moindre privilege, en amont de RLS)
-- -----------------------------------------------------------------------------
revoke all on public.experts     from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;

grant select, insert, update, delete on public.experts     to authenticated;
grant select                         on public.admin_users to authenticated;
