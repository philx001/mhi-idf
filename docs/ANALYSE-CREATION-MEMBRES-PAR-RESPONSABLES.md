# Analyse : Création de membres par les responsables (siège, Croissy, églises locales)

**Date** : 19 février 2026  
**Contexte** : Permettre au responsable du siège, à celui de l’église de Croissy et à chaque responsable d’église locale d’ajouter des membres dans leur église respective.

---

## 1. État actuel des droits de création de membres

### 1.1 Qui peut inviter aujourd’hui ?

| Rôle | Peut inviter (créer un compte) ? | Où ? |
|------|----------------------------------|------|
| **Responsable siège** | ✅ Oui (via `inviteUserByEmail`) | Page Gestion des utilisateurs — **mais le bouton n’est pas affiché** |
| **Responsable église (Croissy)** | ❌ Non | — |
| **Responsable église (locale)** | ❌ Non | — |
| **Membre** | ❌ Non | — |

### 1.2 Implémentation actuelle

- **Action** : `inviteUserByEmail` dans `app/admin/actions.ts` (lignes 360–389)
- **Contrôle d’accès** : `const siege = await isSiege(); if (!siege) return { error: "Accès refusé" };`
- **Composant UI** : `InviteForm` existe dans `app/admin/gestion-utilisateurs/InviteForm.tsx` mais **n’est jamais importé ni affiché** sur la page Gestion des utilisateurs.
- **Flux** :
  1. Supabase `auth.admin.inviteUserByEmail(email, { redirectTo })` crée le compte et envoie un email avec un lien pour définir le mot de passe.
  2. L’app marque immédiatement l’email comme confirmé (`email_confirm: true`) pour que l’utilisateur puisse se connecter même si l’email n’arrive pas.
  3. L’utilisateur apparaît dans « Utilisateurs sans rôle » ; un responsable lui attribue ensuite un rôle et une église.

### 1.3 Ce que les responsables d’église peuvent faire aujourd’hui

- **Page Gestion des utilisateurs** : accessible à tous les responsables (siège, Croissy, églises locales).
- **Responsable Croissy** : voit tous les utilisateurs et peut attribuer des rôles à tous.
- **Responsable église locale** : ne voit que les membres de son église ; pour les « Utilisateurs sans rôle », il ne voit pas la liste (message lui indiquant d’inviter via le bouton ou d’aller au profil église).
- **AddChurchMemberForm** (profil église) : permet d’ajouter des utilisateurs **déjà existants** (sans rôle) à l’église ; ne crée pas de compte.

### 1.4 Incohérence actuelle

- La doc (TUTO-CONFIG, ChurchMembersSection) mentionne le bouton « + Inviter un membre » sur la page Gestion des utilisateurs.
- Ce bouton n’est **jamais rendu** : `InviteForm` n’est pas importé dans `page.tsx`.
- Même le responsable siège ne peut donc pas inviter via l’interface actuelle.

---

## 2. Processus souhaité (votre demande)

1. Le responsable (siège, Croissy ou église locale) crée un utilisateur.
2. Rôle par défaut : **membre**.
3. Saisie de l’email.
4. Un mot de passe temporaire est généré automatiquement.
5. Un email automatique est envoyé au nouvel utilisateur.
6. Le lien dans l’email est valable **24 h**.
7. Après création, possibilité d’attribuer un autre rôle.

---

## 3. Ce que ce changement impliquerait

### 3.1 Modifications côté code

| Fichier / zone | Modification |
|----------------|--------------|
| `app/admin/actions.ts` | Étendre `inviteUserByEmail` : autoriser responsable siège **ou** responsable Croissy **ou** responsable église locale (avec vérification de périmètre si besoin). |
| `app/admin/gestion-utilisateurs/page.tsx` | Importer et afficher `InviteForm` pour les utilisateurs autorisés (siège, Croissy, responsable église). |
| `app/churches/[id]/ChurchMembersSection.tsx` ou `AddChurchMemberForm.tsx` | Optionnel : proposer un bouton « Inviter un membre » directement depuis le profil église pour les responsables. |
| `docs/ROLES-ET-DROITS.md` | Mettre à jour le tableau : « Invitation par email » → ✅ pour responsable siège, Croissy et responsable église. |

### 3.2 Contraintes de périmètre

- **Responsable siège** : peut inviter pour n’importe quelle église (attribution du rôle/église après).
- **Responsable Croissy** : peut inviter pour le réseau (idem).
- **Responsable église locale** : doit pouvoir inviter **uniquement pour son église**.  
  → L’invitation crée un compte sans rôle ; l’attribution du rôle + église se fait ensuite. Un responsable d’église ne peut attribuer un rôle que pour **son** église (déjà géré par `assignRole`). Donc pas de changement de logique : il invite, puis attribue rôle + son église.

### 3.3 Supabase : mot de passe temporaire vs lien

