---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: ['_bmad-output/product-brief-mhi-idf-2026-02-14.md', '_bmad-output/brainstorming/brainstorming-session-2026-02-14.md']
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 1
  projectDocsCount: 0
classification:
  projectType: web-application
  domain: community-collaboration
  complexity: medium
  projectContext: greenfield
workflowType: prd
date: 2026-02-14
author: Bob
---

# Product Requirements Document - MHI-IDF

**Author:** Bob
**Date:** 2026-02-14

---

## Executive Summary

**MHI-IDF** est une application web/mobile collaborative destinée au réseau d'églises d'Île-de-France d'une grande église internationale. Elle permet aux représentations (filiales) parisiennes de partager leurs programmes, coordonner des activités communes et échanger des informations — dans une interface simple, interactive et non commerciale.

**Problème central :** Les églises peinent à partager leurs programmes de façon centralisée, à coordonner des activités communes et à trouver des intervenants ou ressources dans le réseau. Les canaux actuels (emails, groupes) sont dispersés et limitent la collaboration.

**Solution MVP (3 mois) :** Tableau de bord + calendrier, profils par église, carte des besoins, annonces du siège, authentification sécurisée.

---

## Principes d'implémentation

> **Contexte :** Application non commerciale, usage interne, temps limité.

- **Allégé :** Fonctionnalités implémentées de façon simple et épurée — pas d'approfondissement excessif ni de complexité technique superflue.
- **Pragmatique :** Priorité au « suffisant pour l'usage » plutôt qu'au « parfait » ou « professionnel ».
- **Évolutif :** Architecture et code conçus pour permettre des ajustements techniques ultérieurs facilement — modularité, clarté, évitement du couplage fort.
- **Maintenable :** Structure lisible et documentée pour faciliter les modifications futures sans tout refaire.

---

## Project Classification

- **Project Type:** Web Application (mobile-first)
- **Domain:** Community / Collaboration (réseau ecclésial)
- **Complexity:** Medium (multi-acteurs, gouvernance siège/filiales, confidentialité)
- **Context:** Greenfield (nouveau produit)

---

## Success Criteria

### User Success

- 80%+ des églises ont au moins un contributeur actif dans les 3 mois
- Les contributeurs mettent à jour leurs programmes au moins 1x/semaine
- Au moins 1 demande/proposition via la carte des besoins par mois
- Les responsables peuvent proposer une collaboration en 2 clics

### Business Success

- Source unique d'information à jour pour toutes les églises IDF
- Réduction des emails et appels pour coordonner
- Renforcement des collaborations entre églises

### Technical Success

- Aucun incident de sécurité ou de confidentialité
- Données hébergées en France/UE (RGPD)

---

## User Journeys

### Journey 1 : Pasteur consulte et publie

