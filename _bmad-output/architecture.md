---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
inputDocuments: ['_bmad-output/prd.md', '_bmad-output/product-brief-mhi-idf-2026-02-14.md']
workflowType: architecture
project_name: MHI-IDF
user_name: Bob
date: 2026-02-14
---

# Architecture Decision Document - MHI-IDF

**Aligné avec les principes d'implémentation :** Allégé, pragmatique, évolutif, maintenable.

---

## 1. Contexte projet et contraintes

### Contraintes du PRD

- **Application non commerciale** — usage interne réseau ecclésial
- **Temps limité** — implémentation allégée, pas d'approfondissement excessif
- **RGPD** — hébergement France/UE obligatoire
- **Évolutif** — ajustements techniques faciles ultérieurement

### Périmètre MVP

- Tableau de bord + calendrier
- Profils par église
- Carte des besoins (demandes/propositions)
- Annonces du siège
- Authentification sécurisée

---

## 2. Décisions techniques

### 2.1 Stack globale

| Composant | Choix | Justification |
|-----------|-------|---------------|
| **Frontend** | Next.js 14+ (App Router) | Full-stack simple, SSR, mobile-first, déploiement facile |
| **Base de données** | Supabase (PostgreSQL) | PostgreSQL managé, auth intégrée, région EU, gratuit pour petit volume |
| **Authentification** | Supabase Auth | Email/mot de passe, hashage sécurisé, intégré |
| **Hébergement frontend** | Vercel (région EU) | Gratuit, optimisé Next.js, RGPD |
| **Hébergement données** | Supabase (région EU) | PostgreSQL, région eu-central-1 ou eu-west-1 |

### 2.2 Pourquoi cette stack ?

- **Simplicité :** Un seul projet Next.js, pas de backend séparé
- **RGPD :** Vercel et Supabase proposent des régions UE
- **Gratuit :** Plans free adaptés à un usage interne non commercial
- **Documentation :** Stack courante, bien supportée par Cursor
- **Évolutif :** PostgreSQL scalable, Next.js modulaire

### 2.3 Alternatives envisagées (rejetées pour le MVP)

| Alternative | Raison du rejet |
|-------------|-----------------|
| Backend séparé (Node/Express) | Complexité inutile pour le MVP |
| Firebase | Moins adapté au modèle relationnel (églises, événements, demandes) |
| SQLite local | Pas d'hébergement multi-utilisateur, pas de région UE |

---

## 3. Structure des données (schéma simplifié)

### Entités principales

```
churches (églises)
├── id, name, description, contacts, specialities
├── created_at, updated_at
└── is_active

users (utilisateurs - géré par Supabase Auth)
├── id, email
└── church_id (lien vers église)

user_roles (siège vs contributeur)
├── user_id, role (siege | contributeur)
└── church_id (null si siège)

events (événements)
├── id, church_id, title, type, date, location, description
└── created_at, updated_at

needs (carte des besoins - demandes et propositions)
├── id, church_id, type (demande | proposition)
├── category (intervenant | salle | ressource)
├── title, description, status
└── created_at, updated_at

announcements (annonces du siège)
├── id, title, content, author_id
└── created_at
```

### Règles d'accès (Row Level Security - RLS)

- Seuls les utilisateurs authentifiés accèdent aux données
- Les contributeurs voient tout le réseau (pas de cloisonnement par église pour la lecture)
- Les contributeurs ne modifient que les données de leur église
- Le siège peut tout modifier et gérer les profils

---

## 4. Architecture applicative

### Structure du projet Next.js

```
mhi-idf/
├── app/
│   ├── (auth)/           # Pages login, etc.
│   ├── (dashboard)/      # Tableau de bord, calendrier
│   ├── churches/         # Profils églises
│   ├── needs/            # Carte des besoins
│   ├── announcements/    # Annonces du siège
│   └── api/              # API routes si besoin
├── components/           # Composants réutilisables
├── lib/
│   ├── supabase/         # Client Supabase
│   └── utils/            # Utilitaires
└── types/                # Types TypeScript
```

### Principes de structure

- **Modulaire :** Un dossier par domaine (churches, needs, announcements)
- **Composants légers :** Petits composants, responsabilités claires
- **Pas de sur-ingénierie :** Pas de state management complexe (React state + Supabase suffisent pour le MVP)

---

## 5. Authentification et sécurité

| Besoin | Solution |
|--------|----------|
| Connexion email/mot de passe | Supabase Auth |
| Hashage mots de passe | Géré par Supabase (bcrypt) |
| HTTPS | Vercel + Supabase par défaut |
| Rôles (siège vs contributeur) | Table `user_roles` + vérification côté serveur |
| Révocation d'accès | Désactivation utilisateur dans Supabase Auth |

---

## 6. Déploiement et hébergement

| Service | Région | Plan |
|---------|--------|------|
| Vercel (Next.js) | Europe | Hobby (gratuit) |
| Supabase (PostgreSQL + Auth) | eu-central-1 ou eu-west-1 | Free tier |

### Variables d'environnement

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (côté serveur uniquement)

---

## 7. Évolutivité future

### Modifications facilitées

- **Ajout de fonctionnalités :** Nouveaux dossiers dans `app/`, nouvelles tables Supabase
- **Changement de composant :** Structure modulaire permet de remplacer un module
- **Migration de données :** PostgreSQL + migrations Supabase

### Préparation Phase 2

- Schéma extensible (colonnes nullable pour fonctionnalités futures)
- Pas de couplage fort entre les modules
- Documentation des décisions dans ce document

---

## 8. Résumé des décisions

| Décision | Choix |
|----------|-------|
| Framework | Next.js 14+ (App Router) |
| Base de données | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hébergement | Vercel + Supabase (région EU) |
| Langage | TypeScript |
| Style | CSS Modules ou Tailwind (au choix) |

---

## 9. Prochaines étapes

1. **Initialiser le projet** — `npx create-next-app` avec TypeScript
2. **Configurer Supabase** — Projet, région EU, tables
3. **Implémenter l'auth** — Connexion/déconnexion
4. **Développer par module** — Churches → Events → Needs → Announcements
