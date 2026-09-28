-- =============================================================================
-- QA-Doc -- Migration 0003 : domaines alignés sur la nomenclature REESAO
-- =============================================================================
-- Le référentiel de domaines passe de dix à huit valeurs, celles du réseau
-- REESAO (Réseau pour l'Excellence de l'Enseignement Supérieur en Afrique de
-- l'Ouest) :
--   Sciences de la Santé -- Sciences et Technologies -- Sciences Agronomiques
--   Sciences Juridiques, Politiques et de l'Administration
--   Sciences Économiques et de Gestion -- Sciences de l'Homme et de la Société
--   Lettres, Langues et Arts -- Sciences de l'Éducation et de la Formation
--
-- Deux anciens domaines n'ont pas d'équivalent direct dans cette liste et
-- rejoignent "Sciences et Technologies", le plus proche (architecture et
-- urbanisme, sciences de la terre) ; un domaine est simplement renommé
-- (juridiques / politiques / administratives -> ... et de l'Administration).
--
-- Migration re-executable : chaque UPDATE ne touche que les lignes encore
-- sur l'ancien libellé. Aucune ligne n'est supprimée ; les fiches ajoutées
-- depuis l'espace d'administration suivent déjà la nouvelle classification
-- (voir src/lib/data/disciplines.ts) et ne sont pas concernées.
-- =============================================================================

update public.experts
set domain = 'Sciences Juridiques, Politiques et de l''Administration'
where domain = 'Sciences Juridiques, Politiques et Administratives';

update public.experts
set domain = 'Sciences et Technologies'
where domain in ('Architecture et Urbanisme', 'Sciences de la Terre et de l''Environnement');

-- Vérification : doit renvoyer exactement les huit domaines REESAO.
select domain, count(*) as total
from public.experts
group by domain
order by total desc;
