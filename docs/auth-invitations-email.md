# Invitations et emails (Supabase Auth)

## Problème de fond

1. **Pourquoi "Waiting for verification" pour les invités ?**
   - L’app utilise **Inviter par email** (`inviteUserByEmail`). Supabase crée le compte puis envoie un email avec un lien pour définir le mot de passe.
   - Tant que l’utilisateur n’a pas cliqué sur ce lien, son compte reste en attente de vérification (`email_confirmed_at` / `confirmed_at` à `NULL`), d’où "Waiting for verification" dans le tableau Users.

2. **Pourquoi les 3 premiers n’ont reçu aucun email (ni boîte de réception ni spams) ?**
   - Sans **SMTP personnalisé**, Supabase envoie les emails avec son propre envoi par défaut. Ce chemin est souvent peu fiable : limites d’envoi, blocages par les FAI, filtres anti-spam. Les emails d’invitation (et de confirmation) peuvent ne jamais arriver.

3. **Pourquoi test1@gmail.com pouvait se connecter sans avoir "confirmé" ?**
   - Compte créé **avec un mot de passe** (inscription classique ou autre flux), pas via **Inviter par email**. Avec "Confirm email" désactivé, Supabase peut considérer ces comptes comme confirmés à la création.
   - Les 3 autres ont été créés **uniquement via l’invitation** ; ils restent non confirmés tant qu’ils n’ont pas cliqué sur le lien (ou qu’on ne les confirme pas côté serveur).

## Ce qui a été corrigé dans l’app

- **Après chaque invitation**, le compte créé est maintenant **marqué comme confirmé** tout de suite (appel Admin API `email_confirm: true`). Les **futurs** invités pourront donc se connecter dès qu’ils ont un mot de passe, même si l’email d’invitation n’arrive pas.
- Ils devront quand même **définir un mot de passe** : soit via le lien reçu par email (si l’email arrive), soit via une fonctionnalité "Mot de passe oublié" si vous l’ajoutez plus tard.

## À faire de votre côté

### 1. Débloquer les 3 utilisateurs déjà créés (une seule fois)

Dans le **Dashboard Supabase → SQL Editor**, exécuter :

```sql
-- confirmed_at est une colonne générée, ne pas la modifier.
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
```

Ensuite, ils doivent **définir un mot de passe** : soit en utilisant le lien "Réinitialiser le mot de passe" depuis la page de connexion (si vous ajoutez cette action), soit en recevant un nouvel email d’invitation après avoir configuré SMTP (voir ci‑dessous).

### 2. Configurer un SMTP fiable (recommandé)

Pour que les **prochains** emails (invitations, réinitialisation de mot de passe) soient bien envoyés et reçus :

1. **Supabase Dashboard** → **Project Settings** → **Auth** → **SMTP Settings**.
2. Activer **Custom SMTP** et renseigner un fournisseur fiable (SendGrid, Resend, Mailgun, ou le SMTP de votre hébergeur/domaine).
3. Sans SMTP personnalisé, les emails restent envoyés par l’envoi par défaut Supabase et peuvent continuer à ne pas arriver.

### 3. (Optionnel) Lien "Mot de passe oublié"

Pour que les invités qui n’ont jamais reçu l’email puissent quand même définir un mot de passe, vous pouvez ajouter une page "Mot de passe oublié" qui appelle `resetPasswordForEmail`. Avec un bon SMTP, l’email de réinitialisation aura alors de bonnes chances d’arriver.

---

**En résumé** : le problème réel est la **non‑livraison des emails** (pas de SMTP fiable) et le fait que les **invités** restaient non confirmés tant qu’ils n’avaient pas cliqué sur le lien. L’app confirme maintenant les invités à la création ; pour les anciens comptes, exécutez le SQL ci‑dessus et configurez SMTP pour les prochains.
