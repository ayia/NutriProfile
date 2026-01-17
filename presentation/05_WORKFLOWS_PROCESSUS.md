# Workflows et Processus - NutriProfile

## Guide Opérationnel Détaillé

---

## 1. Workflow Création UG

```
════════════════════════════════════════════════════════════════════════════════
                         PROCESSUS CRÉATION UG
════════════════════════════════════════════════════════════════════════════════

SEMAINE 1-2: PRÉPARATION
──────────────────────────────────────────────────────────────────────────────

    MEHDI                           BADRE/LAILA
    ─────                           ───────────
      │                                  │
      ▼                                  ▼
┌───────────────┐                 ┌───────────────┐
│ Rechercher    │                 │ Scanner       │
│ Steuerberater │                 │ passeports    │
│ (3 devis)     │                 │ + photos ID   │
└───────┬───────┘                 └───────┬───────┘
        │                                 │
        ▼                                 │
┌───────────────┐                         │
│ Comparer et   │                         │
│ choisir       │                         │
└───────┬───────┘                         │
        │                                 │
        ▼                                 ▼
┌─────────────────────────────────────────────────┐
│     RÉUNION: Valider Steuerberater + docs       │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼

SEMAINE 3: COMPTES ET DOCUMENTS
──────────────────────────────────────────────────────────────────────────────

    MEHDI                    BADRE              LAILA            SALMA
    ─────                    ─────              ─────            ─────
      │                        │                  │                │
      ▼                        ▼                  ▼                │
┌───────────┐           ┌───────────┐      ┌───────────┐          │
│ Ouvrir    │           │ Notaire   │      │ Notaire   │          │
│ Qonto     │           │ Maroc:    │      │ Maroc:    │          │
│ (72h)     │           │ Procurat° │      │ Procurat° │          │
└─────┬─────┘           └─────┬─────┘      └─────┬─────┘          │
      │                       │                  │                │
      │                       ▼                  ▼                │
      │               ┌─────────────────────────────┐             │
      │               │   Apostille + Traduction    │             │
      │               │   (légalisation documents)  │             │
      │               └───────────────┬─────────────┘             │
      │                               │                           │
      ▼                               ▼                           │
┌───────────────────────────────────────────────────────────────┐│
│              TOUS: Virer 500€ vers compte Qonto               ││
└───────────────────────────────────┬───────────────────────────┘│
                                    │                             │
                                    ▼                             │

SEMAINE 4: NOTAIRE ALLEMAGNE
──────────────────────────────────────────────────────────────────────────────

                    MEHDI + SALMA (présents physiquement)
                    BADRE + LAILA (représentés par procuration)
                              │
                              ▼
                    ┌───────────────────┐
                    │  RDV NOTAIRE      │
                    │  ────────────     │
                    │  • Vérification   │
                    │    identités      │
                    │  • Lecture        │
                    │    statuts        │
                    │  • Signatures     │
                    │  • Apostille      │
                    │    procurations   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  NOTAIRE SOUMET   │
                    │  → Handelsregister│
                    │  (2-4 semaines)   │
                    └─────────┬─────────┘
                              │
                              ▼

SEMAINE 6-7: FINALISATION
──────────────────────────────────────────────────────────────────────────────

                              │
                              ▼
                    ┌───────────────────┐
                    │  RÉCEPTION        │
                    │  Handelsregister- │
                    │  auszug (HRB xxx) │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │ Mehdi:        │ │ Mehdi:        │ │ Mehdi:        │
    │ Finaliser     │ │ Gewerbean-    │ │ Demander      │
    │ Qonto         │ │ meldung       │ │ USt-IdNr      │
    └───────────────┘ └───────────────┘ └───────────────┘
```

---

## 2. Workflow Activation Stripe

