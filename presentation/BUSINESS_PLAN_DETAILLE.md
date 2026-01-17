# Plan d'Action Détaillé - Création Entreprise NutriProfile

## Document Stratégique avec Workflows, Responsabilités et Deadlines

**Date de création**: 15 Janvier 2026
**Durée du plan**: 6 mois (Janvier - Juin 2026)
**Structure cible**: UG (haftungsbeschränkt) en Allemagne

---

## 📋 TABLE DES MATIÈRES

1. [Équipe et Rôles Détaillés](#1-équipe-et-rôles-détaillés)
2. [Calendrier Global - Vue 6 Mois](#2-calendrier-global---vue-6-mois)
3. [Phase 1: Préparation (Semaines 1-4)](#3-phase-1-préparation-semaines-1-4)
4. [Phase 2: Création Juridique (Semaines 5-8)](#4-phase-2-création-juridique-semaines-5-8)
5. [Phase 3: Lancement Opérationnel (Semaines 9-12)](#5-phase-3-lancement-opérationnel-semaines-9-12)
6. [Phase 4: Croissance (Mois 4-6)](#6-phase-4-croissance-mois-4-6)
7. [Workflows Détaillés par Processus](#7-workflows-détaillés-par-processus)
8. [Outils et Stack Recommandés](#8-outils-et-stack-recommandés)
9. [Budget Détaillé par Phase](#9-budget-détaillé-par-phase)
10. [KPIs et Métriques de Suivi](#10-kpis-et-métriques-de-suivi)
11. [Gestion des Risques](#11-gestion-des-risques)
12. [Annexes](#12-annexes)

---

## 1. ÉQUIPE ET RÔLES DÉTAILLÉS

### 1.1 Organigramme Complet

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           NUTRIPROFILE UG (haftungsbeschränkt)                       │
│                              Capital: 2.000€ | Siège: Allemagne                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                              ┌─────────────────────┐                                │
│                              │   CONSEIL DES       │                                │
│                              │   ASSOCIÉS (4)      │                                │
│                              │   Décisions >5.000€ │                                │
│                              └──────────┬──────────┘                                │
│                                         │                                            │
│              ┌──────────────────────────┼──────────────────────────┐                │
│              │                          │                          │                │
│              ▼                          ▼                          ▼                │
│  ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐       │
│  │      TECHNIQUE      │   │     OPÉRATIONS      │   │     MARKETING       │       │
│  │    Badre Zouiri     │   │   Mehdi Mokhliss    │   │       Salma         │       │
│  │        CTO          │   │    COO / Gérant     │   │        CMO          │       │
│  │      (25%)          │   │      (25%)          │   │      (25%)          │       │
│  └─────────────────────┘   └─────────────────────┘   └─────────────────────┘       │
│              │                          │                          │                │
│              │                          │                          │                │
│              │                          │                          ▼                │
│              │                          │              ┌─────────────────────┐       │
│              │                          │              │  SUPPORT MARKETING  │       │
│              │                          │              │  Laila Mokhliss     │       │
│              │                          │              │    (25%)            │       │
│              │                          │              └─────────────────────┘       │
│              │                          │                                            │
│              └──────────────────────────┴────────────────────────────────────────   │
│                                         │                                            │
│                              ┌──────────▼──────────┐                                │
│                              │    RÉUNION WEEKLY   │                                │
│                              │   Tous les lundis   │                                │
│                              │      18h00 CET      │                                │
│                              └─────────────────────┘                                │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Fiches de Poste Détaillées

---

#### 👨‍💻 BADRE ZOUIRI - CTO (Chief Technology Officer)

| Catégorie | Détails |
|-----------|---------|
| **Parts** | 25% (500€ capital) |
| **Localisation** | Maroc 🇲🇦 |
| **Temps consacré** | 100% (Full-time) |
| **Reporting** | Conseil des Associés |

**Responsabilités Principales:**

```
DÉVELOPPEMENT PRODUIT (60% du temps)
├── Architecture technique et choix technologiques
├── Développement backend (FastAPI, Python)
├── Développement frontend (React, TypeScript)
├── Intégration des agents IA (Hugging Face)
├── Tests et qualité du code (>80% coverage)
├── Documentation technique
└── Code reviews et standards

INFRASTRUCTURE & DEVOPS (25% du temps)
├── Déploiement Fly.io (backend + frontend)
├── Gestion base de données PostgreSQL
├── Monitoring et alerting
├── Sécurité et RGPD technique
├── Performance et optimisation
└── Backups et disaster recovery

SUPPORT TECHNIQUE (15% du temps)
├── Debug et résolution de bugs critiques
├── Support niveau 2/3 aux utilisateurs
├── Documentation utilisateur technique
└── Formation équipe sur les outils
```

**Livrables Mensuels:**
- [ ] Rapport technique mensuel (bugs, performance, roadmap)
- [ ] Release notes pour chaque déploiement
- [ ] Mise à jour documentation technique
- [ ] KPIs techniques (uptime, temps réponse, erreurs)

**Outils Principaux:**
- VSCode, GitHub, Fly.io, Sentry, PostHog

---

#### 👔 MEHDI MOKHLISS - COO (Chief Operating Officer) & Gérant

| Catégorie | Détails |
|-----------|---------|
| **Parts** | 25% (500€ capital) |
| **Localisation** | Allemagne 🇩🇪 |
| **Temps consacré** | 50-70% (selon phase) |
| **Statut légal** | Geschäftsführer (Gérant) |
| **Reporting** | Conseil des Associés |

**Responsabilités Principales:**

```
ADMINISTRATION & JURIDIQUE (40% du temps)
├── Représentation légale de la société
├── Relations avec le Steuerberater (comptable)
├── Déclarations fiscales et TVA
├── Conformité légale allemande
├── Gestion du registre du commerce
├── Contrats et accords juridiques
└── Assurances et responsabilités

FINANCE & COMPTABILITÉ (30% du temps)
├── Suivi trésorerie et cash flow
├── Validation des dépenses >500€
├── Relations bancaires (Qonto)
├── Facturation et recouvrement
├── Budget et prévisions
├── Reporting financier mensuel
└── Préparation bilans annuels

OPÉRATIONS & PARTENARIATS (30% du temps)
├── Relations clients B2B
├── Négociations partenariats stratégiques
├── Expansion marché DACH (DE/AT/CH)
├── Support aux décisions stratégiques
├── Coordination inter-équipes
└── Process et workflows internes
```

**Livrables Mensuels:**
- [ ] Rapport financier mensuel (P&L, trésorerie)
- [ ] État des déclarations fiscales
- [ ] Mise à jour tableau de bord KPIs business
- [ ] Compte-rendu réunions partenaires/clients

**Outils Principaux:**
- Qonto, DATEV (via Steuerberater), Notion, Google Workspace

---

#### 📣 SALMA - CMO (Chief Marketing Officer)

| Catégorie | Détails |
|-----------|---------|
| **Parts** | 25% (500€ capital) |
| **Localisation** | Allemagne 🇩🇪 |
| **Temps consacré** | 80-100% |
| **Reporting** | Conseil des Associés |

**Responsabilités Principales:**

```
STRATÉGIE MARKETING (30% du temps)
├── Définition de la stratégie d'acquisition
├── Positionnement et messaging
├── Analyse concurrentielle
├── Définition des personas/ICP
├── Budget marketing et ROI
└── Roadmap marketing trimestrielle

ACQUISITION PAYANTE (25% du temps)
├── Campagnes Meta Ads (Facebook/Instagram)
├── Campagnes Google Ads
├── Campagnes TikTok Ads
├── A/B testing créatifs
├── Optimisation CPA/CAC
└── Reporting performance ads

CONTENT & SEO (25% du temps)
├── Stratégie de contenu
├── Rédaction articles blog (SEO)
├── Optimisation on-page/off-page
├── Keyword research
├── Link building
└── Calendrier éditorial

SOCIAL MEDIA & COMMUNITY (20% du temps)
├── Gestion Instagram/TikTok/LinkedIn
├── Création contenu vidéo/reels
├── Community management
├── Influencer marketing
├── UGC (User Generated Content)
└── Engagement et interactions
```

**Livrables Mensuels:**
- [ ] Rapport marketing mensuel (CAC, conversions, ROI)
- [ ] 8 articles SEO minimum
- [ ] 20 posts social media minimum
- [ ] Analyse performance campagnes
- [ ] Recommandations optimisation

**Outils Principaux:**
- Meta Business Suite, Google Ads, Semrush/Ahrefs, Canva, CapCut, Buffer

---

#### 🎨 LAILA MOKHLISS - Support Marketing & Contenu

| Catégorie | Détails |
|-----------|---------|
| **Parts** | 25% (500€ capital) |
| **Localisation** | Maroc 🇲🇦 |
| **Temps consacré** | 30-50% |
| **Reporting** | Salma (CMO) |

**Responsabilités Principales:**

```
CONTENU FRANCOPHONE (50% du temps)
├── Rédaction articles FR
├── Traductions EN→FR
├── Adaptation contenu pour marché francophone
├── Newsletters en français
└── Support client francophone

COMMUNITY MANAGEMENT (30% du temps)
├── Modération commentaires FR
├── Réponses DM/messages FR
├── Animation communauté francophone
├── Veille concurrentielle FR
└── Feedback utilisateurs

SUPPORT OPÉRATIONNEL (20% du temps)
├── Backup pour Salma
├── Création visuels simples (Canva)
├── Mise à jour site/landing pages
├── Coordination avec Badre (technique)
└── Tâches administratives ponctuelles
```

**Livrables Mensuels:**
- [ ] 4 articles FR minimum
- [ ] 10 posts social media FR
- [ ] Rapport community management
- [ ] Traductions demandées

**Outils Principaux:**
- Canva, Buffer, Notion, Google Docs

---

### 1.3 Matrice des Responsabilités (RACI)

| Domaine | Badre | Mehdi | Salma | Laila |
|---------|-------|-------|-------|-------|
| **Développement produit** | **R** | I | C | I |
| **Infrastructure/DevOps** | **R** | I | I | I |
| **Comptabilité/Finance** | I | **R** | C | I |
| **Juridique/Admin** | C | **R** | I | I |
| **Stratégie marketing** | C | C | **R** | C |
| **Campagnes publicitaires** | I | A | **R** | C |
| **Contenu FR** | I | I | A | **R** |
| **Contenu DE/EN** | I | C | **R** | I |
| **Support client** | C | C | C | **R** |
| **Décisions >5.000€** | **R** | **R** | **R** | **R** |

**Légende:** R = Responsable | A = Approbateur | C = Consulté | I = Informé

---

## 2. CALENDRIER GLOBAL - VUE 6 MOIS

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        TIMELINE NUTRIPROFILE - JANVIER À JUIN 2026                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  JANVIER 2026                                                                        │
│  ════════════                                                                        │
│  S3 (13-19)  │████████│ Kickoff + Recherche Steuerberater                          │
│  S4 (20-26)  │████████│ Rédaction pacte associés + choix banque                    │
│  S5 (27-02)  │████████│ Finalisation documents + RDV notaire                       │
│                                                                                      │
│  FÉVRIER 2026                                                                        │
│  ═════════════                                                                       │
│  S6 (03-09)  │████████│ Signature notaire + Dépôt capital Qonto                    │
│  S7 (10-16)  │████████│ Attente Handelsregister + Prépa marketing                  │
│  S8 (17-23)  │████████│ Handelsregister OK + Config Stripe                         │
│  S9 (24-02)  │████████│ Tests paiements + Landing page DE                          │
│                                                                                      │
│  MARS 2026                                                                           │
│  ══════════                                                                          │
│  S10 (03-09) │████████│ Migration Lemon Squeezy → Stripe                           │
│  S11 (10-16) │████████│ Lancement campagnes Meta Ads                               │
│  S12 (17-23) │████████│ Optimisation + premiers clients DE                         │
│  S13 (24-30) │████████│ Review Q1 + Planning Q2                                    │
│                                                                                      │
│  AVRIL 2026                                                                          │
│  ═══════════                                                                         │
│  S14-S17     │████████████████│ Scale marketing + Content SEO                      │
│                                                                                      │
│  MAI 2026                                                                            │
│  ═════════                                                                           │
│  S18-S21     │████████████████│ Expansion DACH + Partenariats                      │
│                                                                                      │
│  JUIN 2026                                                                           │
│  ══════════                                                                          │
│  S22-S26     │████████████████│ Objectif 500€ MRR + Review semestriel              │
│                                                                                      │
│  ═══════════════════════════════════════════════════════════════════════════════    │
│  MILESTONES CLÉS:                                                                    │
│  ├── 🏛️  06 Fév: Signature notaire                                                 │
│  ├── 🏦 13 Fév: Compte Qonto actif                                                  │
│  ├── 📋 28 Fév: Inscription Handelsregister                                         │
│  ├── 💳 07 Mar: Stripe opérationnel                                                 │
│  ├── 🚀 15 Mar: Lancement marketing EU                                              │
│  ├── 💰 30 Juin: Objectif 500€ MRR                                                  │
│  ═══════════════════════════════════════════════════════════════════════════════    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. PHASE 1: PRÉPARATION (Semaines 1-4)

### 📅 Semaine 1: 13-19 Janvier 2026 - KICKOFF

#### Lundi 13 Janvier - Réunion de Lancement

| Heure | Activité | Participants | Durée |
|-------|----------|--------------|-------|
| 18:00 CET | Réunion Kickoff visio | Tous (4) | 2h |

**Agenda Réunion Kickoff:**
```
1. Validation structure UG Allemagne (15 min)
2. Confirmation répartition 4×25% (10 min)
3. Validation rôles et responsabilités (30 min)
4. Discussion budget initial (20 min)
5. Choix du nom définitif société (15 min)
6. Planning des 4 prochaines semaines (20 min)
7. Questions et next steps (10 min)
```

**Livrables Semaine 1:**

| Tâche | Responsable | Deadline | Statut |
|-------|-------------|----------|--------|
| Rechercher 3 Steuerberater en ligne | Mehdi | 15 Jan | ⬜ |
| Comparer Qonto vs Fidor vs Penta | Mehdi | 16 Jan | ⬜ |
| Vérifier disponibilité nom "NutriProfile" | Mehdi | 15 Jan | ⬜ |
| Préparer liste documents requis | Mehdi | 17 Jan | ⬜ |
| Scanner passeports (4 associés) | Tous | 17 Jan | ⬜ |
| Rechercher modèle pacte associés | Badre | 17 Jan | ⬜ |
| Créer dossier partagé Google Drive | Salma | 14 Jan | ⬜ |
| Setup canal Slack #nutriprofile-business | Badre | 14 Jan | ⬜ |

**Workflow - Recherche Steuerberater:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW: SÉLECTION STEUERBERATER                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  MEHDI                                                                       │
│    │                                                                         │
│    ▼                                                                         │
│  ┌─────────────────┐                                                        │
│  │ 1. Recherche    │  Critères:                                             │
│  │    en ligne     │  • Expérience startups/tech                            │
│  │    (3 options)  │  • Interface en ligne (DATEV)                          │
│  └────────┬────────┘  • Tarif 150-300€/mois                                 │
│           │           • Anglais ou français parlé                           │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ 2. Contact      │  Email type:                                           │
│  │    initial      │  "Nous créons une UG tech, 4 associés                  │
│  │    (email)      │   dont 2 au Maroc. Pouvez-vous nous                    │
│  └────────┬────────┘   accompagner?"                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ 3. Appels       │  Questions clés:                                       │
│  │    découverte   │  • Expérience UG avec associés étrangers?              │
│  │    (15 min)     │  • Tarif mensuel tout compris?                         │
│  └────────┬────────┘  • Délai réponse questions?                            │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ 4. Présentation │                                                        │
│  │    au groupe    │ ──────► DÉCISION COLLECTIVE                            │
│  │    (réunion)    │                                                        │
│  └─────────────────┘                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Steuerberater Recommandés (à contacter):**

| Cabinet | Spécialité | Tarif estimé | Contact |
|---------|------------|--------------|---------|
| [Kontist Steuerberatung](https://kontist.com) | Startups, digital | 150-250€/mois | kontist.com |
| [Accountable](https://www.accountable.de) | Freelances, UG | 100-200€/mois | accountable.de |
| [Felix1.de](https://felix1.de) | PME, en ligne | 150-300€/mois | felix1.de |
| [Steueragenten](https://steueragenten.de) | Digital, startups | 200-350€/mois | steueragenten.de |

---

### 📅 Semaine 2: 20-26 Janvier 2026 - DOCUMENTS JURIDIQUES

**Objectif:** Finaliser le pacte d'associés et choisir la banque

**Réunion Hebdo - Lundi 20 Janvier 18:00 CET**

| Tâche | Responsable | Deadline | Statut |
|-------|-------------|----------|--------|
| Rédiger draft pacte d'associés | Badre + Mehdi | 22 Jan | ⬜ |
| Review pacte par tous les associés | Tous | 24 Jan | ⬜ |
| Choisir Steuerberater définitif | Mehdi | 21 Jan | ⬜ |
| Ouvrir compte Qonto (en formation) | Mehdi | 23 Jan | ⬜ |
| Rechercher notaire disponible | Mehdi | 24 Jan | ⬜ |
| Préparer statuts (Gesellschaftsvertrag) | Steuerberater | 26 Jan | ⬜ |
| Valider adresse siège social | Mehdi + Salma | 22 Jan | ⬜ |

**Structure du Pacte d'Associés:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PACTE D'ASSOCIÉS - SOMMAIRE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PRÉAMBULE                                                                   │
│  ├── Identification des parties                                             │
│  ├── Objet de la société                                                    │
│  └── Capital et répartition                                                 │
│                                                                              │
│  TITRE I - GOUVERNANCE                                                       │
│  ├── Article 1: Organes de décision                                         │
│  ├── Article 2: Répartition des rôles (Badre/Mehdi/Salma/Laila)            │
│  ├── Article 3: Pouvoirs du gérant                                          │
│  ├── Article 4: Décisions ordinaires (<5.000€)                              │
│  ├── Article 5: Décisions extraordinaires (>5.000€)                         │
│  └── Article 6: Réunions et votes                                           │
│                                                                              │
│  TITRE II - DEADLOCK (IMPASSE)                                              │
│  ├── Article 7: Définition de l'impasse                                     │
│  ├── Article 8: Procédure de médiation (30 jours)                           │
│  ├── Article 9: Clause Shotgun (Buy or Sell)                                │
│  └── Article 10: Casting vote par domaine                                   │
│                                                                              │
│  TITRE III - TRANSFERT DE PARTS                                             │
│  ├── Article 11: Agrément des cessions                                      │
│  ├── Article 12: Droit de préemption                                        │
│  ├── Article 13: Tag-Along (droit de suite)                                 │
│  ├── Article 14: Drag-Along (droit d'entraînement)                          │
│  └── Article 15: Valorisation des parts                                     │
│                                                                              │
│  TITRE IV - VESTING ET DÉPART                                               │
│  ├── Article 16: Vesting sur 4 ans (cliff 12 mois)                          │
│  ├── Article 17: Good leaver / Bad leaver                                   │
│  └── Article 18: Non-concurrence (2 ans)                                    │
│                                                                              │
│  TITRE V - DISPOSITIONS FINANCIÈRES                                         │
│  ├── Article 19: Politique de dividendes                                    │
│  ├── Article 20: Rémunération des associés actifs                           │
│  └── Article 21: Apports en compte courant                                  │
│                                                                              │
│  TITRE VI - DISPOSITIONS DIVERSES                                           │
│  ├── Article 22: Confidentialité                                            │
│  ├── Article 23: Propriété intellectuelle                                   │
│  ├── Article 24: Droit applicable (droit allemand)                          │
│  └── Article 25: Juridiction compétente                                     │
│                                                                              │
│  ANNEXES                                                                     │
│  ├── Annexe A: Fiches de poste détaillées                                   │
│  ├── Annexe B: Matrice RACI                                                 │
│  └── Annexe C: Tableau de vesting                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Clause Shotgun Détaillée:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW: CLAUSE SHOTGUN                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DÉCLENCHEMENT: Impasse non résolue après 60 jours de médiation             │
│                                                                              │
│  GROUPE A                              GROUPE B                              │
│  (Badre + Laila)                       (Mehdi + Salma)                       │
│       │                                      │                               │
│       │  ┌─────────────────────────────┐    │                               │
│       └─►│ OFFRE: "Je rachète vos 50%  │◄───┘                               │
│          │ pour X euros"               │                                     │
│          └──────────────┬──────────────┘                                    │
│                         │                                                    │
│                         ▼                                                    │
│          ┌─────────────────────────────┐                                    │
│          │  GROUPE B a 30 jours pour:  │                                    │
│          └──────────────┬──────────────┘                                    │
│                         │                                                    │
│            ┌────────────┴────────────┐                                      │
│            ▼                         ▼                                       │
│  ┌─────────────────┐      ┌─────────────────┐                               │
│  │   ACCEPTER      │      │    RETOURNER    │                               │
│  │                 │      │                 │                               │
│  │ Groupe A achète │      │ Groupe B achète │                               │
│  │ 50% de B        │      │ 50% de A        │                               │
│  │ au prix X       │      │ au MÊME prix X  │                               │
│  └─────────────────┘      └─────────────────┘                               │
│                                                                              │
│  PROTECTION: Le prix proposé doit être "juste" car l'initiateur             │
│  risque de devoir vendre au même prix s'il a sous-évalué.                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📅 Semaine 3: 27 Janvier - 02 Février 2026 - PRÉPARATION NOTAIRE

**Réunion Hebdo - Lundi 27 Janvier 18:00 CET**

| Tâche | Responsable | Deadline | Statut |
|-------|-------------|----------|--------|
| Finaliser et signer pacte d'associés | Tous | 28 Jan | ⬜ |
| Confirmer RDV notaire | Mehdi | 28 Jan | ⬜ |
| Préparer procurations (Badre + Laila) | Badre + Laila | 30 Jan | ⬜ |
| Traduire/apostiller documents si requis | Badre + Laila | 31 Jan | ⬜ |
| Virer 500€ chacun vers compte commun | Tous | 01 Fév | ⬜ |
| Valider statuts définitifs | Steuerberater | 01 Fév | ⬜ |
| Préparer liste des premiers clients cibles | Salma | 02 Fév | ⬜ |

**Workflow - Procuration pour Associés au Maroc:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│            WORKFLOW: PROCURATION BADRE & LAILA (MAROC)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  OPTION A: Procuration notariée au Maroc (RECOMMANDÉE)                      │
│  ══════════════════════════════════════════════════════                     │
│                                                                              │
│  Badre/Laila                                                                │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────┐                                                        │
│  │ 1. Notaire      │  Coût: ~500-800 MAD (~50€)                            │
│  │    marocain     │  Délai: 1-2 jours                                     │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ 2. Apostille    │  Tribunal de 1ère instance                            │
│  │    Maroc        │  Coût: ~100-200 MAD                                   │
│  └────────┬────────┘  Délai: 2-3 jours                                     │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ 3. Traduction   │  Traducteur assermenté                                │
│  │    allemande    │  Coût: ~100-150€                                      │
│  └────────┬────────┘  Délai: 2-3 jours                                     │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ 4. Envoi à      │  DHL/FedEx Express                                    │
│  │    Mehdi (DE)   │  Coût: ~50€                                           │
│  └────────┬────────┘  Délai: 3-5 jours                                     │
│           │                                                                  │
│           ▼                                                                  │
│       NOTAIRE ALLEMAND                                                       │
│       (Mehdi représente Badre + Laila)                                      │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  OPTION B: Vidéoconférence notaire (SI éligible eID)                        │
│  ══════════════════════════════════════════════════════                     │
│                                                                              │
│  ⚠️  ATTENTION: Requiert carte d'identité avec fonction eID                 │
│  (UE/EEE uniquement). Passeport marocain NON éligible.                      │
│                                                                              │
│  → Pour Badre et Laila: OPTION A obligatoire                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📅 Semaine 4: 03-09 Février 2026 - SIGNATURE NOTAIRE

**🎯 MILESTONE: Signature chez le notaire - 06 Février 2026**

| Tâche | Responsable | Deadline | Statut |
|-------|-------------|----------|--------|
| RDV Notaire (Mehdi + Salma en personne) | Mehdi | 06 Fév | ⬜ |
| Procurations Badre + Laila reçues | Mehdi | 05 Fév | ⬜ |
| Dépôt capital 2.000€ sur Qonto | Mehdi | 06 Fév | ⬜ |
| Obtenir attestation dépôt capital | Mehdi | 07 Fév | ⬜ |
| Soumettre inscription Handelsregister | Notaire | 07 Fév | ⬜ |
| Commencer préparation contenu marketing | Salma | 09 Fév | ⬜ |
| Setup environnement Stripe (test) | Badre | 09 Fév | ⬜ |

**Checklist Documents Notaire:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CHECKLIST NOTAIRE - 06 FÉVRIER 2026                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DOCUMENTS À APPORTER (Mehdi):                                              │
│                                                                              │
│  ☐ Passeport/carte d'identité Mehdi (original)                             │
│  ☐ Passeport/carte d'identité Salma (original)                             │
│  ☐ Procuration notariée Badre (original apostillé + traduction)            │
│  ☐ Procuration notariée Laila (original apostillé + traduction)            │
│  ☐ Copie passeport Badre (certifiée conforme)                              │
│  ☐ Copie passeport Laila (certifiée conforme)                              │
│  ☐ Attestation de dépôt capital Qonto                                      │
│  ☐ Projet de statuts validé par Steuerberater                              │
│  ☐ Adresse du siège social (contrat bail ou attestation domicile)          │
│                                                                              │
│  INFORMATIONS REQUISES:                                                     │
│                                                                              │
│  ☐ Nom de la société: NutriProfile UG (haftungsbeschränkt)                 │
│  ☐ Siège social: [Adresse Mehdi/Salma en Allemagne]                        │
│  ☐ Objet social: Développement et exploitation d'applications              │
│     numériques dans le domaine de la nutrition et de la santé              │
│  ☐ Capital social: 2.000€                                                  │
│  ☐ Répartition:                                                            │
│     • Badre Zouiri: 500€ (25%)                                             │
│     • Laila Mokhliss: 500€ (25%)                                           │
│     • Mehdi Mokhliss: 500€ (25%)                                           │
│     • Salma [Nom]: 500€ (25%)                                              │
│  ☐ Gérant (Geschäftsführer): Mehdi Mokhliss                                │
│  ☐ Exercice fiscal: Année civile (01/01 - 31/12)                           │
│                                                                              │
│  COÛT ESTIMÉ NOTAIRE:                                                       │
│  ├── Frais de base UG: ~300-400€                                           │
│  ├── Procurations étrangères: ~100€ supplémentaire                         │
│  └── TOTAL: ~400-500€                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. PHASE 2: CRÉATION JURIDIQUE (Semaines 5-8)

### 📅 Semaine 5: 10-16 Février 2026 - ATTENTE HANDELSREGISTER

**Statut:** UG "in Gründung" (en formation)

⚠️ **IMPORTANT:** Pendant cette période, la société existe mais n'a pas encore la personnalité juridique complète. Les associés sont personnellement responsables.

| Tâche | Responsable | Deadline | Statut |
|-------|-------------|----------|--------|
| Suivi inscription Handelsregister | Mehdi | Continu | ⬜ |
| Demander Steuernummer (via Steuerberater) | Mehdi | 12 Fév | ⬜ |
| Créer compte Stripe (mode test) | Badre | 12 Fév | ⬜ |
| Rédiger 4 articles SEO (DE) | Salma | 16 Fév | ⬜ |
| Rédiger 2 articles SEO (FR) | Laila | 16 Fév | ⬜ |
| Préparer visuels campagnes Meta | Salma | 14 Fév | ⬜ |
| Mettre à jour mentions légales app | Badre | 16 Fév | ⬜ |

**Workflow - Inscription Handelsregister:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW: HANDELSREGISTER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  NOTAIRE                                                                     │
│     │                                                                        │
│     │  Après signature (06 Fév)                                             │
│     ▼                                                                        │
│  ┌─────────────────┐                                                        │
│  │ 1. Soumission   │  Le notaire envoie électroniquement                   │
│  │    électronique │  tous les documents au Amtsgericht                    │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼  (1-3 semaines)                                                 │
│  ┌─────────────────┐                                                        │
│  │ 2. Vérification │  Le tribunal vérifie:                                 │
│  │    Amtsgericht  │  • Conformité statuts                                 │
│  │                 │  • Capital déposé                                      │
│  └────────┬────────┘  • Nom disponible                                     │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ 3. Publication  │  Inscription au registre                              │
│  │    Handels-     │  Numéro HRB attribué                                  │
│  │    register     │  Ex: HRB 123456 B                                     │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ 4. Notification │  Email/courrier au gérant                             │
│  │    Mehdi        │  + Handelsregisterauszug                              │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ════════════════════════════════════════════════════════                   │
│  ✅ UG OFFICIELLEMENT CRÉÉE                                                 │
│     Haftungsbeschränkung active!                                            │
│  ════════════════════════════════════════════════════════                   │
│                                                                              │
│  DÉLAI MOYEN: 2-4 semaines (variable selon Amtsgericht)                     │
│  COÛT: 150€ (frais de registre)                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📅 Semaine 6: 17-23 Février 2026 - HANDELSREGISTER OK

**🎯 MILESTONE ESTIMÉ: Inscription Handelsregister - ~21 Février 2026**

| Tâche | Responsable | Deadline | Statut |
|-------|-------------|----------|--------|
| Recevoir Handelsregisterauszug | Mehdi | ~21 Fév | ⬜ |
| Envoyer extrait à Qonto (finalisation compte) | Mehdi | 22 Fév | ⬜ |
| Demander USt-IdNr (numéro TVA) | Steuerberater | 22 Fév | ⬜ |
| Activer compte Stripe (mode live) | Badre + Mehdi | 23 Fév | ⬜ |
| Configurer webhooks Stripe | Badre | 23 Fév | ⬜ |
| Gewerbeanmeldung (inscription commerce) | Mehdi | 23 Fév | ⬜ |
| Créer page entreprise LinkedIn | Salma | 23 Fév | ⬜ |

**Workflow - Activation Stripe:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW: ACTIVATION STRIPE GERMANY                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PRÉREQUIS:                                                                  │
│  ☐ Handelsregisterauszug (extrait registre commerce)                        │
│  ☐ Numéro HRB                                                               │
│  ☐ Adresse siège social                                                     │
│  ☐ IBAN compte Qonto                                                        │
│  ☐ Passeport gérant (Mehdi)                                                 │
│                                                                              │
│  BADRE                           MEHDI                                       │
│     │                               │                                        │
│     ▼                               │                                        │
│  ┌─────────────────┐               │                                        │
│  │ 1. Créer compte │               │                                        │
│  │    Stripe.com   │               │                                        │
│  │    (email pro)  │               │                                        │
│  └────────┬────────┘               │                                        │
│           │                        │                                        │
│           ▼                        ▼                                        │
│  ┌─────────────────────────────────────────────┐                           │
│  │ 2. Remplir informations société             │                           │
│  │    • Nom: NutriProfile UG (haftungsbeschr.) │                           │
│  │    • HRB: [numéro]                          │                           │
│  │    • Adresse: [siège social]                │                           │
│  │    • Type: Software/SaaS                    │                           │
│  └────────────────────┬────────────────────────┘                           │
│                       │                                                     │
│                       ▼                                                     │
│  ┌─────────────────────────────────────────────┐                           │
│  │ 3. KYC - Vérification identité              │  MEHDI (gérant)           │
│  │    • Upload Handelsregisterauszug           │                           │
│  │    • Upload passeport Mehdi                 │                           │
│  │    • Informations beneficial owners (4)     │                           │
│  └────────────────────┬────────────────────────┘                           │
│                       │                                                     │
│                       ▼  (1-3 jours ouvrés)                                │
│  ┌─────────────────────────────────────────────┐                           │
│  │ 4. Vérification Stripe                      │                           │
│  │    "Your account is now active"             │                           │
│  └────────────────────┬────────────────────────┘                           │
│                       │                                                     │
│                       ▼                                                     │
│  ┌─────────────────────────────────────────────┐                           │
│  │ 5. Configuration technique (Badre)          │                           │
│  │    • API keys (test + live)                 │                           │
│  │    • Webhooks endpoint                      │                           │
│  │    • Produits/Prix (Premium, Pro)           │                           │
│  │    • Customer portal                        │                           │
│  └────────────────────┬────────────────────────┘                           │
│                       │                                                     │
│                       ▼                                                     │
│  ════════════════════════════════════════════════════════                  │
│  ✅ STRIPE OPÉRATIONNEL                                                    │
│     Prêt à recevoir des paiements!                                         │
│  ════════════════════════════════════════════════════════                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📅 Semaine 7: 24 Février - 02 Mars 2026 - TESTS & PRÉPARATION LANCEMENT

| Tâche | Responsable | Deadline | Statut |
|-------|-------------|----------|--------|
| Tests paiements Stripe (cartes test) | Badre | 25 Fév | ⬜ |
| Créer produits Stripe (Premium/Pro) | Badre | 25 Fév | ⬜ |
| Landing page DE optimisée | Salma + Badre | 28 Fév | ⬜ |
| Setup Meta Business Manager | Salma | 26 Fév | ⬜ |
| Créer audiences cibles Meta | Salma | 28 Fév | ⬜ |
| Préparer 10 créatifs publicitaires | Salma + Laila | 02 Mar | ⬜ |
| Documentation migration Lemon→Stripe | Badre | 02 Mar | ⬜ |
| Créer compte Google Ads | Salma | 01 Mar | ⬜ |

**Configuration Produits Stripe:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRODUITS STRIPE À CRÉER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PRODUIT 1: NUTRIPROFILE PREMIUM                                            │
│  ════════════════════════════════                                           │
│  │                                                                          │
│  ├── Prix Mensuel                                                           │
│  │   • ID: price_premium_monthly                                            │
│  │   • Montant: 5,00€/mois                                                 │
│  │   • Récurrence: Mensuelle                                               │
│  │   • Trial: 7 jours gratuits                                             │
│  │                                                                          │
│  └── Prix Annuel                                                            │
│      • ID: price_premium_yearly                                             │
│      • Montant: 40,00€/an (économie 33%)                                   │
│      • Récurrence: Annuelle                                                │
│      • Trial: 7 jours gratuits                                             │
│                                                                              │
│  PRODUIT 2: NUTRIPROFILE PRO                                                │
│  ════════════════════════════                                               │
│  │                                                                          │
│  ├── Prix Mensuel                                                           │
│  │   • ID: price_pro_monthly                                                │
│  │   • Montant: 10,00€/mois                                                │
│  │   • Récurrence: Mensuelle                                               │
│  │   • Trial: 7 jours gratuits                                             │
│  │                                                                          │
│  └── Prix Annuel                                                            │
│      • ID: price_pro_yearly                                                 │
│      • Montant: 80,00€/an (économie 33%)                                   │
│      • Récurrence: Annuelle                                                │
│      • Trial: 7 jours gratuits                                             │
│                                                                              │
│  WEBHOOKS À CONFIGURER:                                                     │
│  ├── customer.subscription.created                                          │
│  ├── customer.subscription.updated                                          │
│  ├── customer.subscription.deleted                                          │
│  ├── invoice.paid                                                           │
│  ├── invoice.payment_failed                                                 │
│  └── checkout.session.completed                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📅 Semaine 8: 03-09 Mars 2026 - MIGRATION PAIEMENTS

**🎯 MILESTONE: Stripe opérationnel - 07 Mars 2026**

| Tâche | Responsable | Deadline | Statut |
|-------|-------------|----------|--------|
| Migration code Lemon Squeezy → Stripe | Badre | 05 Mar | ⬜ |
| Tests end-to-end paiements | Badre | 06 Mar | ⬜ |
| Basculer en production | Badre | 07 Mar | ⬜ |
| Communiquer changement aux users existants | Salma | 07 Mar | ⬜ |
| Finaliser campagnes Meta (draft) | Salma | 08 Mar | ⬜ |
| Review SEO articles publiés | Salma + Laila | 09 Mar | ⬜ |
| Premier rapport financier | Mehdi | 09 Mar | ⬜ |

---

## 5. PHASE 3: LANCEMENT OPÉRATIONNEL (Semaines 9-12)

### 📅 Semaine 9: 10-16 Mars 2026 - LANCEMENT MARKETING EU

**🚀 MILESTONE: Lancement campagnes marketing - 15 Mars 2026**

| Tâche | Responsable | Deadline | Statut |
|-------|-------------|----------|--------|
| Lancer campagne Meta Ads (DE) | Salma | 15 Mar | ⬜ |
| Lancer campagne Meta Ads (FR) | Salma | 15 Mar | ⬜ |
| Budget initial: 20€/jour | Mehdi (validation) | 15 Mar | ⬜ |
| Monitoring quotidien performances | Salma | Continu | ⬜ |
| A/B test créatifs (3 variantes) | Salma | 16 Mar | ⬜ |
| Répondre aux premiers commentaires | Laila | Continu | ⬜ |
| Publier 2 articles blog | Laila | 16 Mar | ⬜ |

**Plan de Lancement Marketing - 90 Jours:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PLAN MARKETING 90 JOURS (Mars-Juin 2026)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  JOURS 1-30: FONDATION & TEST                                               │
│  ═══════════════════════════════                                            │
│                                                                              │
│  Semaine 1 (10-16 Mars):                                                    │
│  ├── Lancement Meta Ads (budget: 20€/jour)                                 │
│  ├── 3 audiences test: Fitness, Nutrition, Perte de poids                  │
│  ├── 3 créatifs: Vidéo démo, Carrousel, Image statique                     │
│  └── KPI cible: CPC < 0,50€, CTR > 2%                                      │
│                                                                              │
│  Semaine 2 (17-23 Mars):                                                    │
│  ├── Analyser résultats, couper audiences faibles                          │
│  ├── Doubler budget sur best performers                                     │
│  ├── Lancer Google Ads (10€/jour)                                          │
│  └── KPI cible: CPA < 10€                                                  │
│                                                                              │
│  Semaine 3-4 (24 Mars - 06 Avril):                                         │
│  ├── Optimisation continue                                                  │
│  ├── Retargeting visiteurs site                                            │
│  ├── Lookalike audiences (si >100 conversions)                             │
│  └── Objectif: 50 inscriptions/semaine                                     │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  JOURS 31-60: SCALE & CONTENT                                               │
│  ═══════════════════════════════                                            │
│                                                                              │
│  Semaines 5-8 (Avril):                                                      │
│  ├── Budget Meta: 40€/jour (si ROI positif)                                │
│  ├── Publier 8 articles SEO (4 DE, 4 FR)                                   │
│  ├── Lancer TikTok organique (3 vidéos/semaine)                            │
│  ├── Outreach 10 micro-influenceurs nutrition                              │
│  └── Objectif: 200 inscriptions/semaine                                    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  JOURS 61-90: OPTIMISATION & CONVERSION                                     │
│  ═══════════════════════════════════════                                    │
│                                                                              │
│  Semaines 9-12 (Mai-Juin):                                                  │
│  ├── Focus sur conversion trial → paid                                     │
│  ├── Email nurturing séquence (7 emails)                                   │
│  ├── Optimisation onboarding in-app                                        │
│  ├── Programme parrainage actif                                            │
│  └── Objectif: 500€ MRR                                                    │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  BUDGET TOTAL 90 JOURS:                                                     │
│  ├── Meta Ads: ~1.500€                                                     │
│  ├── Google Ads: ~600€                                                     │
│  ├── Influenceurs: ~300€                                                   │
│  ├── Outils: ~200€                                                         │
│  └── TOTAL: ~2.600€                                                        │
│                                                                              │
│  OBJECTIFS:                                                                 │
│  ├── Inscriptions: 1.000+                                                  │
│  ├── Trial → Paid: 5% (50 clients payants)                                 │
│  ├── MRR: 500€                                                             │
│  └── CAC: <15€                                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📅 Semaines 10-12: 17 Mars - 06 Avril 2026

**Réunion Hebdo chaque Lundi 18:00 CET**

| Semaine | Focus Principal | KPIs à Suivre |
|---------|-----------------|---------------|
| S10 (17-23 Mar) | Optimisation ads + premiers clients | CPC, CTR, Inscriptions |
| S11 (24-30 Mar) | Scale audiences performantes | CPA, Conversions trial |
| S12 (31 Mar-06 Avr) | Review Q1 + Planning Q2 | MRR, Churn, LTV |

**Livrables Fin de Phase 3:**

| Livrable | Responsable | Date |
|----------|-------------|------|
| Rapport Q1 complet | Mehdi | 06 Avr |
| Analyse performance marketing | Salma | 06 Avr |
| Roadmap technique Q2 | Badre | 06 Avr |
| Plan contenu Q2 | Salma + Laila | 06 Avr |

---

## 6. PHASE 4: CROISSANCE (Mois 4-6)

### Vue d'Ensemble Avril-Juin 2026

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE CROISSANCE - AVRIL À JUIN 2026                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AVRIL 2026 - SCALE MARKETING                                               │
│  ═══════════════════════════════                                            │
│                                                                              │
│  Objectifs:                                                                  │
│  ├── 300 nouveaux utilisateurs                                             │
│  ├── 20 conversions trial → paid                                           │
│  ├── MRR: 150€                                                             │
│  └── 8 articles SEO publiés                                                │
│                                                                              │
│  Actions clés:                                                              │
│  ├── SALMA: Scale Meta Ads (40€/jour)                                      │
│  ├── SALMA: Lancer TikTok Ads test                                         │
│  ├── LAILA: 4 articles FR + community management                           │
│  ├── BADRE: Optimisation performance app                                   │
│  ├── MEHDI: Premier bilan comptable trimestriel                            │
│  └── TOUS: Review stratégie pricing                                        │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  MAI 2026 - EXPANSION DACH                                                  │
│  ═══════════════════════════                                                │
│                                                                              │
│  Objectifs:                                                                  │
│  ├── Expansion Autriche + Suisse                                           │
│  ├── 500 nouveaux utilisateurs                                             │
│  ├── 35 clients payants cumulés                                            │
│  ├── MRR: 300€                                                             │
│  └── 2 partenariats influenceurs                                           │
│                                                                              │
│  Actions clés:                                                              │
│  ├── SALMA: Campagnes AT/CH                                                │
│  ├── SALMA: Outreach influenceurs DACH                                     │
│  ├── BADRE: Features demandées par users                                   │
│  ├── MEHDI: Contacts B2B (nutritionnistes, coachs)                         │
│  └── LAILA: Support FR + traductions DE                                    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  JUIN 2026 - OBJECTIF 500€ MRR                                             │
│  ═══════════════════════════════                                            │
│                                                                              │
│  Objectifs:                                                                  │
│  ├── 🎯 500€ MRR (objectif principal)                                      │
│  ├── 70 clients payants cumulés                                            │
│  ├── Churn < 10%/mois                                                      │
│  ├── NPS > 40                                                              │
│  └── Review semestriel complet                                             │
│                                                                              │
│  Actions clés:                                                              │
│  ├── TOUS: Review semestriel (30 Juin)                                     │
│  ├── MEHDI: Préparation déclarations fiscales                              │
│  ├── BADRE: Roadmap S2 2026                                                │
│  ├── SALMA: Stratégie marketing S2                                         │
│  └── Décision: Embauche/Investissement?                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. WORKFLOWS DÉTAILLÉS PAR PROCESSUS

### 7.1 Workflow Hebdomadaire

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW HEBDOMADAIRE NUTRIPROFILE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LUNDI                                                                       │
│  ══════                                                                      │
│  09:00 │ Badre: Review tickets/bugs weekend                                │
│  10:00 │ Salma: Analyse performance ads semaine précédente                 │
│  14:00 │ Laila: Planning contenu semaine                                   │
│  18:00 │ RÉUNION HEBDO (tous) - 1h                                         │
│        │ └── Agenda:                                                        │
│        │     ├── Tour de table (5 min/personne)                            │
│        │     ├── KPIs de la semaine                                        │
│        │     ├── Blocages et décisions                                     │
│        │     └── Objectifs semaine suivante                                │
│                                                                              │
│  MARDI-JEUDI                                                                │
│  ═════════════                                                              │
│  │ Badre: Développement (features, bugs, maintenance)                      │
│  │ Salma: Campagnes marketing + création contenu                           │
│  │ Laila: Rédaction + community management                                 │
│  │ Mehdi: Admin, finance, relations externes                               │
│                                                                              │
│  VENDREDI                                                                   │
│  ════════                                                                   │
│  09:00 │ Badre: Deploy hebdo (si changements)                              │
│  14:00 │ Salma: Rapport performance semaine                                │
│  16:00 │ Tous: Mise à jour Notion (tâches, docs)                           │
│  17:00 │ Mehdi: Validation dépenses semaine                                │
│                                                                              │
│  WEEKEND                                                                    │
│  ════════                                                                   │
│  │ Badre: Astreinte technique (urgences uniquement)                        │
│  │ Laila: Modération commentaires/messages                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Workflow de Décision

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW DE DÉCISION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                        NOUVELLE DÉCISION                                     │
│                              │                                               │
│                              ▼                                               │
│                    ┌─────────────────┐                                      │
│                    │  Impact budget? │                                      │
│                    └────────┬────────┘                                      │
│                             │                                                │
│           ┌─────────────────┼─────────────────┐                             │
│           ▼                 ▼                 ▼                              │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                       │
│    │   < 500€    │  │ 500-5.000€  │  │  > 5.000€   │                       │
│    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                       │
│           │                │                │                                │
│           ▼                ▼                ▼                                │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                       │
│    │ Responsable │  │  2 associés │  │ 4 associés  │                       │
│    │  du domaine │  │  minimum    │  │  unanimité  │                       │
│    │  décide     │  │  valident   │  │  requise    │                       │
│    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                       │
│           │                │                │                                │
│           │         ┌──────┴──────┐         │                               │
│           │         │ Domaine?    │         │                               │
│           │         └──────┬──────┘         │                               │
│           │    ┌───────────┼───────────┐    │                               │
│           │    ▼           ▼           ▼    │                               │
│           │  Tech       Marketing   Finance │                               │
│           │  Badre+1    Salma+1    Mehdi+1  │                               │
│           │                                  │                               │
│           └──────────────┬───────────────────┘                              │
│                          ▼                                                   │
│                   ┌─────────────┐                                           │
│                   │  DÉCISION   │                                           │
│                   │  PRISE      │                                           │
│                   └──────┬──────┘                                           │
│                          │                                                   │
│                          ▼                                                   │
│                   ┌─────────────┐                                           │
│                   │ Documenter  │                                           │
│                   │ dans Notion │                                           │
│                   └─────────────┘                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Workflow Support Client

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW SUPPORT CLIENT                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                      TICKET/MESSAGE CLIENT                                   │
│                              │                                               │
│                              ▼                                               │
│                    ┌─────────────────┐                                      │
│                    │     Langue?     │                                      │
│                    └────────┬────────┘                                      │
│                             │                                                │
│           ┌─────────────────┼─────────────────┐                             │
│           ▼                 ▼                 ▼                              │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                       │
│    │   Français  │  │  Allemand   │  │   Anglais   │                       │
│    │   → LAILA   │  │  → SALMA    │  │  → SALMA    │                       │
│    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                       │
│           │                │                │                                │
│           └────────────────┴────────────────┘                               │
│                            │                                                 │
│                            ▼                                                 │
│                    ┌─────────────────┐                                      │
│                    │  Type de demande │                                      │
│                    └────────┬────────┘                                      │
│                             │                                                │
│        ┌────────────────────┼────────────────────┐                          │
│        ▼                    ▼                    ▼                           │
│  ┌───────────┐       ┌───────────┐       ┌───────────┐                     │
│  │ Question  │       │  Bug/     │       │ Demande   │                     │
│  │ générale  │       │ Problème  │       │ feature   │                     │
│  └─────┬─────┘       └─────┬─────┘       └─────┬─────┘                     │
│        │                   │                   │                             │
│        ▼                   ▼                   ▼                             │
│  ┌───────────┐       ┌───────────┐       ┌───────────┐                     │
│  │ Réponse   │       │ Escalade  │       │ Noter     │                     │
│  │ immédiate │       │ → BADRE   │       │ backlog   │                     │
│  │ (FAQ)     │       │ (24h max) │       │ Notion    │                     │
│  └───────────┘       └───────────┘       └───────────┘                     │
│                                                                              │
│  SLA (Service Level Agreement):                                             │
│  ├── Première réponse: < 24h (jours ouvrés)                                │
│  ├── Résolution bug critique: < 48h                                        │
│  └── Résolution bug normal: < 7 jours                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. OUTILS ET STACK RECOMMANDÉS

### 8.1 Stack Complet par Catégorie

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STACK OUTILS NUTRIPROFILE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  COMMUNICATION                          GESTION DE PROJET                   │
│  ═════════════                          ══════════════════                  │
│  ├── Slack (gratuit)                    ├── Notion (gratuit)                │
│  │   └── Canaux:                        │   └── Espaces:                    │
│  │       #general                       │       📋 Roadmap                  │
│  │       #tech                          │       📝 Documentation            │
│  │       #marketing                     │       🎯 OKRs                     │
│  │       #support                       │       📊 KPIs                     │
│  │       #finance                       │       📁 Réunions                 │
│  │                                      │                                   │
│  ├── Google Meet (gratuit)              ├── GitHub Projects                 │
│  │   └── Réunions hebdo                 │   └── Issues tech                 │
│  │                                      │                                   │
│  └── WhatsApp (urgences)                └── Linear (optionnel)              │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  DÉVELOPPEMENT                          FINANCE                             │
│  ════════════                           ═══════                             │
│  ├── GitHub (gratuit)                   ├── Qonto (10€/mois)                │
│  ├── VSCode                             │   └── Compte UG                   │
│  ├── Fly.io (~30€/mois)                 │                                   │
│  ├── Cloudflare (gratuit)               ├── Stripe (2.9% + 0.25€)           │
│  ├── Sentry (gratuit tier)              │   └── Paiements                   │
│  └── PostHog (gratuit <1M)              │                                   │
│                                         └── DATEV (via Steuerberater)       │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  MARKETING                              DESIGN                              │
│  ═════════                              ══════                              │
│  ├── Meta Business Suite                ├── Canva Pro (12€/mois)            │
│  ├── Google Ads                         ├── Figma (gratuit)                 │
│  ├── Google Analytics 4                 └── CapCut (gratuit)                │
│  ├── Google Search Console                                                  │
│  ├── Semrush (optionnel)                SUPPORT                             │
│  ├── Buffer (gratuit tier)              ═══════                             │
│  └── Mailchimp (gratuit <500)           ├── Crisp (gratuit tier)            │
│                                         └── Help Scout (optionnel)          │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  COÛT MENSUEL OUTILS:                                                       │
│  ├── Essentiels: ~100€/mois                                                │
│  │   (Qonto, Fly.io, Canva)                                                │
│  ├── Optionnels: ~50-100€/mois                                             │
│  │   (Semrush, outils avancés)                                             │
│  └── TOTAL: 100-200€/mois                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Setup Notion Recommandé

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STRUCTURE NOTION - NUTRIPROFILE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📁 NUTRIPROFILE WORKSPACE                                                  │
│  │                                                                          │
│  ├── 📋 ROADMAP                                                            │
│  │   ├── 🎯 OKRs Q1 2026                                                   │
│  │   ├── 🎯 OKRs Q2 2026                                                   │
│  │   └── 📅 Timeline projets                                               │
│  │                                                                          │
│  ├── 📝 DOCUMENTATION                                                      │
│  │   ├── 📖 Onboarding nouveaux membres                                    │
│  │   ├── 📖 Processus et workflows                                         │
│  │   ├── 📖 Pacte d'associés                                               │
│  │   └── 📖 Documentation technique                                        │
│  │                                                                          │
│  ├── 📊 KPIs & REPORTING                                                   │
│  │   ├── 📈 Dashboard KPIs (embedded)                                      │
│  │   ├── 📈 Rapports hebdomadaires                                         │
│  │   └── 📈 Rapports mensuels                                              │
│  │                                                                          │
│  ├── 💼 BUSINESS                                                           │
│  │   ├── 🏦 Finance (accès Mehdi)                                          │
│  │   ├── 📜 Juridique (contrats, statuts)                                  │
│  │   └── 🤝 Partenaires et contacts                                        │
│  │                                                                          │
│  ├── 📣 MARKETING                                                          │
│  │   ├── 📅 Calendrier éditorial                                           │
│  │   ├── 📝 Briefs créatifs                                                │
│  │   ├── 📊 Performances campagnes                                         │
│  │   └── 💡 Idées contenu                                                  │
│  │                                                                          │
│  ├── 🛠️ PRODUIT                                                            │
│  │   ├── 🐛 Bug tracker                                                    │
│  │   ├── ✨ Feature requests                                               │
│  │   ├── 📋 Backlog                                                        │
│  │   └── 🚀 Release notes                                                  │
│  │                                                                          │
│  └── 📁 RÉUNIONS                                                           │
│      ├── 📝 Comptes-rendus hebdo                                           │
│      ├── 📝 Décisions importantes                                          │
│      └── 📝 Actions items                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. BUDGET DÉTAILLÉ PAR PHASE

### 9.1 Budget Phase 1 (Janvier 2026)

| Poste | Détail | Montant | Payeur |
|-------|--------|---------|--------|
| **Juridique** | | | |
| Procuration notaire Maroc (×2) | Badre + Laila | 100€ | Badre/Laila |
| Apostille + traduction | Documents Maroc | 300€ | Badre/Laila |
| Envoi express DHL | Maroc → Allemagne | 50€ | Badre |
| **Outils** | | | |
| Domaine nutriprofile.de | 1 an | 15€ | Société |
| Canva Pro | 1 mois test | 12€ | Société |
| **Total Phase 1** | | **~477€** | |

### 9.2 Budget Phase 2 (Février 2026)

| Poste | Détail | Montant | Payeur |
|-------|--------|---------|--------|
| **Création UG** | | | |
| Capital social | 4 × 500€ | 2.000€ | Tous (bloqué) |
| Notaire | Signature + dépôt | 450€ | Société |
| Handelsregister | Frais inscription | 150€ | Société |
| Gewerbeanmeldung | Inscription commerce | 30€ | Société |
| **Comptabilité** | | | |
| Steuerberater setup | Configuration initiale | 200€ | Société |
| Steuerberater mensuel | Février | 200€ | Société |
| **Banque** | | | |
| Qonto | Ouverture compte | 0€ | - |
| Qonto mensuel | Février | 9€ | Société |
| **Total Phase 2** | | **~3.039€** | |
| *(dont capital bloqué)* | | *(2.000€)* | |

### 9.3 Budget Phase 3 (Mars 2026)

| Poste | Détail | Montant | Payeur |
|-------|--------|---------|--------|
| **Marketing** | | | |
| Meta Ads | 20€/jour × 17 jours | 340€ | Société |
| Google Ads | 10€/jour × 10 jours | 100€ | Société |
| Créatifs (freelance) | Optionnel | 0-200€ | Société |
| **Récurrent** | | | |
| Steuerberater | Mars | 200€ | Société |
| Qonto | Mars | 9€ | Société |
| Fly.io | Hébergement | 30€ | Société |
| **Total Phase 3** | | **~679-879€** | |

### 9.4 Budget Récurrent Mensuel (à partir d'Avril)

| Poste | Montant/mois | Annuel |
|-------|--------------|--------|
| Steuerberater | 200€ | 2.400€ |
| Qonto | 9€ | 108€ |
| Fly.io | 30€ | 360€ |
| Canva Pro | 12€ | 144€ |
| Marketing (variable) | 300-600€ | 3.600-7.200€ |
| Divers | 50€ | 600€ |
| **Total mensuel** | **~600-900€** | **7.200-10.800€** |

### 9.5 Récapitulatif Budget 6 Mois

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BUDGET TOTAL 6 MOIS (Janvier-Juin 2026)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  INVESTISSEMENT INITIAL (Phases 1-2)                                        │
│  ═══════════════════════════════════                                        │
│  ├── Capital social UG                    2.000€  (bloqué en banque)       │
│  ├── Frais création (notaire, etc.)       830€                             │
│  ├── Juridique Maroc (procurations)       450€                             │
│  ├── Setup Steuerberater                  200€                             │
│  └── Divers                               100€                             │
│      ────────────────────────────────────────────                          │
│      SOUS-TOTAL INITIAL                   3.580€                           │
│                                                                              │
│  FONCTIONNEMENT 6 MOIS (Mars-Juin)                                         │
│  ═══════════════════════════════════                                        │
│  ├── Steuerberater (4 mois)               800€                             │
│  ├── Qonto (6 mois)                       54€                              │
│  ├── Fly.io (6 mois)                      180€                             │
│  ├── Canva Pro (6 mois)                   72€                              │
│  ├── Marketing (budget moyen)             2.000€                           │
│  └── Divers et imprévus                   300€                             │
│      ────────────────────────────────────────────                          │
│      SOUS-TOTAL FONCTIONNEMENT            3.406€                           │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│  TOTAL BUDGET 6 MOIS                      6.986€ (~7.000€)                 │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  RÉPARTITION PAR COUPLE (50/50):                                           │
│  ├── Badre + Laila:                       ~3.500€                          │
│  └── Mehdi + Salma:                       ~3.500€                          │
│                                                                              │
│  RÉPARTITION PAR ASSOCIÉ (25%):                                            │
│  └── Par personne:                        ~1.750€                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. KPIs ET MÉTRIQUES DE SUIVI

### 10.1 Dashboard KPIs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD KPIs NUTRIPROFILE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  MÉTRIQUES BUSINESS                     OBJECTIFS 6 MOIS                    │
│  ══════════════════                     ══════════════════                  │
│  │                                      │                                   │
│  │  MRR (Monthly Recurring Revenue)     │  500€                            │
│  │  ├── Premium: X × 5€                 │                                   │
│  │  └── Pro: Y × 10€                    │                                   │
│  │                                      │                                   │
│  │  ARR (Annual Recurring Revenue)      │  6.000€                          │
│  │                                      │                                   │
│  │  Clients payants                     │  70                              │
│  │                                      │                                   │
│  │  ARPU (Avg Revenue Per User)         │  7€                              │
│  │                                      │                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  MÉTRIQUES ACQUISITION                  OBJECTIFS                           │
│  ═════════════════════                  ═════════                           │
│  │                                      │                                   │
│  │  Nouveaux utilisateurs/mois          │  500                             │
│  │                                      │                                   │
│  │  CAC (Customer Acquisition Cost)     │  <15€                            │
│  │                                      │                                   │
│  │  Taux conversion Trial → Paid        │  >5%                             │
│  │                                      │                                   │
│  │  CPC (Cost Per Click)                │  <0,50€                          │
│  │                                      │                                   │
│  │  CTR (Click-Through Rate)            │  >2%                             │
│  │                                      │                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  MÉTRIQUES RÉTENTION                    OBJECTIFS                           │
│  ════════════════════                   ═════════                           │
│  │                                      │                                   │
│  │  Churn mensuel                       │  <10%                            │
│  │                                      │                                   │
│  │  Rétention D1                        │  >40%                            │
│  │                                      │                                   │
│  │  Rétention D7                        │  >20%                            │
│  │                                      │                                   │
│  │  Rétention D30                       │  >10%                            │
│  │                                      │                                   │
│  │  NPS (Net Promoter Score)            │  >40                             │
│  │                                      │                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  MÉTRIQUES PRODUIT                      OBJECTIFS                           │
│  ══════════════════                     ═════════                           │
│  │                                      │                                   │
│  │  Uptime                              │  >99.5%                          │
│  │                                      │                                   │
│  │  Temps de réponse API                │  <500ms                          │
│  │                                      │                                   │
│  │  Bugs critiques ouverts              │  0                               │
│  │                                      │                                   │
│  │  Features livrées/mois               │  2-4                             │
│  │                                      │                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Reporting Mensuel

| Rapport | Responsable | Deadline | Destinataires |
|---------|-------------|----------|---------------|
| Rapport financier | Mehdi | 5 du mois | Tous |
| Rapport marketing | Salma | 5 du mois | Tous |
| Rapport technique | Badre | 5 du mois | Tous |
| Rapport consolidé | Mehdi | 7 du mois | Tous |

---

## 11. GESTION DES RISQUES

### 11.1 Matrice des Risques

| Risque | Probabilité | Impact | Mitigation | Responsable |
|--------|-------------|--------|------------|-------------|
| Retard Handelsregister | Moyenne | Moyen | Prévoir 4 semaines buffer | Mehdi |
| Rejet KYC Stripe | Faible | Élevé | Préparer tous documents à l'avance | Badre + Mehdi |
| CAC trop élevé | Moyenne | Élevé | Tests A/B, diversifier canaux | Salma |
| Conflit associés | Faible | Critique | Pacte d'associés solide | Tous |
| Bug critique prod | Moyenne | Élevé | Monitoring, tests, rollback | Badre |
| Problème trésorerie | Faible | Élevé | Buffer 3 mois, suivi hebdo | Mehdi |

### 11.2 Plan de Contingence

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PLANS DE CONTINGENCE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SCÉNARIO 1: Rejet Stripe KYC                                               │
│  ════════════════════════════                                               │
│  Action: Revenir à Lemon Squeezy temporairement                            │
│  Délai: Immédiat                                                            │
│  Responsable: Badre                                                         │
│  Impact: +3% frais de transaction                                          │
│                                                                              │
│  SCÉNARIO 2: CAC > 20€ après 30 jours                                      │
│  ════════════════════════════════════                                       │
│  Action: Pivoter vers SEO/content + réduire paid                           │
│  Délai: Semaine suivante                                                   │
│  Responsable: Salma                                                         │
│  Impact: Croissance plus lente mais durable                                │
│                                                                              │
│  SCÉNARIO 3: Départ d'un associé                                           │
│  ═══════════════════════════════                                            │
│  Action: Activer clause vesting + redistribution                           │
│  Délai: 30 jours (préavis)                                                 │
│  Responsable: Conseil des associés                                         │
│  Impact: Selon le rôle - plan de transition                                │
│                                                                              │
│  SCÉNARIO 4: Trésorerie < 2.000€                                           │
│  ═══════════════════════════════                                            │
│  Action: Réduire marketing, apport compte courant                          │
│  Délai: Immédiat                                                            │
│  Responsable: Mehdi                                                         │
│  Impact: Croissance gelée temporairement                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. ANNEXES

### Annexe A: Calendrier Détaillé (Gantt Simplifié)

```
JANVIER 2026
════════════
S3  |████| Kickoff, recherche Steuerberater
S4  |████| Pacte associés, choix banque
S5  |████| Documents, RDV notaire

FÉVRIER 2026
════════════
S6  |████| SIGNATURE NOTAIRE (06 Fév)
S7  |██░░| Attente Handelsregister
S8  |██░░| Handelsregister OK, Setup Stripe
S9  |████| Tests paiements, landing page

MARS 2026
═════════
S10 |████| Migration Stripe
S11 |████| LANCEMENT MARKETING (15 Mar)
S12 |████| Optimisation campagnes
S13 |████| Review Q1

AVRIL 2026
══════════
S14-17 |████████| Scale marketing, SEO

MAI 2026
════════
S18-21 |████████| Expansion DACH

JUIN 2026
═════════
S22-26 |████████| OBJECTIF 500€ MRR
```

### Annexe B: Contacts Utiles

| Type | Nom/Service | Contact | Notes |
|------|-------------|---------|-------|
| Steuerberater | [À définir] | - | Spécialisé startups |
| Notaire | [À définir] | - | Région de Mehdi |
| Banque | Qonto DE | qonto.com | Support FR disponible |
| Paiements | Stripe DE | stripe.com/de | Support EN/DE |
| Hébergement | Fly.io | fly.io | Support EN |
| Juridique | [Avocat optionnel] | - | Pour questions complexes |

### Annexe C: Checklist Pré-Lancement

```
AVANT CRÉATION UG
☐ Réunion kickoff réalisée
☐ Rôles validés par tous
☐ Steuerberater choisi et contacté
☐ Compte Qonto demandé
☐ Pacte d'associés rédigé et signé
☐ Procurations Maroc préparées
☐ RDV notaire confirmé
☐ 500€ par associé disponibles

AVANT LANCEMENT MARKETING
☐ UG officiellement créée
☐ Stripe activé et testé
☐ Mentions légales mises à jour
☐ Landing page optimisée
☐ 10 créatifs publicitaires prêts
☐ Audiences Meta configurées
☐ Budget marketing validé
☐ Analytics configuré (PostHog, GA4)

AVANT FIN Q2
☐ 500€ MRR atteint
☐ Bilan semestriel réalisé
☐ Déclarations fiscales à jour
☐ Roadmap S2 définie
```

---

## Sources et Références

### Création UG Allemagne
- [Qonto - Guide UG 2025](https://qonto.com/en/blog/creators/administrative/how-to-set-up-a-ug-company-in-germany)
- [Firma.de - UG Checklist](https://www.firma.de/en/company-formation/how-to-start-a-ug-company-the-ultimate-formation-checklist/)
- [FORIS - Durée création UG](https://www.foris.com/vorratsgesellschaften/ug/dauer-ug-gruendung/)

### Stripe et KYC
- [Stripe - KYC Germany](https://stripe.com/resources/more/kyc-documentation-germany)
- [Stripe - Business Account Germany](https://stripe.com/resources/more/business-checking-account-germany)

### Marketing SaaS
- [SaaS Consult - 90 Days Launch](https://saasconsult.co/blog/saas-launch-strategy-90-days/)
- [Directive - B2B SaaS Marketing 2026](https://directiveconsulting.com/blog/blog-b2b-saas-marketing-guide-2026/)

### Pacte d'Associés
- [SPZ Legal - Deadlock 50/50](https://spzlegal.com/blog/incorporation/how-to-resolve-deadlock-in-50-50-founder-situations)
- [TGS Avocats - Pacte 50/50](https://www.tgs-avocats.fr/blog/pacte-associes-50-50)

### Rôles Startup
- [Zeni - COO in Startup](https://www.zeni.ai/blog/what-does-a-coo-do-in-a-startup)
- [Hunt Club - CFO vs COO](https://www.huntclub.com/blog/cfo-vs.-coo-whats-the-difference)

### Outils Collaboration
- [Startup Blink - Collaboration Tools](https://www.startupblink.com/blog/best-collaboration-tools-for-remote-teams/)
- [Monday.com - Remote Collaboration](https://monday.com/blog/project-management/remote-collaboration/)

---

**Document préparé le 15 Janvier 2026**
**Version 1.0**

*Ce document est un guide de planification. Consultez un avocat et un expert-comptable pour validation des aspects juridiques et fiscaux.*
