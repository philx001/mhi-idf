# Rôles et droits – MHI Île-de-France

Document de référence des **3 rôles** de l’application et de leurs droits, ainsi que des **2 types de calendrier** (privé et partagé).

---

## 1. Les 3 rôles

| Rôle | Description |
|------|-------------|
| **Admin** | Administrateur de l'application (droits les plus élevés). Peut inviter, gérer les rôles, voir toutes les églises et les modifier. |
| **Responsable église** | Responsable d’une église locale. Gère les membres et le profil de son église. Cas particulier : **responsable de Croissy** (église dont le nom contient « Croissy ») a des droits étendus au niveau réseau pour la gestion des utilisateurs et le calendrier partagé. |
| **Membre** | Membre d’une église. Peut modifier le profil de son église, créer des événements pour son église, consulter le calendrier et la carte des besoins. |

Un utilisateur **sans rôle** (compte existant mais aucune entrée dans `user_roles`) a un accès très limité jusqu’à attribution d’un rôle.

---

## 2. Tableau récapitulatif des droits par rôle

| Fonctionnalité | Admin | Responsable église (hors Croissy) | Responsable église (Croissy) | Membre |
|----------------|-------------------|------------------------------------|-------------------------------|--------------|
| **Gestion des utilisateurs** (page dédiée) | ❌ Pas d’accès (lien masqué) | ✅ Accès ; voit et gère **uniquement les membres de son église** | ✅ Accès ; voit et gère **tous les membres** de toutes les églises | ❌ Pas d’accès |
| Invitation par email (création de compte) | ✅ Peut inviter | ✅ Peut inviter (son église) | ✅ Peut inviter | ❌ Non |
| Attribuer / modifier rôle, retirer d’église, révoquer / restaurer accès | ✅ Tous les utilisateurs | ✅ Uniquement membres de son église | ✅ Tous (sauf modifier un administrateur) | ❌ Non |
| **Profils des églises** – Voir | ✅ Toutes les églises | ✅ Toutes (lecture) | ✅ Toutes (lecture) | ✅ Toutes (lecture) |
| **Profils des églises** – Modifier | ✅ N’importe quelle église | ✅ Uniquement **son** église | ✅ Uniquement **son** église | ✅ Uniquement **son** église |
| **Calendrier privé** (programme de son église) – Voir | ✅ Tous les calendriers d’église | ✅ Uniquement **son** église | ✅ Uniquement **son** église (ne voit pas les programmes privés des autres) | ✅ Uniquement **son** église |
| **Calendrier privé** – Modifier | ✅ Tous | ✅ Son église | ✅ Son église | ❌ (création/modif via « Nouvel événement » selon RLS) |
| **Calendrier partagé** – Voir | ✅ Lecture | ✅ Lecture | ✅ Lecture | ✅ Lecture |
| **Calendrier partagé** – Modifier | ✅ Oui | ❌ Lecture seule | ✅ Oui (peut modifier le contenu partagé) | ❌ Lecture seule |
| **Planning partagé** (sessions de prière) – Voir | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui |
| **Planning partagé** – Créer des sessions | ✅ Oui (admin uniquement en BDD) | ❌ Non | ❌ Non | ❌ Non |
| **Planning partagé** – Inscrire des personnes | ✅ Tous les membres du réseau | ✅ Uniquement membres de **son** église | ✅ **Tous** les membres du réseau | ❌ Non |
| **Événements** – Créer / modifier | ✅ Toutes les églises | ✅ Son église | ✅ Son église | ❌ Non |
| **Carte des besoins** – Créer / modifier demandes ou propositions | ✅ Toutes les églises | ✅ Son église | ✅ Son église | ✅ Son église (demandes) ; propositions selon RLS |
| **Notifications** – Créer | ✅ Réseau | ✅ Son église | ✅ Son église | Selon configuration |
| **Tableau de bord** | ✅ | ✅ | ✅ | ✅ |
| **Mon profil** | ✅ | ✅ | ✅ | ✅ |

---

## 3. Les 2 types de calendrier

Il existe **deux types de calendrier** distincts :

### 3.1 Calendrier privé (programme privé de l’église)

- **Vue** : « Mon calendrier d’église » → page `/churches/[id]/calendrier` (pour l’église de l’utilisateur).
- **Contenu** : événements **privés** et **partagés** de **cette église uniquement**.
- **Qui y a accès** :
  - Les **membres de cette église** (responsable + membres) voient et, selon les droits, modifient le programme de leur église.
  - L'**administrateur** peut voir (et modifier) le calendrier de n’importe quelle église.
- **Important** : Chaque église ne voit **que son propre** programme privé. Le **responsable de Croissy** ne voit **pas** les programmes privés des autres églises (il a uniquement la vue partagée et son propre calendrier d’église).

### 3.2 Calendrier partagé

- **Vue** : Calendrier commun → page `/calendar`.
- **Contenu** : uniquement les événements **partagés** (`visibility = shared`) de **toutes** les églises.
- **Qui peut voir** : toutes les églises (tous les rôles connectés) en **lecture seule**.
- **Qui peut modifier** (ajouter / modifier / supprimer des événements partagés affichés sur cette vue) :
  - **Administrateur** : oui.
  - **Responsable de Croissy** : oui (il peut modifier le contenu du calendrier partagé).
  - **Autres responsables d’église** : en lecture seule sur cette vue partagée.
  - **Membres** : lecture seule.

En résumé : le **calendrier partagé** est visible par toutes les églises en **lecture seule**, sauf pour le **rôle Croissy** (et le siège) qui peut **modifier**. Le responsable Croissy **n’a pas** accès à la vue des programmes **privés** des autres églises.

---

## 4. Lien avec le code

- **Rôles** : type `AppRole` dans `app/admin/actions.ts` (`admin` \| `responsable_eglise` \| `membre`).
- **Détection Croissy** : nom d’église contenant « croissy » (insensible à la casse), utilisée dans `getCurrentRoleChurchAndCroissy()` et sur la page Gestion des utilisateurs.
- **Calendrier privé** : `getEventsForChurchCalendar(churchId, ...)` ; accès à `/churches/[id]/calendrier` contrôlé par `canAccess` (siège ou membre de l’église).
- **Calendrier partagé** : `getSharedEventsForSynthetic(...)` ; page `/calendar` avec `canEditMap` selon rôle et `church_id` de l’événement.

---

*Dernière mise à jour : mars 2026.*