```
════════════════════════════════════════════════════════════════════════════════
                         ACTIVATION STRIPE
════════════════════════════════════════════════════════════════════════════════

PRÉ-REQUIS (à avoir avant de commencer):
────────────────────────────────────────
 ✓ Handelsregisterauszug (extrait registre)
 ✓ USt-IdNr (numéro TVA) - optionnel mais recommandé
 ✓ Compte Qonto finalisé avec IBAN
 ✓ Pièce d'identité du gérant (Mehdi)

ÉTAPE 1: CRÉATION COMPTE
─────────────────────────

    BADRE                              MEHDI
    ─────                              ─────
      │                                  │
      ▼                                  │
┌───────────────┐                        │
│ Créer compte  │                        │
│ Stripe        │                        │
│ (test mode)   │                        │
└───────┬───────┘                        │
        │                                │
        ▼                                │
┌───────────────┐                        │
│ Configurer    │                        │
│ produits:     │                        │
│ • Premium     │                        │
│   5€/mois     │                        │
│ • Pro 10€/mois│                        │
│ • Annuels     │                        │
└───────┬───────┘                        │
        │                                │
        ▼                                ▼

ÉTAPE 2: KYC (Know Your Customer)
─────────────────────────────────

┌─────────────────────────────────────────────────────────────────────────────┐
│                        STRIPE DEMANDE:                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Informations entreprise                                                  │
│     • Nom: NutriProfile UG (haftungsbeschränkt)                             │
│     • Adresse siège: [adresse Allemagne]                                    │
│     • Numéro registre: HRB xxxxx                                            │
│     • USt-IdNr: DE xxxxxxxxx                                                │
│                                                                              │
│  2. Bénéficiaires effectifs (UBO)                                           │
│     • Badre Zouiri - 25% - Passeport marocain                               │
│     • Laila Mokhliss - 25% - Passeport marocain                             │
│     • Mehdi Mokhliss - 25% - Pièce ID allemande                             │
│     • Salma - 25% - Pièce ID allemande                                      │
│                                                                              │
│  3. Représentant légal                                                       │
│     • Mehdi Mokhliss - Geschäftsführer                                      │
│     • Pièce d'identité + selfie                                             │
│                                                                              │
│  4. Coordonnées bancaires                                                    │
│     • IBAN Qonto: DE xx xxxx xxxx xxxx xxxx xx                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

        │
        ▼ (2-5 jours ouvrés)

ÉTAPE 3: ACTIVATION PRODUCTION
──────────────────────────────

    BADRE
    ─────
      │
      ▼
┌───────────────┐
│ Validation    │
│ Stripe OK ✓   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Basculer en   │
│ mode LIVE     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Configurer    │
│ webhooks      │
│ production    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Test achat    │
│ réel (1€)     │
└───────────────┘

```

---

## 3. Workflow Lancement Marketing

