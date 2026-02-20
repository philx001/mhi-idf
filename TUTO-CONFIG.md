# Tuto Config — Commandes pratiques MHI-IDF

Ce fichier regroupe les commandes utiles et récurrentes pour le projet. Il sera enrichi au fil du développement.

---

## 1. Démarrer le serveur de développement

### Cas 1 : PowerShell bloque l'exécution (erreur "l'exécution de scripts est désactivée")

**Solution A — Utiliser cmd :**
```cmd
cmd /c "cd /d c:\Users\bob.DESKTOP-DAOCA59\Documents\Divers\Applications Cursor\mhi-idf && npm run dev"
```

**Solution B — Corriger la politique PowerShell (une fois) :**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Puis lancer normalement :
```powershell
npm run dev
```

**Solution C — Contourner pour la session en cours uniquement :**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
npm run dev
```

### Cas 2 : PowerShell fonctionne normalement

```powershell
cd "c:\Users\bob.DESKTOP-DAOCA59\Documents\Divers\Applications Cursor\mhi-idf"
npm run dev
```

### Cas 3 : Terminal cmd (sans PowerShell)

```cmd
cd c:\Users\bob.DESKTOP-DAOCA59\Documents\Divers\Applications Cursor\mhi-idf
npm run dev
```

**URL de l'application :** [http://localhost:3000](http://localhost:3000)

---

## 2. Arrêter le serveur

Dans le terminal où le serveur tourne : **Ctrl + C**

---

## 3. Installation des dépendances

Après un `git pull` ou modification du `package.json` :

```powershell
npm install
```

*(Si erreur PowerShell, utiliser `cmd /c "cd /d [chemin] && npm install"`)*

---

## 4. Build de production

```powershell
npm run build
```

---

## 5. Lancer en mode production (après build)

```powershell
npm start
```

---

## 6. Configuration Supabase

**Fichier :** `.env.local` (à la racine du projet)

**Variables requises :**
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx...
```

