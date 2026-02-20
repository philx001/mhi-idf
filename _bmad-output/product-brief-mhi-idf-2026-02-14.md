---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-02-14.md']
date: 2026-02-14
author: Bob
---

# Product Brief: MHI-IDF

<!-- Content will be appended sequentially through collaborative workflow steps -->

---

## Executive Summary

**MHI-IDF** est une application collaborative destinée au réseau d'églises d'Île-de-France d'une grande église internationale. Elle permet aux représentations (filiales) parisiennes de partager leurs programmes, coordonner des activités communes, planifier des événements ensemble et échanger des idées — le tout dans une interface simple, interactive et non commerciale.

L'application vise un lancement en 3 mois avec un MVP centré sur la visibilité (tableau de bord, calendrier, profils), la carte des besoins (intervenants, salles, ressources), les annonces du siège et une authentification sécurisée. Une Phase 2 enrichira l'expérience avec l'accès sans compte, la messagerie de groupe, les réunions de planification, la modération et les rôles différenciés.

---

## Core Vision

### Problem Statement

Les églises d'Île-de-France d'un même réseau ecclésial peinent à :
- **Partager** leurs programmes et événements de façon centralisée et à jour
- **Coordonner** des activités communes (cultes, formations, retraites) entre plusieurs églises
- **Planifier** ensemble sans multiplier les échanges informels (emails, téléphone)
- **Échanger** des idées, bonnes pratiques et retours d'expérience de manière structurée
- **Trouver** des intervenants, salles ou ressources disponibles dans le réseau

Aujourd'hui, ces échanges reposent sur des canaux dispersés (emails, groupes, réunions physiques), ce qui limite la réactivité, la visibilité et la collaboration entre les représentations.

### Problem Impact

- **Perte de temps** : les responsables passent du temps à chercher des informations ou à coordonner manuellement
- **Opportunités manquées** : des collaborations possibles ne se concrétisent pas par manque de visibilité
- **Incohérence** : les programmes et actualités ne sont pas centralisés, difficile d'avoir une vue d'ensemble
- **Friction** : les bénévoles et membres ont du mal à trouver ce qui se passe dans le réseau sans multiplier les contacts

### Why Existing Solutions Fall Short

- **Outils génériques** (Google Calendar, WhatsApp, etc.) : pas adaptés à la structure église/siège/filiales, pas de gouvernance ni de rôles dédiés
- **Réseaux sociaux** : mélange public/privé, pas de confidentialité adaptée pour un réseau interne
- **Solutions commerciales** : souvent trop complexes ou orientées vente, alors que l'application n'est pas destinée à la commercialisation

### Proposed Solution

Une application web/mobile simple, collaborative et non commerciale qui :

**MVP (3 mois) :**
1. **Tableau de bord + calendrier** — Vue centralisée des programmes de toutes les églises (cultes, études bibliques, événements)
2. **Profils par église** — Page par église avec programmes, contacts, spécialités
3. **Carte des besoins** — Demander ou proposer intervenants, salles, ressources
4. **Annonces du siège** — Communication officielle vers tout le réseau
5. **Authentification sécurisée** — Connexion pour les contributeurs, données hébergées en France/UE (RGPD)

**Phase 2 :**
- Accès sans compte pour la lecture (consultation publique des programmes)
- Messagerie de groupe par projet ou thème
- Réunions de planification (ordre du jour, participants, compte-rendu)
- Modération par le siège
- Rôles et permissions (responsables vs membres)

### Key Differentiators

- **Conçu pour le réseau ecclésial** : structure siège/filiales, gouvernance, modération intégrée
- **Non commercial** : aucune donnée vendue, pas de publicité, usage interne uniquement
- **Simplicité** : interface épurée, mobile-first, usage sans formation
- **Confidentialité** : données visibles uniquement par le réseau, hébergement UE, politique claire
- **Évolutif** : architecture modulaire pour une future extension nationale ou internationale

---

## Target Users

### Primary Users

**1. Pasteur / Responsable d'église**
- **Contexte :** Responsable d'une église du réseau en Île-de-France, doit coordonner avec les autres et proposer des collaborations
- **Besoins :** Voir les programmes des autres églises, publier ses événements facilement, trouver des intervenants/ressources, avoir une vue d'ensemble du réseau, communiquer avec les autres responsables, savoir qui est disponible pour des événements communs
- **Succès :** « Je peux proposer une collaboration en 2 clics et voir immédiatement qui est dispo »