- **Supabase `inviteUserByEmail`** : ne permet pas de définir un mot de passe temporaire. Il envoie un email avec un **lien** pour que l’utilisateur définisse son mot de passe.
- **Interprétation possible** : le « mot de passe temporaire » correspond au **lien magique** envoyé par email. L’utilisateur clique, définit son mot de passe, puis peut se connecter.
- **Alternative** : utiliser `auth.admin.createUser` avec un mot de passe temporaire, puis envoyer un email personnalisé (via Resend, SendGrid, etc.) avec ce mot de passe et/ou un lien de réinitialisation. Plus complexe et moins standard.

### 3.4 Expiration du lien à 24 h

- **Par défaut** : les liens OTP / invitation Supabase expirent après **1 h** (3600 s).
- **Config** : `mailer_otp_exp` (ou équivalent) dans le dashboard Supabase → Auth → Providers → Email.
- **Valeur max** : 86400 secondes (24 h).
- **À faire** : dans Supabase Dashboard → Auth → Email → « Email OTP Expiration » (ou paramètre équivalent), régler à **86400** (24 h).

### 3.5 Emails et SMTP

- Sans SMTP personnalisé, les emails Supabase peuvent ne pas arriver (voir `docs/auth-invitations-email.md`).
- **Recommandation** : configurer un SMTP fiable (Resend, SendGrid, Mailgun, etc.) dans Supabase.

---

## 4. Suggestions alternatives ou complémentaires

### 4.1 Garder le flux Supabase standard (recommandé)

- Utiliser `inviteUserByEmail` tel quel.
- L’utilisateur reçoit un email avec un lien pour définir son mot de passe (pas de mot de passe temporaire affiché à l’admin).
- Configurer l’expiration à 24 h dans Supabase.
- Avantages : simple, sécurisé, conforme aux bonnes pratiques.

### 4.2 Rôle par défaut « membre »

- Actuellement, l’invitation crée un compte **sans rôle** ; le rôle est attribué ensuite.
- Vous souhaitez un rôle par défaut « membre ». Deux options :
  - **A)** Créer le compte, puis immédiatement appeler `assignRole(userId, "membre", churchId)` dans l’action d’invitation. Il faut alors passer `churchId` à `inviteUserByEmail` (église du responsable qui invite).
  - **B)** Garder le flux actuel : inviter → utilisateur sans rôle → attribution manuelle du rôle (membre ou autre). Plus flexible (on peut attribuer directement responsable église si besoin).

### 4.3 Invitation depuis le profil église

- Ajouter un bouton « Inviter un membre » dans la section Membres du profil église.
- Au clic : ouverture d’un formulaire (email) ; à la création, attribution automatique du rôle « membre » pour cette église.
- Avantage : flux plus direct pour les responsables d’église.

### 4.4 Double envoi (mot de passe + lien)

- Si vous tenez à un mot de passe temporaire **affiché** à l’admin :
  - Utiliser `createUser` avec un mot de passe aléatoire.
  - Envoyer un email personnalisé (Edge Function ou service externe) avec ce mot de passe.
  - Envoyer aussi un lien de réinitialisation (valable 24 h) pour que l’utilisateur puisse choisir son propre mot de passe.
- Inconvénients : complexité, gestion des mots de passe temporaires, risques de sécurité.

---

## 5. Plan d’action proposé

1. **Corriger l’affichage** : intégrer `InviteForm` dans la page Gestion des utilisateurs pour les utilisateurs autorisés.
2. **Étendre les droits** : modifier `inviteUserByEmail` pour autoriser responsable siège, responsable Croissy et responsable église locale.
3. **Configurer Supabase** : expiration des liens à 24 h (86400 s) ; SMTP personnalisé si pas encore fait.
4. **Optionnel** : ajouter un formulaire d’invitation dans la section Membres du profil église, avec attribution automatique du rôle « membre » pour l’église courante.
5. **Documentation** : mettre à jour `ROLES-ET-DROITS.md` et les textes d’aide (ChurchMembersSection, AddChurchMemberForm).

---

## 6. Résumé

| Aspect | État actuel | Après modification |
|--------|-------------|--------------------|
| Qui peut inviter | Responsable siège uniquement (et le bouton n’est pas affiché) | Siège, Croissy, responsable église locale |
| Où inviter | Page Gestion des utilisateurs (bouton manquant) | Page Gestion des utilisateurs + optionnel : profil église |
| Flux | Email avec lien pour définir le mot de passe | Inchangé (recommandé) |
| Expiration du lien | ~1 h (défaut) | 24 h (config Supabase) |
| Rôle par défaut | Aucun (attribution manuelle) | Membre possible en auto-attribution si souhaité |

Si vous validez ce plan, les prochaines étapes seront l’implémentation des modifications côté code et la mise à jour de la documentation.
