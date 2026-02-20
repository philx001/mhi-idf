# Recommandations UI/UX — MHI-IDF

Document de référence pour le design et l’évolution de l’interface. À utiliser plus tard (templates, inspirations, conventions).

---

## 1. Priorité : intégration Cursor (règles IA)

- **Fichier** : `.cursor/rules/ui-design.mdc`
- **Rôle** : l’IA respecte la stack (Next.js, Tailwind, shadcn), le layout (AppShell, AppSidebar), les conventions (composants UI, français) et ne casse pas les routes ni la logique métier.
- **Périmètre** : `app/**/*.tsx`, `components/**/*.tsx`.

---

## 2. Stack actuelle (sans téléchargement)

- **Next.js 15** (App Router), **React 19**, **Tailwind CSS 3**
- **shadcn/ui** : composants dans `components/ui/` (Button, Card, Badge). Helper `cn()` dans `@/lib/utils`.
- **Thème** : variables CSS dans `app/globals.css` (`:root` et `.dark`). Couleurs sémantiques : `background`, `foreground`, `primary`, `card`, `muted`, `destructive`, `sidebar`, etc.
- **Layout** : **AppShell** affiche la **sidebar** sur toutes les pages sauf `/` et `/login`. **AppSidebar** : navigation principale.

---

## 3. Templates à télécharger plus tard (référence)

### TailAdmin

- **Où** : tailadmin.com → « Free Download - Bundle » → « Download TailAdmin Next.js ».
- **Contenu** : dashboards, variations de mises en page, 500+ éléments, fichiers Tailwind.
- **Usage recommandé** : ne pas remplacer le projet. Télécharger, s’en inspirer (layouts, cartes, tableaux), puis recopier les idées dans l’app avec les composants shadcn existants pour garder un design system unique.

### Autres (ChatGPT / Cursor)

- **Shadcn Dashboard** : déjà couvert par l’usage de shadcn dans le projet.
- **Tailkit** : blocs UI (headers, sections) ; recréer avec shadcn + Tailwind si besoin.
- **Open / Solid / Notus** : utiles pour landing ou pages type SaaS ; optionnel.

---

## 4. Enrichir le visuel sans télécharger

Idées à appliquer avec les éléments déjà en place :

- **Thème** : couleur principale (ex. bleu/rouge MHI) dans `app/globals.css` pour liens, boutons, badges.
- **Cartes** : ombre et hover plus marqués, bordures douces, espacement aéré.
- **Bloc d’accueil** : titre + courte phrase de bienvenue sur le tableau de bord.
- **Cartes « stats »** : ex. « X événements à venir », « X notifications » en haut de page.
- **Hiérarchie** : titres de sections plus marqués (taille, graisse).
- **Micro-interactions** : transitions au survol sur cartes et liens (Tailwind/shadcn).

---

## 5. Cohérence et interactivité

- **Toutes les pages** : même zone de contenu (`p-4 sm:p-6 lg:p-8`), même sidebar quand on est connecté, mêmes composants (Card, Badge, Button).
- **Couleurs** : utiliser les variables du thème (`primary`, `muted`, etc.) partout ; pas de couleurs en dur sauf pour le logo (bleu/rouge MHI).
- **Interactif** : liens et boutons avec états hover/focus visibles ; cartes cliquables avec feedback (hover, transition).

---

## 6. Logo MHI

- **Fichier** : placer l’image du logo (M bleu, HI rouge, « Ministère des Hommes d’Impact ») dans **`public/mhi-logo.png`**. Si le fichier est absent, le composant `MhiLogo` affiche le texte « MHI-IDF » en fallback.
- **Composant** : `components/MhiLogo.tsx` (tailles : `sidebar`, `home`, `small`). Utilisé dans la sidebar, la page d’accueil et la page de connexion.
- **Charte** : bleu (`--mhi-primary` / `--primary`) et rouge (`--mhi-accent` / `--accent`) ; à respecter pour cohérence.

---

## 7. Ne pas casser

- Routes existantes et paramètres (`churches/[id]`, `events/[id]/edit`, etc.).
- Logique métier et requêtes Supabase : modifier uniquement le rendu (JSX / composants), pas les appels données.