**2. Responsable communication / Secrétaire d'église**
- **Contexte :** Gère les programmes, annonces et coordination au quotidien pour son église
- **Besoins :** Saisir et mettre à jour les programmes, répondre aux demandes (intervenants, salles), partager les actualités, préparer les réunions, consulter la bibliothèque de bonnes pratiques, gérer les sondages, suivre les délégations de tâches
- **Succès :** « Toutes les infos de mon église sont à jour et je peux coordonner un événement commun sans perdre de temps »

### Secondary Users

**3. Représentant du siège (maison mère)**
- **Contexte :** Gère le réseau, assure la cohérence et la qualité des informations
- **Besoins :** Diffuser les annonces officielles, modérer les publications, gérer les profils des églises, déléguer des droits, suivre les projets communs et la feuille de route
- **Succès :** « Le réseau est aligné, les informations sont cohérentes et je peux intervenir si nécessaire »

**4. Bénévole ou membre actif**
- **Contexte :** Participe aux événements, consulte les programmes, peut proposer des idées
- **Besoins :** Consulter sans compte, voir ce qui se passe dans son église et le réseau, s'inscrire ou répondre en 1-2 clics, accès mobile, usage sans formation, proposer des idées
- **Succès :** « Je trouve facilement ce qui se passe et je peux m'inscrire en un clic »

### User Journey

| Étape | Pasteur | Responsable com | Bénévole |
|-------|---------|-----------------|----------|
| **Découverte** | Présentation par le siège ou un pair | Formation interne à l'église | Lien partagé, bouche-à-oreille |
| **Onboarding** | Connexion, tutoriel rapide, création du profil église | Idem + droits de saisie | Consultation sans compte ou inscription simple |
| **Usage quotidien** | Consultation tableau de bord, publication événements, carte des besoins | Saisie programmes, réponses aux demandes, sondages | Consultation calendrier, inscription événements |
| **Moment « aha »** | Première collaboration concrète avec une autre église | Premier événement commun planifié via l'app | Découverte d'un événement commun auquel participer |

---

## Success Metrics

### User Success Metrics

- **Adoption :** X% des églises du réseau ont au moins un contributeur actif dans les 3 mois post-lancement
- **Engagement :** Les contributeurs mettent à jour leurs programmes au moins 1x/semaine
- **Collaboration :** Au moins 1 événement co-organisé ou demande via la carte des besoins par mois
- **Simplicité :** Les bénévoles consultent les programmes sans aide (accès sans compte utilisé)

### Business Objectives

- **Cohérence du réseau :** Une source unique d'information à jour pour toutes les églises IDF
- **Réduction de la friction :** Moins d'emails et d'appels pour coordonner
- **Renforcement du lien :** Plus de collaborations et d'échanges entre églises

### Key Performance Indicators

| KPI | Cible (3 mois) | Mesure |
|-----|-----------------|--------|
| Églises actives | 80%+ | Au moins 1 publication/mois |
| Événements publiés | 100+ | Total dans le calendrier |
| Demandes carte des besoins | 10+ | Demandes ou propositions |
| Consultations sans compte | Croissance | Trafic pages publiques |

---

## MVP Scope

### Core Features (lancement 3 mois)

1. **Tableau de bord + calendrier** — Vue centralisée des programmes de toutes les églises, filtrable par église
2. **Profils par église** — Page par église avec programmes, contacts, spécialités
3. **Carte des besoins** — Demander ou proposer intervenants, salles, ressources
4. **Annonces du siège** — Communication officielle vers tout le réseau
5. **Authentification sécurisée** — Connexion pour contributeurs, hébergement France/UE (RGPD)

### Out of Scope for MVP

- Accès sans compte pour la lecture (Phase 2)
- Messagerie de groupe (Phase 2)
- Réunions de planification (Phase 2)
- Modération par le siège (Phase 2)
- Rôles et permissions avancés (Phase 2)
- Boîte à idées, brainstorming en ligne, Q/R
- Événements co-organisés, projets partagés, budget partagé
- Extension nationale/internationale

### MVP Success Criteria

- Au moins 80% des églises IDF ont un profil créé et publié
- Le calendrier contient les programmes des principales églises
- Au moins 5 demandes/propositions via la carte des besoins
- Les annonces du siège sont lues et comprises
- Aucun incident de sécurité ou de confidentialité

### Future Vision (Phase 2 et au-delà)

**Phase 2 :** Accès sans compte, messagerie, réunions, modération, rôles — pour renforcer la collaboration et l'engagement.

**Long terme :** Événements co-organisés, projets partagés, groupes thématiques, bibliothèque de bonnes pratiques, extension nationale puis internationale sous conditions.
