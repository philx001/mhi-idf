# MHI-IDF

Application collaborative pour le réseau d'églises d'Île-de-France.

## Prérequis

- Node.js 20+
- Compte Supabase (gratuit)

## Installation

```bash
npm install
```

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. **Choisir la région EU** (eu-central-1 ou eu-west-1) pour la conformité RGPD
3. Copier l'URL et la clé anon depuis Settings > API
4. Créer ou modifier `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
```

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Documentation

- [TUTO-CONFIG.md](TUTO-CONFIG.md) — Commandes pratiques et récurrentes
- [Architecture](_bmad-output/architecture.md)
- [PRD](_bmad-output/prd.md)
- [Epics & Stories](_bmad-output/epics.md)