```
════════════════════════════════════════════════════════════════════════════════
                         LANCEMENT CAMPAGNES
════════════════════════════════════════════════════════════════════════════════

SEMAINE 9 (Mi-Mars): PRÉPARATION
────────────────────────────────

    SALMA                      LAILA                     BADRE
    ─────                      ─────                     ─────
      │                          │                         │
      ▼                          ▼                         │
┌───────────────┐         ┌───────────────┐               │
│ Créer compte  │         │ Rédiger       │               │
│ Meta Business │         │ 4 articles    │               │
│ Manager       │         │ SEO (FR)      │               │
└───────┬───────┘         └───────┬───────┘               │
        │                         │                        │
        ▼                         │                        │
┌───────────────┐                 │                        │
│ Installer     │                 │                        │
│ Pixel Meta    │◄────────────────┼────────────────────────┤
│ sur site      │    (Badre intègre le pixel)             │
└───────┬───────┘                 │                        │
        │                         │                        │
        ▼                         ▼                        │
┌───────────────┐         ┌───────────────┐               │
│ Créer         │         │ Publier       │               │
│ audiences:    │         │ articles      │               │
│ • FR 25-45    │         │ sur blog      │               │
│ • DE 25-45    │         │               │               │
│ • Fitness     │         │               │               │
│ • Nutrition   │         │               │               │
└───────┬───────┘         └───────────────┘               │
        │                                                  │
        ▼                                                  │

JOUR J (15 Mars): LANCEMENT
───────────────────────────

┌─────────────────────────────────────────────────────────────────────────────┐
│                        CHECKLIST PRÉ-LANCEMENT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✓ Stripe mode production activé                                             │
│  ✓ Pixel Meta installé et testé                                             │
│  ✓ Audiences créées (FR + DE)                                               │
│  ✓ 10 créatifs prêts (images + vidéos)                                      │
│  ✓ Landing page optimisée                                                   │
│  ✓ Budget validé par Mehdi (20€/jour)                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    SALMA                                    MEHDI
    ─────                                    ─────
      │                                        │
      ▼                                        ▼
┌───────────────┐                      ┌───────────────┐
│ Lancer        │                      │ Valider       │
│ campagnes:    │                      │ budget        │
│ • Meta FR     │                      │ 20€/jour      │
│ • Meta DE     │                      │ = 600€/mois   │
└───────┬───────┘                      └───────────────┘
        │
        ▼

SEMAINE 10-11: OPTIMISATION
───────────────────────────

            JOUR 1-7                    JOUR 8-14
            ────────                    ─────────
               │                           │
               ▼                           ▼
        ┌─────────────┐            ┌─────────────┐
        │ Collecter   │            │ Analyser    │
        │ données     │───────────►│ performances│
        │ (500+ impr.)│            │             │
        └─────────────┘            └──────┬──────┘
                                          │
                       ┌──────────────────┼──────────────────┐
                       ▼                  ▼                  ▼
                ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
                │ CPM > 15€ ? │   │ CTR < 1% ?  │   │ CPA > 15€ ? │
                │ → Changer   │   │ → Changer   │   │ → Revoir    │
                │   audience  │   │   créatifs  │   │   landing   │
                └─────────────┘   └─────────────┘   └─────────────┘

```

---

## 4. Workflow Décisions

```
════════════════════════════════════════════════════════════════════════════════
                         PROCESSUS DE DÉCISION
════════════════════════════════════════════════════════════════════════════════

DÉCISION < 500€
───────────────

    ┌─────────────────────────────────────────────────────────────────────────┐
    │  Responsable du domaine DÉCIDE SEUL                                      │
    │                                                                          │
    │  Technique (Badre) │ Marketing (Salma) │ Finance/Admin (Mehdi)          │
    └─────────────────────────────────────────────────────────────────────────┘

    Exemple: Acheter un plugin 50€ → Badre décide seul
    Exemple: Budget créatif 200€ → Salma décide seule

DÉCISION 500€ - 5.000€
──────────────────────

    ┌─────────────────────────────────────────────────────────────────────────┐
    │  2 ASSOCIÉS MINIMUM doivent valider                                      │
    │                                                                          │
    │  Tech: Badre + 1 │ Marketing: Salma + 1 │ Finance: Mehdi + 1            │
    └─────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   PROPOSITION   │
                         │   (par email)   │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │ Responsable   │           │ 2ème associé  │
            │ domaine       │           │ (consulté)    │
            │ ✓ APPROUVE    │           │ ✓ APPROUVE    │
            └───────┬───────┘           └───────┬───────┘
                    │                           │
                    └───────────┬───────────────┘
                                ▼
                        ┌───────────────┐
                        │   EXÉCUTION   │
                        └───────────────┘

DÉCISION > 5.000€
─────────────────

    ┌─────────────────────────────────────────────────────────────────────────┐
    │  UNANIMITÉ des 4 ASSOCIÉS requise                                        │
    │                                                                          │
    │  Badre ✓ + Laila ✓ + Mehdi ✓ + Salma ✓                                  │
    └─────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   PROPOSITION   │
                         │   (réunion)     │
                         └────────┬────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
            ▼                     ▼                     ▼
    ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
    │   DISCUSSION  │     │     VOTE      │     │   DÉCISION    │
    │   (48h min)   │────►│  (unanimité)  │────►│   FINALE      │
    └───────────────┘     └───────────────┘     └───────────────┘

EN CAS DE BLOCAGE (égalité 2-2)
───────────────────────────────

                         ┌─────────────────┐
                         │    BLOCAGE      │
                         │    DÉTECTÉ      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Médiation      │
                         │  interne (7j)   │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │   RÉSOLU?     │           │   NON RÉSOLU  │
            │   → Exécuter  │           │   → Médiateur │
            │               │           │     externe   │
            └───────────────┘           └───────────────┘

```

