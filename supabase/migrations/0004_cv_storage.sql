-- =============================================================================
-- QA-Doc -- Migration 0004 : bucket de stockage pour les CV téléversés
-- =============================================================================
-- Permet d'envoyer un CV directement (PDF, Word) plutôt que de ne coller
-- qu'un lien Google Drive. Le lien externe reste possible en parallèle :
-- `experts.cv_url` accepte l'un ou l'autre indifféremment.
--
-- Bucket public : comme un lien Drive partagé, quiconque possède l'URL peut
-- ouvrir le fichier -mais le nom de fichier (un UUID généré côté serveur,
-- voir src/lib/storage/cv.ts) le rend impossible à deviner ou à lister sans
-- y être autorisé. Aucune policy SELECT n'est nécessaire : un bucket public
-- sert ses fichiers sans passer par RLS.
--
-- Migration re-executable.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', true)
on conflict (id) do nothing;

drop policy if exists cvs_admin_insert on storage.objects;
drop policy if exists cvs_admin_update on storage.objects;
drop policy if exists cvs_admin_delete on storage.objects;

-- Téléverser, remplacer ou supprimer un CV est réservé aux administrateurs
-- actifs -même fonction is_admin() que pour la table experts.
create policy cvs_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'cvs' and public.is_admin(auth.uid()));

create policy cvs_admin_update
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'cvs' and public.is_admin(auth.uid()))
  with check (bucket_id = 'cvs' and public.is_admin(auth.uid()));

create policy cvs_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'cvs' and public.is_admin(auth.uid()));