**Note :** `SUPABASE_SERVICE_ROLE_KEY` est nécessaire pour la gestion des utilisateurs (révocation d'accès). À trouver dans Supabase > Settings > API Keys > Service role key. **Ne jamais exposer cette clé côté client.**

**Où trouver les valeurs :**
- URL : Supabase > Integrations > Data API > API URL (ou Settings > General)
- Clé : Supabase > Settings > API Keys > Publishable key

**Important :** Redémarrer le serveur après modification de `.env.local`

### Créer un utilisateur de test (Auth)

Pour tester la connexion, créez un utilisateur dans Supabase :

1. Supabase Dashboard > **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**
3. Saisissez un email et un mot de passe
4. (Optionnel) Si « Confirm email » est activé, désactivez-le temporairement dans Auth > Providers > Email pour tester sans confirmation

### Définir un utilisateur comme siège (Story 2.1)

Pour créer et modifier les profils d'églises, un utilisateur doit avoir le rôle « siège » :

1. Exécuter la migration : Supabase > **SQL Editor** > coller le contenu de `supabase/migrations/001_churches_and_roles.sql` > Run
2. Récupérer l'UUID de votre utilisateur : Supabase > **Authentication** > **Users** > cliquer sur l'utilisateur > copier l'**User UID**
3. Dans **SQL Editor**, exécuter (remplacer `VOTRE_USER_UID` par l'UUID copié) puis **cliquer sur Run** :
   ```sql
   INSERT INTO user_roles (user_id, role, church_id)
   VALUES ('VOTRE_USER_UID', 'siege', NULL)
   ON CONFLICT (user_id) DO UPDATE SET role = 'siege', church_id = NULL;
   ```

   **Important :** Cette requête fonctionne que l'utilisateur ait déjà un rôle ou non. Pensez à **cliquer sur Run** pour l'exécuter.

### Créer la table des événements (Epic 3)

Pour le tableau de bord et le calendrier :

1. Supabase > **SQL Editor** > Nouvelle requête
2. Copier le contenu de `supabase/migrations/003_events.sql`
3. Exécuter (Run)

### Calendriers par église et synthétique (visibilité privé/partagé)

Chaque église dispose de **deux types de calendrier** :

| Type | Visibilité | Où il apparaît |
|------|------------|----------------|
| **Privé** | Uniquement les membres de l’église | Calendrier de l’église (`/churches/[id]/calendrier`) |
| **Partagé** | Tout le réseau | Calendrier de l’église + **Calendrier synthétique du réseau** (`/calendar`) |

**Où choisir Privé ou Partagé :** Lors de la **création** ou de la **modification** d’un événement, le formulaire affiche un bloc mis en évidence **« Calendrier : Privé ou Partagé »** avec deux options :
- **Privé (uniquement mon église)** — l’événement n’est visible que sur le calendrier de l’église, par ses membres.
- **Partagé (visible par tout le réseau)** — l’événement apparaît aussi sur le calendrier synthétique, avec une couleur par église.

**Dans l’application :**
- **Calendrier par église** : Tableau de bord → « Mon calendrier d’église » ou fiche église → « Calendrier ». Les événements sont affichés avec une distinction visuelle (bleu = partagé, gris = privé) et une légende en bas de page. On peut créer un événement depuis un jour (＋) ; le choix Privé/Partagé se fait dans le formulaire.
- **Calendrier synthétique** : Tableau de bord → « Voir le calendrier ». Affiche uniquement les événements **partagés** de toutes les églises (grille du mois, programmes principaux, dates en commun, périodes creuses). Chaque église a une couleur dédiée (légende « Églises » sous la grille). Le responsable siège peut marquer des événements comme « programme principal ».

**Migration Supabase (à exécuter une fois) :**

1. Supabase > **SQL Editor** > Nouvelle requête
2. Copier le contenu de `supabase/migrations/011_events_visibility_and_main.sql`
3. Exécuter (Run)

Cette migration ajoute les colonnes `visibility` (private / shared) et `is_main` (programme principal) sur la table `events`, et adapte les droits de lecture (les événements privés ne sont visibles que par l’église concernée ou le siège).

### Carte des besoins (Epic 4)

Pour les demandes et propositions (intervenant, salle, ressource) :

1. Supabase > **SQL Editor** > Nouvelle requête
2. Copier le contenu de `supabase/migrations/005_demands_and_proposals.sql`
3. Exécuter (Run)

### Annonces du siège (Epic 5)

Pour les annonces officielles du siège :

1. Supabase > **SQL Editor** > Nouvelle requête
2. Copier le contenu de `supabase/migrations/006_announcements.sql`
3. Exécuter (Run)

### Gestion des utilisateurs et audit (Story 6.2)

Pour la révocation d'accès et la traçabilité :

1. Supabase > **SQL Editor** > Nouvelle requête
2. Copier le contenu de `supabase/migrations/007_admin_and_audit.sql`
3. Exécuter (Run)
4. Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local` (Settings > API Keys > Service role)

### Ajouter un membre à une église (utilisateur « Cergy » ou autre)

Les listes (Gestion des utilisateurs, section Membres d’une église) n’affichent **que les personnes qui ont déjà un compte** dans l’application.

**Important :** L’email de contact d’une église (ex. contact_cergy@gmail.com) est une **simple donnée du profil** (champ dans « Modifier le profil » de l’église). Il **ne crée pas de compte**. Pour que cette personne puisse se connecter et être ajoutée comme membre, il faut l’inviter (étape 1 ci‑dessous).

**Pour qu’une personne puisse être affectée à une église (ex. Cergy) :**

1. **Inviter la personne** : Tableau de bord → **Gestion des utilisateurs** → bouton **« + Inviter un membre »** → saisir son email. Un email d’invitation lui est envoyé.
2. **Elle accepte l’invitation** (lien dans l’email) et crée son mot de passe. Elle apparaît alors dans **« Utilisateurs sans rôle »**.
3. **Lui attribuer un rôle pour l’église** :
   - soit depuis **Gestion des utilisateurs** : « Attribuer un rôle » à côté de son email, puis choisir le rôle (Responsable église ou Contributeur) et l’église (ex. Eglise de Cergy) ;
   - soit depuis le **profil de l’église** : lien « Gérer les membres » ou « Membres », puis dans le formulaire « Utilisateur » choisir cette personne et le rôle, puis « Ajouter à l’église ».

**Où trouver l’aide dans l’application :**
- Sur le **profil d’une église** : section « Membres de cette église » avec l’encadré « La personne n’apparaît pas dans la liste ? » qui rappelle ces étapes.
- Sur **Gestion des utilisateurs** : un paragraphe sous le titre rappelle qu’il faut d’abord inviter pour que la personne apparaisse, puis lui attribuer un rôle et une église.

### Définir un contributeur pour une église (Story 2.3)

Pour qu'un utilisateur puisse modifier le profil de son église :

1. Exécuter la migration : `supabase/migrations/002_contributeur_update_church.sql`
2. Récupérer l'UUID de l'utilisateur et l'UUID de l'église (Table Editor > churches)
3. Dans **SQL Editor** :
   ```sql
   INSERT INTO user_roles (user_id, role, church_id)
   VALUES ('USER_UID', 'contributeur', 'CHURCH_UID');
   ```
   (ou `UPDATE user_roles SET role = 'contributeur', church_id = 'CHURCH_UID' WHERE user_id = 'USER_UID'` si l'utilisateur a déjà un rôle)

---

## 7. Dépannage Cursor / IDE

### Erreur « Agent Stream Start Failed »

**Message affiché :** *"The agent stream failed to start. Please reload the window to continue."*

**Signification :** Le flux de l’agent (connexion entre Cursor et l’IA) n’a pas pu démarrer. Cela peut bloquer les réponses de l’assistant ou certaines fonctionnalités de l’IDE. **Cette erreur vient de Cursor, pas du projet Next.js** — le serveur `npm run dev` peut tourner correctement malgré cette erreur.

**Actions recommandées :**

1. **Recharger la fenêtre** : `Ctrl+Shift+P` → « Developer: Reload Window » ou « Reload Window ».
2. **Vérifier la connexion Internet** — l’agent a besoin d’une connexion stable.
3. **Redémarrer Cursor** si le rechargement ne suffit pas.
4. **En cas de persistance** : utiliser « Copy Request Details » dans la boîte d’erreur pour copier l’identifiant (ex. `084a6c64-b406-467b-9770-2e39b2eb8139`) et le fournir au support Cursor.

---

## 8. Linter / vérification du code

```powershell
npm run lint
```

---

## À compléter au fil du projet

_(Les commandes suivantes seront ajoutées au fur et à mesure : migrations Supabase, déploiement, etc.)_