1. Connexion avec identifiants
2. Accès au tableau de bord (vue d'ensemble du réseau)
3. Consultation du calendrier (filtrable par église)
4. Publication d'un événement pour son église
5. Consultation de la carte des besoins (demandes/propositions)
6. Création d'une demande (intervenant, salle, ressource)

### Journey 2 : Responsable com met à jour les programmes

1. Connexion
2. Accès au profil de son église
3. Saisie/mise à jour des programmes et événements
4. Réponse à une demande de la carte des besoins
5. Consultation des annonces du siège

### Journey 3 : Représentant du siège communique

1. Connexion (droits siège)
2. Publication d'une annonce officielle
3. Gestion des profils des églises (création, modification)
4. Consultation des statistiques (optionnel Phase 2)

### Journey 4 : Bénévole consulte (Phase 2 - accès sans compte)

1. Accès au lien public (sans compte)
2. Consultation du calendrier et des programmes
3. Inscription à un événement en 1-2 clics (si compte créé)

---

## Domain Requirements

- **Confidentialité :** Données visibles uniquement par le réseau autorisé
- **Gouvernance :** Structure siège/filiales avec rôles différenciés
- **RGPD :** Hébergement France/UE, politique de confidentialité claire
- **Non-commercial :** Aucune revente de données, pas de publicité

---

## Project Scoping & Phased Development

### MVP Strategy (Phase 1 - 3 mois)

**Approche :** Problem-solving MVP — résoudre le problème central (visibilité et coordination) avec le minimum viable.

**Must-Have Capabilities :**
- Tableau de bord + calendrier unifié
- Profils par église
- Carte des besoins (demandes/propositions)
- Annonces du siège
- Authentification sécurisée

### Phase 2 (Post-MVP)

- Accès sans compte pour la lecture
- Messagerie de groupe
- Réunions de planification
- Modération par le siège
- Rôles et permissions avancés

### Phase 3 (Expansion)

- Événements co-organisés, projets partagés
- Extension nationale/internationale

---

## Functional Requirements

### Gestion des utilisateurs et authentification

- FR1: Un contributeur peut se connecter avec identifiants (email/mot de passe)
- FR2: Un contributeur peut se déconnecter
- FR3: Le système authentifie les utilisateurs avant d'accéder aux fonctionnalités protégées
- FR4: Le siège peut créer et gérer les profils des églises (création, modification, désactivation)

### Profils et visibilité des églises

- FR5: Chaque église dispose d'un profil avec programmes, contacts et spécialités
- FR6: Un contributeur peut consulter le profil de n'importe quelle église du réseau
- FR7: Un contributeur d'une église peut créer et mettre à jour le profil de son église
- FR8: Un profil d'église affiche les programmes (cultes, études bibliques, événements)

### Tableau de bord et calendrier

- FR9: Un contributeur peut accéder à un tableau de bord regroupant les programmes de toutes les églises
- FR10: Un contributeur peut consulter un calendrier unifié avec tous les événements du réseau
- FR11: Un contributeur peut filtrer le calendrier par église
- FR12: Un contributeur peut publier un événement pour son église (date, lieu, type, description)

### Carte des besoins

- FR13: Un contributeur peut créer une demande (intervenant, salle, ressource) avec description
- FR14: Un contributeur peut proposer une ressource (intervenant, salle) en réponse à une demande
- FR15: Un contributeur peut consulter les demandes et propositions du réseau
- FR16: Un contributeur peut filtrer la carte des besoins par type (intervenant, salle, ressource)

### Annonces du siège

- FR17: Un représentant du siège peut publier une annonce officielle vers tout le réseau
- FR18: Un contributeur peut consulter les annonces du siège
- FR19: Les annonces sont visibles par ordre chronologique (plus récentes en premier)

### Gouvernance et permissions (MVP simplifié)

- FR20: Le siège dispose de droits étendus (annonces, gestion des profils)
- FR21: Les contributeurs d'église disposent de droits de publication pour leur église
- FR22: Seuls les utilisateurs authentifiés du réseau peuvent accéder aux données

---

## Non-Functional Requirements

### Sécurité

- NFR1: Les données sont hébergées en France ou dans l'Union européenne (conformité RGPD)
- NFR2: Les mots de passe sont stockés de manière sécurisée (hashage)
- NFR3: Les communications sont chiffrées (HTTPS)
- NFR4: Aucune donnée n'est vendue ou partagée à des tiers
- NFR5: Une politique de confidentialité claire est disponible

### Performance

- NFR6: Le tableau de bord et le calendrier se chargent en moins de 3 secondes
- NFR7: La publication d'un événement est confirmée en moins de 2 secondes

### Disponibilité

- NFR8: L'application est disponible 99% du temps (hors maintenance planifiée)

### Utilisabilité

- NFR9: L'interface est conçue mobile-first (responsive)
- NFR10: Les actions principales (publier, répondre) sont réalisables en 1-2 clics
- NFR11: La navigation est simple avec un nombre limité de menus

### Traçabilité

- NFR12: Les modifications importantes sont tracées (qui a modifié quoi et quand)
- NFR13: Le siège peut révoquer l'accès d'une église ou d'un utilisateur

### Évolutivité et maintenabilité

- NFR14: L'architecture permet d'ajuster ou d'enrichir les fonctionnalités sans refonte majeure
- NFR15: Le code est structuré de façon modulaire pour faciliter les modifications ultérieures

---

## Out of Scope for MVP

- Accès sans compte pour la lecture
- Messagerie de groupe
- Réunions de planification
- Modération des publications
- Rôles et permissions granulaires
- Boîte à idées, brainstorming en ligne
- Événements co-organisés, projets partagés, budget partagé
- Extension nationale/internationale

---

## Traceability

| Source | PRD Section |
|--------|-------------|
| Product Brief - Executive Summary | Executive Summary |
| Product Brief - Target Users | User Journeys |
| Product Brief - Success Metrics | Success Criteria |
| Product Brief - MVP Scope | Functional Requirements, Scoping |
| Brainstorming - Thèmes | Domain Requirements, NFRs |
