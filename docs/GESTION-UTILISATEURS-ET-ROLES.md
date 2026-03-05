# Gestion des utilisateurs et rôles

Ce document regroupe les explications sur la gestion des utilisateurs, les actions disponibles et les options d'affichage de l'administrateur.

---

## 1. Différence entre « Retirer de l'église » et « Révoquer l'accès »

### Révoquer l'accès

- **Effet :** Bannit l'utilisateur dans Supabase Auth (`ban_duration` ≈ 100 ans).
- **Conséquence :** L'utilisateur ne peut plus se connecter.
- **Données :** L'utilisateur reste dans `auth.users` et dans `user_roles`. Son rôle et son église ne changent pas.
- **Réversibilité :** Oui. Le bouton devient « Restaurer l'accès » et lève le ban. L'utilisateur peut se reconnecter sans changement de mot de passe.

### Retirer de l'église

- **Effet :** Supprime la ligne dans `user_roles` (association utilisateur ↔ église).
- **Conséquence :** L'utilisateur n'a plus de rôle pour cette église.
- **Données :** L'utilisateur reste dans `auth.users` (son email reste en base). Seule la ligne dans `user_roles` est supprimée.
- **Réversibilité :** Non pour cette église. Pour lui redonner accès, il faut lui attribuer un nouveau rôle via « Modifier le rôle » (ou l'inviter à nouveau).

### Résumé

| Action | Temporaire / Définitif | Utilisateur en base | Peut se reconnecter ? |
|--------|------------------------|---------------------|------------------------|
| **Révoquer** | Temporaire (réversible via « Restaurer l'accès ») | Oui | Oui, après restauration, sans changer le mot de passe |
| **Retirer** | Définitif pour cette église | Oui (email conservé) | Oui, si on lui attribue un nouveau rôle via « Modifier le rôle » |

### Réponses aux questions fréquentes

1. **Retirer = définitif, Révoquer = temporaire ?**  
   Oui : « Retirer » est définitif pour cette église ; « Révoquer » est temporaire car on peut « Restaurer l'accès ».

2. **Si on retire un utilisateur, son email est-il supprimé ?**  
   Non. L'email reste dans `auth.users`. Seule la ligne dans `user_roles` est supprimée.

3. **Peut-on lui modifier le mot de passe pour qu'il se reconnecte ?**  
   Pas nécessaire. Un utilisateur retiré peut être ré-affecté via « Modifier le rôle » pour lui redonner une église. Il pourra alors se reconnecter avec son mot de passe actuel. « Définir mot de passe » sert surtout à initialiser ou réinitialiser le mot de passe (par exemple après une invitation).

---

## 2. Affichage de l'admin comme responsable d'église (Croissy)

### Contexte

Un administrateur peut aussi être responsable de l'église de Croissy. Pour les autres membres et responsables d'églises, il peut être souhaitable qu'il apparaisse uniquement comme « Responsable église – Église de Croissy » et non comme Admin.

### Options envisagées

#### Option 1 : Associer l'admin à Croissy dans `user_roles`

**Idée :** Donner à l'admin une ligne dans `user_roles` avec `church_id = Croissy`.

**Variantes :**
- **A)** Autoriser plusieurs lignes par utilisateur : une pour admin, une pour responsable_eglise Croissy.
- **B)** Garder une seule ligne : `role = 'admin'`, `church_id = Croissy`.

**Avantages :** Pas de logique spéciale, tout passe par les données.  
**Inconvénients :** Option A = changement de schéma. Option B = mélange sémantique.

---

#### Option 2 : Règle d'affichage ciblée (implémentée)

**Idée :** Garder le schéma actuel. Dans l'annuaire, la gestion des utilisateurs, etc., si l'utilisateur est l'admin concerné et que le lecteur n'est pas admin, afficher « Responsable église · Eglise de Croissy » au lieu de « Admin ».

**Avantages :** Aucun changement de base de données, rapide à mettre en place.  
**Inconvénients :** Logique spécifique à une personne (configurable dans `lib/admin-display-config.ts`).

**Configuration :** Voir `lib/admin-display-config.ts` :
```ts
export const ADMIN_DISPLAY_AS_RESPONSABLE = {
  email: "philippe.diarra@gmail.com",
  displayLabel: "Responsable église",
  displayChurchName: "Eglise de Croissy",
};
```

---

#### Option 3 : Champ « église d'affichage » pour l'admin

**Idée :** Ajouter un champ optionnel (ex. `display_church_id`) sur `user_roles`. Pour l'admin, on renseigne Croissy. L'affichage utilise ce champ.

**Avantages :** Pas de double rôle, logique générique.  
**Inconvénients :** Migration et évolution du schéma.

---

#### Option 4 : Double rôle (admin + responsable_eglise)

**Idée :** Permettre à un utilisateur d'avoir deux lignes dans `user_roles` :
- `role = 'admin'`, `church_id = null`
- `role = 'responsable_eglise'`, `church_id = Croissy`

**Avantages :** Modèle clair, extensible.  
**Inconvénients :** Changement de contraintes sur `user_roles`, adaptation des requêtes.

---

### Recommandation et choix effectué

- **Court terme, cas unique :** Option 2 (règle d'affichage ciblée) — la plus simple.
- **Plus propre et pérenne :** Option 4 (double rôle) si évolution du schéma acceptée.

**Choix retenu :** Option 2.

---

## 3. Implémentation de l'Option 2

### Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `lib/admin-display-config.ts` | Configuration (email, libellés) et fonction `isAdminDisplayAsResponsable()` |
| `app/admin/gestion-utilisateurs/page.tsx` | Affichage « Responsable église · Eglise de Croissy » pour les non-admins ; masquage des boutons d'action |
| `app/annuaire/page.tsx` | Affichage « Eglise de Croissy » comme église pour l'admin quand le lecteur n'est pas admin |
| `lib/supabase/queries.ts` | Ajout du champ `email` au type `DirectoryMember` |

### Comportement actuel

| Contexte | Admin voit | Autres (membres, responsables) voient |
|----------|------------|---------------------------------------|
| **Gestion utilisateurs** | Admin | Responsable église · Eglise de Croissy |
| **Annuaire** | (église vide) | Eglise de Croissy |

### Personnalisation

Pour changer l'email ou les libellés, modifier `lib/admin-display-config.ts` :

```ts
export const ADMIN_DISPLAY_AS_RESPONSABLE = {
  email: "votre.email@exemple.com",
  displayLabel: "Responsable église",
  displayChurchName: "Eglise de Croissy",
};
```

### Limitation

L'admin n'apparaît pas dans la section « Membres » de la page église de Croissy, car il a `church_id = null` en base. Pour l'y faire apparaître, il faudrait passer à l'Option 4 (double rôle).