---

## 5. Workflow Réunion Hebdomadaire

```
════════════════════════════════════════════════════════════════════════════════
                         RÉUNION HEBDO (Lundi 18h CET)
════════════════════════════════════════════════════════════════════════════════

AVANT LA RÉUNION (Dimanche soir)
────────────────────────────────

    Chaque membre prépare:
    ┌─────────────────────────────────────────────────────────────────────────┐
    │  • Résumé de la semaine (3 bullet points max)                           │
    │  • Blocages rencontrés                                                  │
    │  • Décisions à prendre                                                  │
    │  • Objectifs semaine suivante                                           │
    └─────────────────────────────────────────────────────────────────────────┘

DÉROULÉ (60 minutes)
────────────────────

    00:00 ───────────────────────────────────────────────────────────── 05:00
           │                                                           │
           │  TOUR DE TABLE: Ce qui s'est passé                        │
           │  Badre (2min) → Mehdi (2min) → Salma (2min) → Laila (2min)│
           │                                                           │
    05:00 ───────────────────────────────────────────────────────────── 15:00
           │                                                           │
           │  KPIs DE LA SEMAINE                                       │
           │  • Utilisateurs (Badre)                                   │
           │  • Conversions (Salma)                                    │
           │  • Revenus (Mehdi)                                        │
           │  • Engagement (Laila)                                     │
           │                                                           │
    15:00 ───────────────────────────────────────────────────────────── 40:00
           │                                                           │
           │  BLOCAGES ET DÉCISIONS                                    │
           │  • Problèmes identifiés                                   │
           │  • Solutions proposées                                    │
           │  • Votes si nécessaire                                    │
           │                                                           │
    40:00 ───────────────────────────────────────────────────────────── 55:00
           │                                                           │
           │  OBJECTIFS SEMAINE SUIVANTE                               │
           │  • Badre: [tâches tech]                                   │
           │  • Mehdi: [tâches admin]                                  │
           │  • Salma: [tâches marketing]                              │
           │  • Laila: [tâches contenu]                                │
           │                                                           │
    55:00 ───────────────────────────────────────────────────────────── 60:00
           │                                                           │
           │  WRAP-UP                                                  │
           │  • Résumé décisions                                       │
           │  • Prochaine réunion                                      │
           │                                                           │

APRÈS LA RÉUNION
────────────────

    MEHDI (ou tournant):
    ┌─────────────────────────────────────────────────────────────────────────┐
    │  • Rédiger compte-rendu (Notion)                                        │
    │  • Envoyer sur Slack #minutes                                           │
    │  • Créer tâches dans Notion/Trello                                      │
    └─────────────────────────────────────────────────────────────────────────┘

```

---

## 6. Workflow Support Client

