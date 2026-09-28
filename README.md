# QA-Doc -Base des experts

Plateforme de visualisation et de gestion du réseau d'experts QA-Doc :
tableau de bord avec des statistiques claires sur la répartition du réseau
(domaine scientifique, nationalité, région, établissement, profession), et
un espace d'administration pour consulter, rechercher, corriger et compléter
les fiches.

Ce projet reprend l'architecture, la stack et la charte graphique de
[anaq-visiteurs](https://github.com/CMCode2001/anaq-visiteurs) (même auteur),
adaptées à un jeu de données différent : un réseau d'experts plutôt qu'un
registre de visiteurs.

---

## 1. Origine des données et restructuration

La base source est un export Excel (`BdD_experts_QADoc.xlsx`, feuille
« BdD experts QA-Doc ») : 438 fiches d'experts avec sept colonnes de saisie
libre (prénom, nom, nationalité, établissement, profession, discipline, lien
du CV). Cette feuille est la version relue -on l'a préférée à la feuille
« Réponses au formulaire 1 » après comparaison ligne à ligne : elle corrige
déjà une partie de la casse et complète des établissements laissés vides
dans les réponses brutes du formulaire.

La restructuration appliquée par ce projet :

1. **Chaque valeur brute est conservée** (`*_raw` en base) -rien n'est
   écrasé, ce qui permet de corriger une classification sans ressaisir la
   fiche.
2. **Une classification canonique est calculée en plus**, à partir de trois
   tables de correspondance construites à la main sur les valeurs réellement
   présentes dans le fichier (`src/lib/data/`) :
   - `nationalities.ts` -29 nationalités distinctes → nationalité au libellé
     harmonisé, pays, code ISO 3166-1 (quand il existe un pays unique) et
     région géographique ;
   - `disciplines.ts` -29 intitulés de discipline (dont des intitulés
     trilingues FR // EN // PT, des combinaisons séparées par « ; » et des
     doublons de casse) → l'un des huit domaines du REESAO (Réseau pour
     l'Excellence de l'Enseignement Supérieur en Afrique de l'Ouest) ;
   - `professions.ts` -28 intitulés de profession → l'une de six catégories
     (Enseignant-Chercheur, Enseignant, Chercheur, Direction / Gouvernance,
     Assurance Qualité / Audit, Doctorant / Assistant).
3. **La même classification s'applique aux nouvelles fiches** créées depuis
   l'espace d'administration (`src/lib/validation/expert.ts`) : la base reste
   cohérente que la ligne vienne de l'import initial ou d'une saisie
   manuelle ultérieure.
4. **`scripts/import-experts.mjs`** relit le classeur Excel et génère
   `supabase/seed.sql` -les instructions `insert` prêtes à exécuter après les
   migrations. Un nouvel export du formulaire peut être réimporté de la même
   façon.

Le détail exact de chaque correspondance (quelle nationalité tombe dans
quelle région, quelle discipline dans quel domaine) est documenté en
commentaire dans les trois fichiers de `src/lib/data/`.

> Le fichier source contient au moins une fiche en doublon apparent (« Sidikiba
> SIDIBE », deux nationalités renseignées différemment). Aucune déduplication
> automatique n'a été appliquée -une fusion de fiches est une décision
> éditoriale, pas une normalisation de format ; les deux fiches sont
> importées telles quelles et se corrigent depuis l'espace d'administration.

---

## 2. Fonctionnalités

**Espace administrateur** (`/admin`, authentifié)

- Tableau de bord : total d'experts, nombre de nationalités / domaines /
  établissements distincts, répartition par domaine scientifique (anneau),
  par région géographique (anneau), classement des nationalités et des
  établissements les plus représentés, répartition par catégorie de
  profession.
- Liste des experts : recherche plein texte (nom, établissement, nationalité,
  spécialité), filtres par domaine / région / catégorie de profession, tri,
  pagination.
- Fiche détaillée avec la classification appliquée, création et modification
  de fiches, suppression avec confirmation obligatoire.
- Export **Excel** (`.xlsx`) de la liste filtrée.
- **Administrateurs** (réservé aux super-administrateurs) : ajout d'un
  nouveau compte -création du compte Supabase Auth et de son habilitation en
  un seul geste, mot de passe temporaire affiché une seule fois ; liste des
  comptes avec activation / désactivation.

**Racine du site** (`/`) : redirige directement vers `/admin/login` -pas de
vitrine publique, l'application est un outil interne. Aucune donnée
personnelle n'est exposée sans authentification -RLS PostgreSQL l'interdit
même en cas d'oubli côté application.

---

## 3. Stack technique

| Domaine          | Choix                                |
| ----------------- | ------------------------------------ |
| Framework         | Next.js 15 (App Router) + React 19   |
| Langage           | TypeScript (strict)                  |
| Styles            | Tailwind CSS v4                      |
| Composants        | shadcn/ui (Radix UI)                 |
| Base de données   | PostgreSQL via Supabase              |
| Authentification  | Supabase Auth                        |
| Validation        | Zod (client **et** serveur)          |
| Graphiques        | Recharts / composants HTML natifs    |
| Export Excel      | SheetJS (`xlsx`)                     |
| Déploiement       | Vercel                               |

Aucun serveur backend dédié : Supabase joue le rôle de Backend-as-a-Service.

## 4. Architecture

```text
src/
├── app/
│   ├── page.tsx                     # Page publique
│   ├── admin/
│   │   ├── actions.ts               # Server Actions (connexion, CRUD)
│   │   ├── login/
│   │   └── (protected)/
│   │       ├── layout.tsx           # requireAdmin() + coquille d'admin
│   │       ├── dashboard/
│   │       └── experts/[id]|new/
│   └── api/admin/exports/excel/
├── components/
│   ├── ui/                          # Primitives shadcn/ui
│   ├── admin/                       # Tableau, filtres, formulaire, exports
│   └── charts/                      # Anneau et classement (Recharts / HTML)
├── lib/
│   ├── data/                        # Tables de correspondance (restructuration)
│   ├── supabase/                    # client / server / admin / middleware
│   ├── repositories/                # Accès aux données (contrat + Supabase)
│   ├── services/                    # Logique métier
│   ├── validation/                  # Schémas Zod + filtres d'URL
│   ├── exports/                     # Excel
│   └── auth/                        # Garde d'accès administrateur
└── types/
supabase/
├── migrations/                      # Schéma SQL, RLS, compte administrateur
└── seed.sql                         # Généré par scripts/import-experts.mjs
scripts/
└── import-experts.mjs               # Excel source -> supabase/seed.sql
```

Comme dans le projet dont ce dépôt s'inspire, les pages ne parlent jamais
directement à Supabase : elles appellent `lib/services/experts.ts`, qui
délègue à l'interface `ExpertRepository`. Basculer vers une autre API
consiste à écrire une implémentation alternative dans
`lib/repositories/index.ts`, sans toucher à l'UI.

---

## 5. Installation

### 5.1 Créer le projet Supabase

1. [supabase.com](https://supabase.com) → **New project**
2. Choisir un mot de passe de base de données et le conserver en lieu sûr

### 5.2 Exécuter les migrations et le seed

Dans **SQL Editor** :

1. Exécuter `supabase/migrations/0001_init.sql` (table `experts`, table
   `admin_users`, RLS)
2. Exécuter `supabase/seed.sql` pour charger les 438 fiches déjà normalisées
   (ou repartir de zéro et utiliser uniquement l'espace d'administration)
3. Créer un utilisateur dans **Authentication → Users → Add user** (cocher
   « Auto Confirm User »), remplacer l'adresse dans
   `supabase/migrations/0002_admin_account.sql`, puis l'exécuter

Pour une base déjà en place avant l'adoption de la nomenclature REESAO à huit
domaines (voir § 1), exécuter en plus `supabase/migrations/0003_reesao_domains.sql`
-elle met à jour les fiches existantes sans y toucher autrement. Une
installation neuve n'en a pas besoin : `seed.sql` charge déjà les bons libellés.

### 5.3 Variables d'environnement

```bash
cp .env.example .env.local
```

Renseigner depuis **Supabase → Project Settings → API** :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` -clé **Secret key** dans le nouveau tableau de
bord Supabase -est nécessaire pour la page **Administrateurs**
(`/admin/team`) : créer un compte Supabase Auth depuis l'application exige
cette clé. Le reste de l'application (experts, tableau de bord) fonctionne
sans elle, via RLS.

> ⚠️ Ne jamais préfixer cette clé par `NEXT_PUBLIC_` ni l'exposer au
> navigateur : elle contourne entièrement RLS. Le module qui la lit est
> marqué `server-only`.

### 5.4 Lancement local

```bash
npm install
npm run dev
```

- Page publique : <http://localhost:3000>
- Espace administrateur : <http://localhost:3000/admin>

```bash
npm run build       # build de production
npm run typecheck   # vérification TypeScript
npm run lint        # ESLint
```

### 5.5 Réimporter la base source

```bash
node scripts/import-experts.mjs --input /chemin/vers/BdD_experts_QADoc.xlsx
```

Régénère `supabase/seed.sql`. Le script n'écrit rien directement en base -le
fichier généré doit être relu puis exécuté manuellement dans le SQL Editor,
pour garder une trace versionnée de ce qui a été importé.

### 5.6 Déploiement Vercel

1. Pousser le dépôt sur GitHub
2. [vercel.com](https://vercel.com) → **Add New… → Project**
3. Renseigner les variables d'environnement (Production, Preview,
   Development)
4. **Deploy**

---

## 6. Sécurité

Base interne, sans accès public : seuls les comptes présents dans
`admin_users` peuvent lire ou modifier la table `experts` (RLS PostgreSQL,
vérifiée indépendamment de l'application). Trois barrières successives :
middleware (redirection), `requireAdmin()` côté serveur, policies RLS.

---

## 7. Personnalisation

| Élément                     | Où le modifier                     |
| ---------------------------- | ----------------------------------- |
| Nom, sous-titre de l'app     | `src/lib/constants.ts` (objet `ORG`) |
| Marque (badge + libellé)     | `src/components/brand-mark.tsx`     |
| Couleurs institutionnelles   | `src/app/globals.css`               |
| Correspondances nationalité / discipline / profession | `src/lib/data/` |
