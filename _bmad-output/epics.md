---
stepsCompleted: ['step-01-validate', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['_bmad-output/prd.md', '_bmad-output/architecture.md']
date: 2026-02-14
author: Bob
---

# MHI-IDF - Epic Breakdown

## Overview

Décomposition des exigences du PRD en epics et stories implémentables, alignée avec l'architecture (Next.js + Supabase) et les principes d'implémentation (allégé, pragmatique, évolutif).

## Requirements Inventory

### Functional Requirements (PRD)

- FR1-FR4: Authentification et gestion des profils églises (siège)
- FR5-FR8: Profils et visibilité des églises
- FR9-FR12: Tableau de bord et calendrier
- FR13-FR16: Carte des besoins
- FR17-FR19: Annonces du siège
- FR20-FR22: Gouvernance et permissions

### Non-Functional Requirements

- NFR1-NFR5: Sécurité (RGPD, hébergement UE, HTTPS)
- NFR6-NFR7: Performance
- NFR8: Disponibilité
- NFR9-NFR11: Utilisabilité (mobile-first, 1-2 clics)
- NFR12-NFR15: Traçabilité et évolutivité

---

## Epic List

| Epic | Titre | FRs couverts |
|------|-------|--------------|
| 1 | Authentification et infrastructure | FR1-FR3, NFR2, NFR3 |
| 2 | Profils des églises | FR4-FR8 |
| 3 | Tableau de bord et calendrier | FR9-FR12 |
| 4 | Carte des besoins | FR13-FR16 |
| 5 | Annonces du siège | FR17-FR19 |
| 6 | Gouvernance et rôles | FR20-FR22, NFR13 |

---

## Epic 1: Authentification et infrastructure

**Objectif :** Un utilisateur peut se connecter avec email/mot de passe et accéder à l'application de façon sécurisée.

### Story 1.1: Configuration du projet

En tant que **développeur**,
je veux **initialiser le projet Next.js avec Supabase**,
afin que **la base technique soit prête pour le développement**.

**Acceptance Criteria:**

- **Given** un environnement de développement local
- **When** je clone le projet et exécute `npm install`
- **Then** le projet Next.js démarre sans erreur
- **And** la connexion Supabase est configurée (variables d'environnement)
- **And** la région Supabase est EU (eu-central-1 ou eu-west-1)

### Story 1.2: Connexion utilisateur

En tant que **contributeur**,
je veux **me connecter avec mon email et mot de passe**,
afin d'**accéder aux fonctionnalités de l'application**.

**Acceptance Criteria:**

- **Given** un utilisateur avec un compte créé
- **When** je saisis email et mot de passe corrects
- **Then** je suis redirigé vers le tableau de bord
- **And** ma session est maintenue (cookie/token)
- **Given** des identifiants incorrects
- **When** je tente de me connecter
- **Then** un message d'erreur clair s'affiche

### Story 1.3: Déconnexion

En tant que **contributeur**,
je veux **me déconnecter**,
afin de **sécuriser mon accès si j'utilise un appareil partagé**.

**Acceptance Criteria:**

- **Given** un utilisateur connecté
- **When** je clique sur « Déconnexion »
- **Then** ma session est terminée
- **And** je suis redirigé vers la page de connexion
- **And** je ne peux plus accéder aux pages protégées sans me reconnecter

---

## Epic 2: Profils des églises

**Objectif :** Chaque église dispose d'un profil avec programmes, contacts et spécialités. Le siège peut créer et gérer les profils.

### Story 2.1: Création des profils par le siège

En tant que **représentant du siège**,
je veux **créer un profil pour chaque église du réseau**,
afin que **les églises existent dans l'application**.

**Acceptance Criteria:**

- **Given** je suis connecté avec le rôle siège
- **When** je crée un profil d'église (nom, description, contacts, spécialités)
- **Then** l'église est enregistrée et visible dans la liste
- **And** je peux modifier ou désactiver un profil existant
- **Given** je ne suis pas le siège
- **When** j'accède à la page de création de profil
- **Then** je n'ai pas accès (ou redirection)

### Story 2.2: Consultation des profils

En tant que **contributeur**,
je veux **consulter le profil de n'importe quelle église du réseau**,
afin de **voir ses programmes, contacts et spécialités**.

**Acceptance Criteria:**

- **Given** je suis connecté
- **When** je clique sur une église
- **Then** je vois son profil (nom, description, contacts, spécialités)
- **And** je vois les programmes/événements de cette église (si présents)
- **And** la page est responsive (mobile-first)

### Story 2.3: Mise à jour du profil par le contributeur

En tant que **contributeur d'une église**,
je veux **mettre à jour le profil de mon église**,
afin que **les informations restent à jour**.

**Acceptance Criteria:**

- **Given** je suis contributeur de l'église X
- **When** je modifie le profil de mon église
- **Then** les modifications sont enregistrées
- **And** je ne peux pas modifier le profil d'une autre église
- **Given** je suis connecté
- **When** je consulte un profil
- **Then** les programmes (cultes, études bibliques, événements) s'affichent

---

## Epic 3: Tableau de bord et calendrier

**Objectif :** Un contributeur peut voir une vue d'ensemble du réseau, consulter le calendrier unifié et publier des événements.

### Story 3.1: Tableau de bord

En tant que **contributeur**,
je veux **accéder à un tableau de bord**,
afin de **voir une vue d'ensemble des programmes du réseau**.

**Acceptance Criteria:**

- **Given** je suis connecté
- **When** j'accède au tableau de bord
- **Then** je vois un résumé des programmes de toutes les églises
- **And** la page se charge en moins de 3 secondes (NFR6)
- **And** la navigation est simple (peu de menus)

### Story 3.2: Calendrier unifié

En tant que **contributeur**,
je veux **consulter un calendrier avec tous les événements du réseau**,
afin de **voir ce qui se passe et quand**.

**Acceptance Criteria:**

- **Given** je suis connecté
- **When** j'accède au calendrier
- **Then** je vois tous les événements du réseau
- **And** je peux filtrer par église (FR11)
- **And** les événements affichent date, lieu, type, église

### Story 3.3: Publication d'un événement

En tant que **contributeur**,
je veux **publier un événement pour mon église**,
afin que **il apparaisse dans le calendrier et le tableau de bord**.

**Acceptance Criteria:**

- **Given** je suis contributeur de mon église
- **When** je crée un événement (date, lieu, type, description)
- **Then** l'événement est enregistré et visible dans le calendrier
- **And** la confirmation est affichée en moins de 2 secondes (NFR7)
- **And** l'action est réalisable en 1-2 clics (NFR10)

---

## Epic 4: Carte des besoins

**Objectif :** Un contributeur peut créer des demandes (intervenant, salle, ressource) et proposer des ressources en réponse.

### Story 4.1: Création d'une demande

En tant que **contributeur**,
je veux **créer une demande** (intervenant, salle, ressource),
afin que **les autres églises puissent proposer une solution**.

**Acceptance Criteria:**

- **Given** je suis connecté
- **When** je crée une demande (type, catégorie, titre, description)
- **Then** la demande apparaît dans la carte des besoins
- **And** elle est associée à mon église
- **And** la création est simple (formulaire épuré)

### Story 4.2: Proposition de ressource

En tant que **contributeur**,
je veux **proposer une ressource** en réponse à une demande,
afin que **l'église qui en a besoin puisse me contacter**.

**Acceptance Criteria:**

- **Given** une demande existe dans la carte des besoins
- **When** je propose une ressource (intervenant, salle)
- **Then** ma proposition est liée à la demande
- **And** l'église demanderesse peut le voir
- **And** je peux indiquer ma disponibilité ou description

### Story 4.3: Consultation et filtrage

En tant que **contributeur**,
je veux **consulter et filtrer les demandes et propositions**,
afin de **trouver rapidement ce qui m'intéresse**.

**Acceptance Criteria:**

- **Given** je suis connecté
- **When** j'accède à la carte des besoins
- **Then** je vois toutes les demandes et propositions du réseau
- **And** je peux filtrer par type (intervenant, salle, ressource)
- **And** la liste est claire et lisible

---

## Epic 5: Annonces du siège

**Objectif :** Le siège peut publier des annonces officielles, visibles par tout le réseau.

### Story 5.1: Publication d'une annonce

En tant que **représentant du siège**,
je veux **publier une annonce officielle**,
afin que **tout le réseau soit informé**.

**Acceptance Criteria:**

- **Given** je suis connecté avec le rôle siège
- **When** je publie une annonce (titre, contenu)
- **Then** l'annonce est affichée à tous les contributeurs
- **And** elle apparaît en ordre chronologique (plus récentes en premier)
- **Given** je ne suis pas le siège
- **When** j'accède à la page de publication
- **Then** je n'ai pas accès

### Story 5.2: Consultation des annonces

En tant que **contributeur**,
je veux **consulter les annonces du siège**,
afin de **rester informé des communications officielles**.

**Acceptance Criteria:**

- **Given** je suis connecté
- **When** j'accède au fil des annonces
- **Then** je vois les annonces par ordre chronologique
- **And** je peux lire le détail de chaque annonce

---

## Epic 6: Gouvernance et rôles

**Objectif :** Le siège peut révoquer l'accès d'une église ou d'un utilisateur. Les droits sont correctement appliqués.

### Story 6.1: Gestion des rôles

En tant que **système**,
je veux **distinguer les utilisateurs siège des contributeurs d'église**,
afin que **les permissions soient correctement appliquées**.

**Acceptance Criteria:**

- **Given** un utilisateur avec le rôle siège
- **When** il accède à l'application
- **Then** il peut publier des annonces et gérer les profils
- **Given** un utilisateur avec le rôle contributeur
- **When** il accède à l'application
- **Then** il peut publier pour son église uniquement
- **And** il ne peut pas accéder aux fonctions siège

### Story 6.2: Révocation d'accès

En tant que **représentant du siège**,
je veux **révoquer l'accès d'une église ou d'un utilisateur**,
afin de **sécuriser le réseau en cas de besoin**.

**Acceptance Criteria:**

- **Given** je suis le siège
- **When** je révoque l'accès d'un utilisateur ou d'une église
- **Then** l'utilisateur ne peut plus se connecter (ou l'église est désactivée)
- **And** les modifications sont tracées (NFR12)

---

## Traceability

| Epic | FRs | NFRs |
|------|-----|------|
| 1 | FR1, FR2, FR3 | NFR2, NFR3 |
| 2 | FR4, FR5, FR6, FR7, FR8 | NFR9 |
| 3 | FR9, FR10, FR11, FR12 | NFR6, NFR7, NFR10, NFR11 |
| 4 | FR13, FR14, FR15, FR16 | NFR10 |
| 5 | FR17, FR18, FR19 | — |
| 6 | FR20, FR21, FR22 | NFR12, NFR13 |