```
════════════════════════════════════════════════════════════════════════════════
                         GESTION SUPPORT CLIENT
════════════════════════════════════════════════════════════════════════════════

                         ┌─────────────────┐
                         │   TICKET        │
                         │   ENTRANT       │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │   FRANÇAIS    │           │   ALLEMAND    │
            │   ANGLAIS     │           │   ou AUTRE    │
            └───────┬───────┘           └───────┬───────┘
                    │                           │
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │    LAILA      │           │    SALMA      │
            │   (Niveau 1)  │           │   (Niveau 1)  │
            └───────┬───────┘           └───────┬───────┘
                    │                           │
                    │    ┌─────────────────┐    │
                    └───►│   RÉSOLU?       │◄───┘
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │     OUI       │           │     NON       │
            │  → Clôturer   │           │  → Escalader  │
            └───────────────┘           └───────┬───────┘
                                                │
                                  ┌─────────────┴─────────────┐
                                  ▼                           ▼
                          ┌───────────────┐           ┌───────────────┐
                          │   TECHNIQUE   │           │   BUSINESS    │
                          │   → BADRE     │           │   → MEHDI     │
                          │   (Niveau 2)  │           │   (Niveau 2)  │
                          └───────────────┘           └───────────────┘

SLA (Service Level Agreement)
─────────────────────────────

    ┌─────────────────────────────────────────────────────────────────────────┐
    │  Priorité       │ Première réponse │ Résolution      │ Responsable      │
    ├─────────────────────────────────────────────────────────────────────────┤
    │  Critique       │ 2h               │ 24h             │ Badre            │
    │  (bug bloquant) │                  │                 │                  │
    ├─────────────────────────────────────────────────────────────────────────┤
    │  Haute          │ 4h               │ 48h             │ Badre/Mehdi      │
    │  (paiement)     │                  │                 │                  │
    ├─────────────────────────────────────────────────────────────────────────┤
    │  Normale        │ 24h              │ 72h             │ Laila/Salma      │
    │  (questions)    │                  │                 │                  │
    ├─────────────────────────────────────────────────────────────────────────┤
    │  Basse          │ 48h              │ 1 semaine       │ Laila/Salma      │
    │  (suggestions)  │                  │                 │                  │
    └─────────────────────────────────────────────────────────────────────────┘

```

---

## 7. Workflow Déploiement

```
════════════════════════════════════════════════════════════════════════════════
                         DÉPLOIEMENT EN PRODUCTION
════════════════════════════════════════════════════════════════════════════════

                    BADRE (seul autorisé à déployer)
                    ────────────────────────────────
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │  1. TESTS LOCAUX            │
                    │     npm test                │
                    │     pytest                  │
                    └─────────────┬───────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │  2. COMMIT + PUSH           │
                    │     git push origin main    │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │   FRONTEND    │           │   BACKEND     │
            │   Cloudflare  │           │   Fly.io      │
            │   (auto)      │           │   (manuel)    │
            └───────┬───────┘           └───────┬───────┘
                    │                           │
                    │                           ▼
                    │               ┌───────────────────┐
                    │               │  fly deploy       │
                    │               │  -c backend/      │
                    │               │  fly.toml         │
                    │               └─────────┬─────────┘
                    │                         │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────────┐
                    │  3. VÉRIFICATION            │
                    │     • Health check OK       │
                    │     • Logs sans erreur      │
                    │     • Test fonctionnel      │
                    └─────────────┬───────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │  4. NOTIFICATION ÉQUIPE     │
                    │     Slack #deployments      │
                    └─────────────────────────────┘

EN CAS DE PROBLÈME
──────────────────

                    ┌─────────────────────────────┐
                    │  ERREUR DÉTECTÉE            │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │   MINEURE     │           │   CRITIQUE    │
            │   → Fix       │           │   → ROLLBACK  │
            │   forward     │           │   immédiat    │
            └───────────────┘           └───────┬───────┘
                                                │
                                                ▼
                                ┌───────────────────────────┐
                                │  fly deploy --image       │
                                │  [previous-version]       │
                                └───────────────────────────┘

```

---

## Checklist Workflows

### Avant Création UG
- [ ] Steuerberater choisi
- [ ] Procurations prêtes (Badre + Laila)
- [ ] Compte Qonto ouvert
- [ ] Capital viré (4×500€)

### Avant Lancement Marketing
- [ ] Stripe en production
- [ ] Pixel Meta installé
- [ ] Audiences créées
- [ ] Budget validé

### Chaque Semaine
- [ ] Réunion hebdo tenue
- [ ] KPIs mis à jour
- [ ] Compte-rendu envoyé
- [ ] Tâches assignées

---

*Document préparé le 15 Janvier 2026*
