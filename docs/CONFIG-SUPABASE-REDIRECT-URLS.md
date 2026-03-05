# Configuration Supabase : Redirect URLs (obligatoire)

## Problème

Si les utilisateurs ne peuvent pas se connecter après une réinitialisation de mot de passe, ou si le lien « Mot de passe oublié » ne fonctionne pas correctement, la cause est souvent une **Redirect URL manquante** dans Supabase.

L’app utilise deux pages distinctes :
- **`/mot-de-passe-oublie`** : page où l’on demande l’envoi du lien
- **`/reinitialiser-mot-de-passe`** : page où l’on définit le nouveau mot de passe (après clic sur le lien reçu par email)

Quand l’utilisateur clique sur le lien dans l’email, Supabase le redirige vers `http://localhost:3000/reinitialiser-mot-de-passe`. **Cette URL doit être autorisée** dans Supabase.

## Configuration requise

Dans **Supabase Dashboard** → **Authentication** → **URL Configuration** → **Redirect URLs** :

### À ajouter (recommandé)

Ajoutez une URL générique pour autoriser toutes les redirections sur le port 3000 :

```
http://localhost:3000/**
```

Cela couvre notamment :
- `/login` (invitations)
- `/reinitialiser-mot-de-passe` (réinitialisation mot de passe)
- Toute autre route nécessaire

### URLs actuelles à vérifier

Les URLs du type `http://localhost:3000/**/mot-de-passe-oublie` ne correspondent **pas** à la page de réinitialisation (`/reinitialiser-mot-de-passe`). Elles sont trop restrictives.

**Solution** : ajoutez `http://localhost:3000/**` et vous pouvez supprimer les anciennes si vous le souhaitez.

## Étapes dans Supabase

1. Ouvrir **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Cliquer sur **Add URL**
3. Saisir : `http://localhost:3000/**`
4. Enregistrer

## Compte membre (philx001@yahoo.fr)

Si le compte a été créé par invitation mais que le lien d’invitation a expiré, l’utilisateur n’a **jamais défini de mot de passe**. Dans ce cas :

1. Configurer les Redirect URLs comme ci-dessus
2. Utiliser **« Mot de passe oublié »** avec l’email `philx001@yahoo.fr`
3. Vérifier la réception de l’email (y compris les spams)
4. Cliquer sur le lien et définir le mot de passe sur la page `/reinitialiser-mot-de-passe`
5. Se connecter avec le nouveau mot de passe

Si l’email n’arrive pas, configurer un **SMTP personnalisé** dans Supabase (voir `docs/auth-invitations-email.md`).
