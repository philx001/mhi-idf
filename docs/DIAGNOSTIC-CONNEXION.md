# Diagnostic : impossibilité de se connecter

## Problème corrigé : `NEXT_PUBLIC_APP_URL` invalide

**Cause** : La variable `NEXT_PUBLIC_APP_URL` contenait `http://localhost:3000/**` (avec `/**` à la fin). Cette valeur, copiée par erreur depuis la config Supabase « Redirect URLs », produisait une URL invalide pour les redirections d'invitation (`http://localhost:3000/**/login`).

**Correction** : La valeur a été remplacée par `http://localhost:3000` (sans `/**`).

**Important** : Si votre app tourne sur le port **3002**, modifiez `.env.local` :
```
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## Vérifier la correspondance du projet Supabase

Si la connexion échoue encore après correction, vérifiez que l'app utilise le **même projet** Supabase que celui où vous voyez vos utilisateurs.

1. Dans **Supabase Dashboard**, ouvrez la page où vous voyez la liste des utilisateurs (ex. `philippe.diarra@gmail.com`).
2. Regardez l'URL du navigateur : `https://supabase.com/dashboard/project/XXXXX/auth/users`
3. Le segment `XXXXX` est l'identifiant du projet (ex. `cvfxgtmcfxniueaqhvtb`).
4. Dans `.env.local`, vérifiez que `NEXT_PUBLIC_SUPABASE_URL` contient ce même identifiant :  
   `https://XXXXX.supabase.co`

Si les identifiants diffèrent, l'app se connecte à un autre projet, où vos utilisateurs n'existent pas.

---

## Compte admin : « J'ai dû réinitialiser le mot de passe après redémarrage »

Après un redémarrage du serveur, la **session** (cookies) est perdue. Il faut se **reconnecter**, pas forcément réinitialiser le mot de passe.

- Si vous avez utilisé « Mot de passe oublié » alors que l'ancien mot de passe fonctionnait encore, c'est peut‑être une confusion.
- **À tester** : au prochain redémarrage, essayez d'abord de vous connecter avec votre mot de passe actuel, sans réinitialiser.

## Compte membre : impossible de se connecter malgré les réinitialisations

### Causes possibles

1. **Redirect URL manquante** : ajouter `http://localhost:3000/**` dans Supabase → Authentication → URL Configuration → Redirect URLs. Voir `docs/CONFIG-SUPABASE-REDIRECT-URLS.md`.

2. **Préchargement des liens par le client email** : Gmail, Outlook et d'autres clients préchargent les liens pour les analyser. Cela peut invalider le token avant que l'utilisateur ne clique. L'utilisateur voit « Lien invalide ou expiré » ou le mot de passe ne s'enregistre pas.

3. **Email non reçu** : les emails Supabase par défaut ont des limites de débit. Vérifier les spams. Configurer un SMTP personnalisé si nécessaire.

### Solution fiable : définir le mot de passe depuis l'admin

Si « Mot de passe oublié » ne fonctionne pas, utilisez la fonction **« Définir mot de passe »** dans Gestion des utilisateurs :

1. Connectez-vous en tant que responsable (siège ou église).
2. Allez dans **Gestion des utilisateurs**.
3. Trouvez l'utilisateur concerné (avec ou sans rôle).
4. Cliquez sur **« Définir mot de passe »**.
5. Saisissez un mot de passe temporaire (min. 6 caractères) et confirmez.
6. Communiquez le mot de passe à l'utilisateur de manière sécurisée.
7. L'utilisateur peut se connecter immédiatement, puis modifier son mot de passe dans son profil.

## Si le problème persiste

1. **Réinitialiser le mot de passe** : utilisez « Mot de passe oublié » sur la page de connexion.
2. **Redémarrer le serveur** : après modification de `.env.local`, relancez `npm run dev`.
3. **Vider le cache du navigateur** : ou tester en navigation privée.
