# Analyse des Risques Légaux et Réglementaires - NutriProfile 2026

**Date d'analyse**: Janvier 2026
**Marchés cibles**: France, Belgique, Suisse, Maroc
**Type d'application**: Wellness nutrition (non dispositif médical)
**Modèle économique**: Freemium SaaS (Free/Premium 5€/Pro 10€)

---

## Executive Summary

NutriProfile présente **des risques réglementaires globalement modérés** avec quelques points critiques à adresser immédiatement. L'application se positionne dans la catégorie "wellness/lifestyle" et non "dispositif médical", ce qui simplifie considérablement les obligations réglementaires. Les principaux risques identifiés concernent:

1. **RGPD données santé** (RISQUE CRITIQUE) - Nécessite consentement explicite et mesures techniques renforcées
2. **CGU/CGV/Mentions légales** (RISQUE CRITIQUE) - Documentation juridique manquante
3. **Cookies et consentement** (RISQUE MOYEN) - Bannière conforme CNIL requise
4. **Allégations santé interdites** (RISQUE MOYEN) - Surveillance du wording marketing

**Éléments positifs**:
- ✅ Lemon Squeezy gère la TVA européenne automatiquement
- ✅ Pas de classification dispositif médical
- ✅ Pas de DPO obligatoire pour la taille actuelle
- ✅ Assurance RC Pro non obligatoire (mais recommandée)

---

## 1. Réglementation Apps Nutrition Europe/France

### 1.1 Classification Dispositif Médical

**Statut**: ✅ **NON DISPOSITIF MÉDICAL**

#### Réglementation applicable
- **EU MDR 2017/745** (Medical Device Regulation)
- **ANSM** (Agence Nationale de Sécurité du Médicament) pour la France

#### Critères de classification

Selon l'ANSM et le MDCG 2019-11, **NutriProfile n'est PAS un dispositif médical** car:

| Critère | NutriProfile | Dispositif Médical |
|---------|--------------|-------------------|
| Objectif | Optimiser l'équilibre nutritionnel, gestion du poids | Diagnostiquer, traiter, surveiller une pathologie |
| Conseils | Nutritionnels généraux | Médicaux spécifiques (ex: dose d'insuline) |
| Portée | Lifestyle & wellness | Décision médicale |
| Calculs | Calories, macros, BMR/TDEE | Dosage médicament, résultats cliniques |

**Exemples d'apps wellness (comme NutriProfile)**:
- Suivi nutrition pour gérer le poids ❌ PAS dispositif médical
- Calcul calories et macronutriments ❌ PAS dispositif médical
- Recommandations recettes IA ❌ PAS dispositif médical

**Exemples d'apps dispositif médical**:
- Calcul dose d'insuline pour diabétique ✅ Dispositif médical
- Diagnostic pathologie nutritionnelle ✅ Dispositif médical
- Surveillance médicale prescrite ✅ Dispositif médical

#### Obligations évitées grâce au statut wellness
- ❌ Certification CE Mark
- ❌ Enregistrement ANSM
- ❌ Études cliniques
- ❌ Surveillance post-marché MDR
- ❌ Notified Body (organisme certificateur)

### 1.2 Risques et Actions

| Niveau de Risque | Description | Action Corrective PRD |
|-----------------|-------------|----------------------|
| 🟢 **FAIBLE** | Classification dispositif médical | ✅ Maintenir disclaimer "non médical" visible<br>✅ Éviter tout vocabulaire médical (diagnostic, traitement, thérapie)<br>✅ Recommander consultation professionnelle santé |

**Sources**:
- [NAMSA - EU MDR and IVDR: Classifying Medical Device Software](https://namsa.com/resources/blog/eu-mdr-and-ivdr-classifying-medical-device-software-mdsw/)
- [ANSM - Le logiciel ou l'application santé relève-t-il du statut de dispositif médical](https://ansm.sante.fr/documents/reference/le-logiciel-ou-lapplication-sante-que-je-vais-mettre-sur-le-marche-releve-t-il-du-statut-de-dispositif-medical-dm-ou-de-dispositif-medical-de-diagnostic-in-vitro-dm-div)
- [Decomplix - Classification of Medical Devices Under EU MDR](https://decomplix.com/medical-device-classification-eu-mdr/)

---

## 2. RGPD Données Santé

### 2.1 Article 9 - Données Sensibles

**Statut**: 🔴 **RISQUE CRITIQUE**

#### Données collectées par NutriProfile

| Type de donnée | Classification Article 9 RGPD | Justification |
|----------------|-------------------------------|---------------|
| Poids, taille, âge | 🟡 **Données santé potentielles** | Peuvent révéler état de santé |
| Calories, macros | 🟡 **Données santé potentielles** | Liées au métabolisme |
| Photos repas | 🟢 **Données personnelles** | Sauf si révèlent pathologie alimentaire |
| Objectifs (perte/prise poids) | 🟡 **Données santé potentielles** | Indiquent préoccupation santé |
| Allergies alimentaires | 🔴 **DONNÉES SANTÉ** | Explicitement mentionné par CNIL |
| Activité physique | 🟡 **Données santé potentielles** | Selon contexte (rééducation = santé) |
| Conditions médicales (diabète, etc.) | 🔴 **DONNÉES SANTÉ** | Sans ambiguïté |
| Médicaments | 🔴 **DONNÉES SANTÉ** | Sans ambiguïté |

**Interprétation prudente**: Considérer l'ensemble des données de NutriProfile comme **données santé Article 9 RGPD**.

#### Obligations légales

##### Consentement explicite obligatoire

**Critères du consentement valide** (Article 9.2.a RGPD):
- ✅ **Libre** - Sans contrainte, l'utilisateur peut refuser
- ✅ **Spécifique** - Par finalité distincte
- ✅ **Éclairé** - Information claire sur usage des données
- ✅ **Univoque** - Action positive claire (case à cocher non pré-cochée)
- ✅ **Révocable** - Retrait simple à tout moment

**Interdit**:
- ❌ Case pré-cochée
- ❌ Silence ou inaction
- ❌ Consentement global non différencié
- ❌ Consentement conditionnel à l'accès au service (sauf si nécessaire au fonctionnement)

##### Double base juridique requise

Selon l'Article 9 RGPD, il faut **cumuler**:
1. **Base juridique Article 6 RGPD** - Ex: Consentement, exécution contrat, intérêt légitime
2. **Dérogation Article 9 RGPD** - Ex: Consentement explicite aux données sensibles

**Pour NutriProfile**, la combinaison optimale:
- **Article 6.1.b** - Exécution du contrat (fourniture service nutrition)
- **Article 9.2.a** - Consentement explicite pour données santé

##### Hébergement des données de santé (HDS)

**Attention France**: La certification **HDS (Hébergeur de Données de Santé)** est obligatoire pour l'hébergement de données de santé en France.

**Nouvelle norme HDS 2026**:
- Données de santé doivent être hébergées **exclusivement dans l'EEE** (Espace Économique Européen)
- Providers HDS déjà certifiés doivent se conformer aux nouvelles normes **avant le 16 mai 2026**

**État actuel NutriProfile**:
- Backend: Fly.io (région CDG = Paris) ✅ Conforme EEE
- Base de données: Fly Postgres (Paris) ✅ Conforme EEE

**Action requise**:
- Vérifier si Fly.io possède certification HDS
- Si non, migration vers hébergeur HDS certifié **obligatoire**
- Alternative: Utiliser OVHcloud, Scaleway, ou autre provider français HDS

### 2.2 DPO (Délégué à la Protection des Données)

**Statut**: 🟢 **NON OBLIGATOIRE** (pour l'instant)

#### Critères d'obligation DPO

Le DPO est **obligatoire** dans 3 cas uniquement:
1. **Autorités publiques** (non applicable)
2. **Suivi régulier et systématique à grande échelle** - Ex: géolocalisation continue, vidéosurveillance massive
3. **Traitement à grande échelle de données sensibles** - Données santé ou condamnations pénales

**NutriProfile actuel**:
- Volume d'utilisateurs: < 2000 estimé
- Traitement données santé: OUI
- À grande échelle: **NON** (pas de seuil précis RGPD, mais TPE/PME généralement exemptées)

**Seuil "grande échelle" non défini par RGPD**, mais critères indicatifs:
- Nombre de personnes concernées
- Volume de données traitées
- Durée de conservation
- Portée géographique

**Recommandation forte**: Même non obligatoire, **désigner un référent RGPD interne** (peut être le fondateur) chargé de:
- Tenir registre des traitements
- Gérer les demandes d'exercice de droits
- Coordonner analyses d'impact (DPIA)
- Assurer veille réglementaire

**Sanctions si DPO non nommé quand obligatoire**:
- Amende administrative jusqu'à **10 millions €** ou **2% CA annuel mondial**

### 2.3 Transferts de Données Hors UE

**Statut**: 🟠 **RISQUE MOYEN**

#### Hugging Face (USA)

NutriProfile utilise l'API Hugging Face (hébergée aux USA) pour:
- Vision IA (BLIP-2, LLaVA)
- Génération recettes (Mistral, Llama, Mixtral)
- Coaching IA

**Données transférées**:
- Photos repas (base64)
- Texte ingrédients
- Profil utilisateur (anonymisé ou pseudonymisé recommandé)

#### EU-US Data Privacy Framework

**Statut 2026**: ✅ Décision d'adéquation UE-USA en vigueur depuis le 10 juillet 2023

**Conditions de validité**:
1. Vérifier que **Hugging Face est certifié** sous le Data Privacy Framework
2. Consulter la liste officielle sur le site du **US Department of Commerce**
3. Si Hugging Face **n'est PAS certifié**, utiliser **Standard Contractual Clauses (SCCs)**

**Action corrective urgente**:
- ✅ Vérifier certification Hugging Face sur [https://www.dataprivacyframework.gov/s/participant-search](https://www.dataprivacyframework.gov/s/participant-search)
- Si non certifié: Signer SCCs avec Hugging Face OU migrer vers provider EU (ex: EU-hosted inference)

**Risque d'invalidation 2026**: Le Data Privacy Framework fait face à des contestations similaires aux anciens Safe Harbor et Privacy Shield. Une invalidation par la CJUE est possible en 2026-2027.

**Plan de continuité recommandé**:
- Identifier alternatives européennes (ex: Scaleway, OVHcloud AI endpoints)
- Préparer migration rapide en cas d'invalidation

### 2.4 Risques et Actions

| Niveau de Risque | Description | Action Corrective PRD | Priorité |
|-----------------|-------------|-----------------------|----------|
| 🔴 **CRITIQUE** | Consentement explicite Article 9 manquant | ✅ Implémenter modal consentement explicite à l'onboarding<br>✅ Séparer consentement CGU et consentement données santé<br>✅ Permettre refus (avec limitation fonctionnalités)<br>✅ Ajouter page révocation simple dans Settings | **P0** |
| 🔴 **CRITIQUE** | Hébergement données santé (HDS) | ✅ Vérifier certification HDS de Fly.io<br>✅ Si non certifié: Migrer vers OVHcloud/Scaleway/autre HDS avant mai 2026 | **P0** |
| 🟠 **MOYEN** | Transfert Hugging Face USA | ✅ Vérifier certification Data Privacy Framework<br>✅ Signer SCCs si non certifié<br>✅ Préparer alternative EU | **P1** |
| 🟢 **FAIBLE** | DPO non obligatoire mais recommandé | ✅ Désigner référent RGPD interne<br>✅ Documenter registre traitements<br>✅ Créer procédure demandes utilisateurs | **P2** |

**Sanction CNIL récente**:
- 26 septembre 2024: Entreprise TELEMAQUE sanctionnée **150,000€** pour violation Article 9 RGPD (données santé sans consentement explicite)

**Sources**:
- [CNIL - Quelles formalités pour les traitements de données de santé](https://www.cnil.fr/fr/quelles-formalites-pour-les-traitements-de-donnees-de-sante)
- [MonExpertRGPD - Article 9 du RGPD : Données Sensibles](https://monexpertrgpd.com/article-9/)
- [CNIL - Adéquation des États-Unis : les premières questions-réponses](https://www.cnil.fr/fr/adequation-des-etats-unis-les-premieres-questions-reponses)
- [LegalStart - DPO (Délégué à la Protection des Données) : le guide 2026](https://www.legalstart.fr/fiches-pratiques/rgpd/dpo/)

---

## 3. Responsabilité Légale

### 3.1 Disclaimer Wellness

**Statut**: 🟠 **RISQUE MOYEN**

#### Disclaimer obligatoire

**Objectif**: Se protéger contre les réclamations d'utilisateurs suite à des conseils nutritionnels automatisés.

**Contenu minimal du disclaimer**:
```
NutriProfile est une application de bien-être et de suivi nutritionnel.
Elle ne constitue PAS un dispositif médical et ne remplace PAS l'avis
d'un professionnel de santé qualifié.

Les informations fournies (calculs nutritionnels, recettes, conseils du
coach IA) sont à titre informatif uniquement et ne doivent pas être
interprétées comme des recommandations médicales, diagnostics ou
traitements.

Consultez toujours un médecin, nutritionniste ou diététicien avant de
modifier votre régime alimentaire, particulièrement si vous souffrez de
conditions médicales (diabète, allergies sévères, troubles alimentaires)
ou prenez des médicaments.

NutriProfile décline toute responsabilité en cas d'usage inapproprié de
l'application ou de décisions prises sur la base des informations fournies.
```

**Emplacements obligatoires**:
- ✅ Page d'accueil (visible)
- ✅ CGU (section dédiée)
- ✅ Footer de l'application
- ✅ Email de bienvenue
- ✅ Avant première utilisation des features clés (Vision, Recettes, Coach)

#### Jurisprudence apps santé/nutrition

**MyFitnessPal** (Mai 2025):
- Procès pour **tracking utilisateurs sans consentement** malgré opt-out cookie
- Allégation: Partage données avec tiers à fins publicitaires
- Statut: En cours

**YAZIO**:
- Collecte orientation sexuelle (données sensibles Article 9)
- Partage 3 types de données avec tiers publicitaires
- Risque: Non-conformité RGPD si consentement invalide

**Leçons pour NutriProfile**:
1. Ne JAMAIS partager données utilisateurs avec tiers sans consentement explicite
2. Limiter collecte données au strict nécessaire
3. Bannière cookies conforme (voir section 5)
4. Transparence totale sur usage données

### 3.2 Assurance Responsabilité Civile Professionnelle

**Statut**: 🟡 **NON OBLIGATOIRE** (mais recommandée)

#### Cadre légal

L'assurance RC Pro est **obligatoire** uniquement pour:
- Professions réglementées (BTP, santé, droit, transport)
- SASU/SAS exerçant activités réglementées

**Le développement SaaS nutrition wellness n'est PAS une profession réglementée** en France.

#### Recommandation forte

Malgré l'absence d'obligation légale, la RC Pro est **fortement recommandée** car:
- Clients/partenaires peuvent l'exiger contractuellement
- Protection contre litiges utilisateurs (ex: allergie non détectée, calcul erroné)
- Couverture panne hébergement, défaillance service
- Coût modéré pour startups (300-800€/an pour TPE)

**Couvertures spécifiques SaaS** (contrats Tech360):
- Panne hébergement/Cloud
- Erreurs de code entraînant préjudice
- Fuite de données clients
- Interruption de service prolongée

**Action recommandée**: Souscrire RC Pro dès 500+ utilisateurs actifs ou premier contrat B2B.

### 3.3 Risques et Actions

| Niveau de Risque | Description | Action Corrective PRD | Priorité |
|-----------------|-------------|-----------------------|----------|
| 🟠 **MOYEN** | Absence disclaimer visible | ✅ Ajouter disclaimer sur HomePage, Dashboard, et avant features clés<br>✅ Intégrer section disclaimer dans CGU<br>✅ Popup premier lancement avec acceptation explicite | **P1** |
| 🟢 **FAIBLE** | Assurance RC Pro non souscrite | ✅ Souscrire RC Pro avant 500 users ou premier contrat B2B<br>✅ Budget: 500-800€/an | **P2** |

**Sources**:
- [ICLG - Digital Health Laws and Regulations France 2025-2026](https://iclg.com/practice-areas/digital-health-laws-and-regulations/france)
- [CMS Law - Legal Guide: Digital Health Apps & Telemedicine in France](https://cms.law/en/int/expert-guides/cms-expert-guide-to-digital-health-apps-and-telemedicine/france)
- [OnlyNNov - Assurance dédiée aux éditeurs de logiciel](https://onlynnov.com/assurance-editeur-de-logiciel/)

---

## 4. Paiements & Fiscalité

### 4.1 Lemon Squeezy - Merchant of Record

**Statut**: ✅ **CONFORMITÉ EXCELLENTE**

#### Responsabilités assumées par Lemon Squeezy

En tant que **Merchant of Record**, Lemon Squeezy gère:

| Responsabilité | Qui est redevable | Couverture Lemon Squeezy |
|----------------|-------------------|--------------------------|
| Collecte TVA | ✅ Lemon Squeezy | Automatique dans 135+ pays |
| Déclaration TVA | ✅ Lemon Squeezy | Auprès de toutes autorités fiscales UE |
| Paiement TVA | ✅ Lemon Squeezy | Remise aux autorités compétentes |
| Amendes/pénalités fiscales | ✅ Lemon Squeezy | Responsabilité totale |
| Fraude paiement | ✅ Lemon Squeezy | Risque assumé |
| Litiges post-vente | ✅ Lemon Squeezy | Gestion complète |
| Remboursements | ✅ Lemon Squeezy | Traitement automatique |
| Compliance PCI-DSS | ✅ Lemon Squeezy | Certification intégrée |

**Avantage majeur**: Le développeur (auto-entrepreneur marocain) n'a **AUCUNE responsabilité fiscale** envers les autorités européennes.

#### TVA Europe

**Taux TVA 2026** (gérés automatiquement):
- France: 20%
- Belgique: 21%
- Suisse: 8.1% (hors UE mais supporté)
- Maroc: Non applicable (export)

**Calcul TVA**:
- Prix TTC affiché = Prix HT + TVA du pays client
- Lemon Squeezy reverse la part HT au vendeur
- Lemon Squeezy conserve et reverse la TVA

**Exemple**:
- Premium 5€/mois en France
- Client paie: 5€ TTC
- Vous recevez: 5€ - frais LS (5% + 0.50$) - TVA (0.83€)
- Vous recevez net: ~3.57€

### 4.2 Fiscalité Auto-Entrepreneur Maroc → Europe

**Statut**: ✅ **LÉGAL ET OPTIMISÉ**

#### Régime fiscal marocain 2026

**Auto-entrepreneur au Maroc**:
- Seuil: 200,000 MAD/an pour services (~18,000€)
- Taux impôt: **1% du CA** (ultra-avantageux)
- TVA: **Exemption totale** pour auto-entrepreneurs
- Export: **Exonération complète** (ventes hors Maroc)

**Avantage compétitif majeur**:
```
CA annuel NutriProfile: 10,000€ (objectif Y1)
Impôt Maroc: 10,000€ × 1% = 100€
Impôt France équivalent: 10,000€ × 22% = 2,200€ (micro-BNC)

Économie fiscale: 2,100€/an
```

#### Déclaration fiscale

**Obligations au Maroc**:
1. Déclarer CA trimestriellement
2. Payer 1% du CA mensuel/trimestriel
3. Services en ligne exempts de TVA à l'export (à déclarer)

**Obligations en Europe**: ❌ **AUCUNE** (Lemon Squeezy = Merchant of Record)

**Important**: Conserver factures/reçus Lemon Squeezy comme justificatifs de revenus.

### 4.3 Lemon Squeezy & Maroc

**Statut**: ✅ **SUPPORTÉ**

**Paiements reçus**:
- Lemon Squeezy supporte **135+ pays** pour vendeurs
- Maroc inclus dans la liste
- Virement bancaire international (SWIFT) ou PayPal
- Délai: 2 semaines après fin de mois

**Frais Lemon Squeezy**:
- Commission: **5% + 0.50$ par transaction**
- TVA européenne incluse dans le calcul
- Aucun frais setup ou abonnement mensuel

**Calcul net réel (Premium 5€/mois en France)**:
```
Prix TTC client: 5.00€
TVA FR 20%: -0.83€
Prix HT: 4.17€
Frais LS 5%: -0.21€
Frais LS fixe: -0.46€ (0.50$)
Net vendeur: 3.50€
Impôt Maroc 1%: -0.05€
Net final: 3.45€
```

**Rentabilité**: Marge nette ~69% (3.45€/5€) après tous frais et taxes.

### 4.4 Risques et Actions

| Niveau de Risque | Description | Action Corrective PRD | Priorité |
|-----------------|-------------|-----------------------|----------|
| 🟢 **FAIBLE** | Compliance TVA Europe | ✅ Lemon Squeezy gère automatiquement<br>✅ Aucune action requise | **N/A** |
| 🟢 **FAIBLE** | Déclaration fiscale Maroc | ✅ Déclarer CA trimestriel<br>✅ Payer 1% impôt mensuellement<br>✅ Conserver factures LS | **P2** |
| 🟢 **FAIBLE** | Frais paiement élevés | ✅ Optimiser pricing pour absorber frais LS<br>✅ Considérer Paddle/Stripe si CA > 50K€/an | **P3** |

**Sources**:
- [Lemon Squeezy - Sales Tax and VAT Documentation](https://docs.lemonsqueezy.com/help/payments/sales-tax-vat)
- [Lemon Squeezy - Merchant of Record](https://www.lemonsqueezy.com/blog/merchant-of-record)
- [Efficienceexpertise - TVA au Maroc 2026](https://efficienceexpertise.com/tva-au-maroc-2026-5-regimes-pour-pme/)

---

## 5. Autres Risques Réglementaires

### 5.1 Allégations Santé Interdites

**Statut**: 🟠 **RISQUE MOYEN**

#### Règlement UE 1924/2006

Depuis 2007, toutes les **allégations nutritionnelles et de santé** sur les denrées alimentaires sont strictement réglementées dans l'UE.

**Objectifs**:
- Prévenir allégations inexactes, ambiguës ou trompeuses
- Garantir transparence pour consommateurs
- Promouvoir concurrence équitable

#### Procédure d'autorisation

**Principe des listes positives**:
1. Toute allégation santé doit être **scientifiquement évaluée par l'EFSA** (European Food Safety Authority)
2. Suivie d'une **autorisation formelle** publiée dans un règlement UE
3. Seules les allégations **autorisées** peuvent être utilisées

**Liste d'allégations autorisées**: Consultation sur site EFSA ou EUR-Lex

#### Allégations INTERDITES pour NutriProfile

| Allégation interdite | Risque | Alternative autorisée |
|---------------------|--------|----------------------|
| "Réduit le cholestérol" | 🔴 Allégation santé non autorisée | "Aliments riches en fibres" (si applicable) |
| "Traite le diabète" | 🔴 Allégation médicale | "Aide au suivi de votre équilibre nutritionnel" |
| "Guérit l'obésité" | 🔴 Allégation thérapeutique | "Soutient vos objectifs de gestion du poids" |
| "Renforce le système immunitaire" | 🟠 Selon formulation | "Source de vitamine C" (si calculé) |
| "Détox" | 🔴 Aucune base scientifique reconnue UE | "Hydratation" |
| "Brûle-graisses" | 🔴 Allégation trompeuse | "Faible en calories" |
| "Prévient les maladies cardiaques" | 🔴 Allégation santé non autorisée | "Pauvre en graisses saturées" |

#### Publicité trompeuse

**DGCCRF (Direction Générale de la Concurrence, de la Consommation et de la Répression des Fraudes)** contrôle régulièrement les apps nutrition.

**Enquête 2024**: La DGCCRF a relevé que la réglementation sur les allégations est **encore trop souvent méconnue**, particulièrement pour les compléments alimentaires vendus en ligne.

**Sanctions**:
- Amende administrative
- Retrait forcé de l'allégation
- Interdiction de commercialisation dans cas graves

#### Wording sécurisé pour NutriProfile

**✅ Formulations autorisées**:
- "Suivez votre équilibre nutritionnel"
- "Atteignez vos objectifs de bien-être"
- "Gérez votre apport calorique"
- "Planifiez des repas équilibrés"
- "Source de protéines" (si calcul exact)
- "Faible en sucres" (si critères UE respectés)

**❌ Formulations à éviter**:
- Toute mention de maladie/pathologie
- Termes médicaux (traiter, guérir, diagnostiquer, prévenir)
- Promesses de résultats santé ("réduit le risque de...", "améliore la santé...")
- Superlatifs exagérés ("meilleur", "révolutionnaire", "miraculeux")

### 5.2 Cookies et Consentement CNIL

**Statut**: 🟠 **RISQUE MOYEN**

#### Nouvelles recommandations CNIL 2026

En 2026, la CNIL a publié ses **recommandations finales sur le consentement multi-terminaux** (cross-device).

**Principe**: Si l'utilisateur peut donner son consentement en une seule fois pour plusieurs appareils (via compte connecté), il doit pouvoir **refuser ou retirer** avec la même simplicité.

#### Traceurs concernés

**Obligatoirement soumis au consentement**:
- Cookies publicitaires
- Cookies analytics (sauf mesure anonyme conforme CNIL)
- Traceurs réseaux sociaux (Facebook Pixel, etc.)
- Traceurs cross-site

**Exemptés de consentement**:
- Cookies strictement nécessaires au fonctionnement (authentification, panier)
- Mesure d'audience strictement anonyme (Matomo configuré CNIL-compliant)

#### Configuration actuelle NutriProfile

**Frontend (React)**:
- Zustand store (localStorage) - ✅ Exempté (fonctionnel)
- React Query cache - ✅ Exempté (fonctionnel)
- Authentification JWT - ✅ Exempté (nécessaire)

**Analytics potentiels**:
- Si Google Analytics / PostHog / Mixpanel → ⚠️ Consentement OBLIGATOIRE
- Si Matomo auto-hébergé anonyme → ✅ Exempté (si config CNIL)

#### Bannière cookies conforme

**Critères CNIL obligatoires 2026**:
- ✅ Affichage avant dépôt de tout traceur non-exempté
- ✅ Bouton "Accepter" ET bouton "Refuser" de même visibilité (pas de dark pattern)
- ✅ Possibilité de choix granulaire (par catégorie de traceurs)
- ✅ Accès facile aux paramètres pour modifier/retirer consentement
- ✅ Pas de cookie wall (interdiction d'accès si refus) pour contenus non-payants
- ✅ Information claire sur finalités et durée de conservation

**Sanctions CNIL**:
- Exemple récent: Transmission données réseau social sans consentement → sanction significative
- Amendes proportionnelles à la gravité et CA

#### Travaux CNIL 2026

La CNIL lancera en 2026 des travaux sur le **consentement multi-propriétés** (cross-domain) pour encadrer la collecte d'un consentement unique pour plusieurs sites d'un même groupe.

### 5.3 Accessibilité Numérique RGAA

**Statut**: 🟢 **RISQUE FAIBLE**

#### Cadre légal

**RGAA** (Référentiel Général d'Amélioration de l'Accessibilité) définit **106 critères** basés sur les normes internationales **WCAG 2.1** (niveaux A et AA).

#### Obligation selon secteur

**Secteur public**: ✅ **OBLIGATOIRE**
- Administrations, collectivités, établissements publics
- Sanctions: 50,000€ par service non-conforme, renouvelable tous les 6 mois
- Amende supplémentaire: 25,000€ si déclaration d'accessibilité absente

**Secteur privé**:
- ❌ Non obligatoire pour PME < 250M€ CA (jusqu'au 28 juin 2025)
- ✅ **Obligatoire à partir du 28 juin 2025** pour grandes entreprises (CA > 250M€)

**NutriProfile (startup/TPE)**: ❌ **NON OBLIGATOIRE** en 2026

#### Recommandation best practices

Malgré l'absence d'obligation légale, respecter **l'accessibilité web** est:
- **Éthique** - 15% population en situation de handicap
- **Commercial** - Élargit l'audience potentielle
- **Technique** - Améliore SEO et performance
- **Réputationnel** - Image de marque inclusive

**Quick wins accessibilité**:
- ✅ Contraste texte/background suffisant (ratio 4.5:1)
- ✅ Navigation clavier complète (sans souris)
- ✅ Textes alternatifs sur images
- ✅ Labels sur champs formulaires
- ✅ Hiérarchie titres H1/H2/H3 logique

### 5.4 Directive E-Commerce & Vente à Distance

**Statut**: 🟠 **RISQUE MOYEN**

#### Obligation "One-Click Withdrawal" (2026)

À partir du **19 juin 2026**, tous les professionnels concluant des **contrats à distance** via interfaces en ligne doivent offrir une **fonctionnalité de rétractation en un clic**.

**Applicable à**: Tous les contrats en ligne (SaaS inclus)

**Action requise pour NutriProfile**:
- ✅ Ajouter bouton "Résilier mon abonnement" dans Settings
- ✅ Processus en 1 clic (max 2 clics avec confirmation)
- ✅ Pas de justification demandée
- ✅ Email de confirmation automatique
- ✅ Résiliation effective immédiatement (ou fin période payée)

**Bon exemple flow**:
```
1. User clique "Résilier abonnement" (Settings)
2. Modal confirmation "Êtes-vous sûr ? Vous perdrez [avantages]"
3. Bouton "Confirmer résiliation"
4. Résiliation traitée + email confirmation
5. Accès maintenu jusqu'à fin période payée
```

**Sanctions non-conformité**: Amendes administratives lourdes

#### CGV/CGU Mentions Obligatoires

**Statut**: 🔴 **RISQUE CRITIQUE** - Documentation juridique actuellement **manquante**

**CGV (Conditions Générales de Vente)** - ✅ **OBLIGATOIRES** (B2C et B2B)

Mentions obligatoires selon Code de la Consommation:
- ✅ Identification vendeur (raison sociale, adresse, contact)
- ✅ Prix TTC et modalités paiement
- ✅ Délai de rétractation (14 jours UE, 7 jours Maroc)
- ✅ Garanties légales
- ✅ Modalités exécution contrat
- ✅ Durée engagement (abonnement mensuel/annuel)
- ✅ Résiliation et remboursement
- ✅ Clause de réversibilité données (CRUCIAL pour SaaS)
- ✅ Traitement données personnelles (référence Politique Confidentialité)

**Clause réversibilité SaaS** (souvent oubliée):
```
En cas de résiliation du contrat, l'Utilisateur pourra récupérer
l'ensemble de ses données personnelles au format JSON pendant une
durée de 30 jours suivant la date de résiliation effective.

Passé ce délai, les données seront définitivement supprimées
conformément à notre Politique de Conservation des Données.
```

**CGU (Conditions Générales d'Utilisation)** - ⚠️ **FORTEMENT RECOMMANDÉES**

Bien que non obligatoires légalement, les CGU sont **essentielles** pour:
- Définir règles d'usage de l'application
- Limiter responsabilité (disclaimer)
- Encadrer propriété intellectuelle
- Gérer litiges utilisateurs

**Mentions légales** - ✅ **OBLIGATOIRES**

Sanctions si absentes: **1 an prison + 75,000€ amende** (personne physique) ou **375,000€** (société)

Contenu obligatoire:
- ✅ Identité éditeur (nom, adresse)
- ✅ Directeur de publication
- ✅ Hébergeur (Fly.io + coordonnées)
- ✅ Contact (email, téléphone)
- ✅ Numéro SIRET/TVA si France (ou équivalent Maroc)

**Politique de Confidentialité (Privacy Policy)** - ✅ **OBLIGATOIRE RGPD**

Articles 13 et 14 RGPD imposent information claire sur:
- Finalités traitement
- Base juridique (consentement, contrat, etc.)
- Destinataires données
- Durée conservation
- Droits utilisateurs (accès, rectification, effacement, portabilité, opposition)
- Droit réclamation CNIL

### 5.5 Risques et Actions

| Niveau de Risque | Description | Action Corrective PRD | Priorité |
|-----------------|-------------|-----------------------|----------|
| 🟠 **MOYEN** | Allégations santé interdites | ✅ Audit complet HomePage, marketing, email<br>✅ Remplacer wording médical par wellness<br>✅ Ajouter disclaimer "non médical" systématique<br>✅ Formation équipe sur UE 1924/2006 | **P1** |
| 🟠 **MOYEN** | Bannière cookies non-conforme | ✅ Implémenter bannière CNIL-compliant<br>✅ Boutons Accept/Reject équivalents<br>✅ Paramètres cookies accessibles<br>✅ Si analytics: ajouter consentement obligatoire | **P1** |
| 🔴 **CRITIQUE** | CGV/CGU/Mentions légales absentes | ✅ Rédiger CGV SaaS complètes<br>✅ Rédiger CGU avec disclaimer<br>✅ Créer page Mentions Légales<br>✅ Rédiger Politique de Confidentialité RGPD<br>✅ Valider par avocat (optionnel mais recommandé) | **P0** |
| 🟠 **MOYEN** | One-click withdrawal manquant | ✅ Ajouter bouton "Résilier" dans Settings<br>✅ Flow 1-2 clics max<br>✅ Email confirmation automatique<br>✅ Déployer AVANT 19 juin 2026 | **P1** |
| 🟢 **FAIBLE** | Accessibilité RGAA non-conforme | ✅ Audit contrastes et navigation clavier<br>✅ Ajouter alt-texts images<br>✅ Valider formulaires accessibles<br>✅ Documentation best practices | **P2** |

**Sources**:
- [Ministère de l'Économie - Allégations nutritionnelles et de santé](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/allegations-nutritionnelles-et-de-sante-ne-vous-faites-pas-avoir)
- [EUR-Lex - Règlement UE 1924/2006](https://eur-lex.europa.eu/FR/legal-content/summary/nutrition-and-health-claims-made-on-foods.html)
- [CNIL - Cookies et autres traceurs : recommandations sur le consentement multi-terminaux](https://www.cnil.fr/fr/cookies-et-autres-traceurs-recommandations-finales-sur-le-consentement-multi-terminaux)
- [Agence WAM - Accessibilité numérique 2025](https://agence-wam.fr/blog/accessibilite-numerique-2025-nouvelles-obligations-rgaa-wcag-et-directive-europeenne/)
- [CaptainContrat - Conditions générales d'utilisation (CGU) : Exemple et Définition](https://www.captaincontrat.com/contrats-commerciaux-cgv/cgv-cgu-cga/cgu-conditions-generales-utilisation)

---

## 6. Synthèse des Risques par Criticité

### 🔴 Risques CRITIQUES (Bloquants Légalement)

| Risque | Impact | Délai Action | Effort Estimé |
|--------|--------|--------------|---------------|
| **Consentement RGPD Article 9 manquant** | Sanction CNIL jusqu'à 150K€ | **Immédiat** | 3-5 jours dev |
| **Hébergement HDS non-certifié** | Illégal si données santé (France) | **Avant 16 mai 2026** | 2-4 semaines migration |
| **CGV/CGU/Mentions légales absentes** | Amendes 75K€-375K€ | **Immédiat** | 5-10 jours rédaction |

**Action globale P0**: Sprint dédié "Compliance légale" (2 semaines) avant tout effort marketing/acquisition.

### 🟠 Risques MOYENS (Amendes Potentielles)

| Risque | Impact | Délai Action | Effort Estimé |
|--------|--------|--------------|---------------|
| **Disclaimer wellness insuffisant** | Litiges utilisateurs, responsabilité | **30 jours** | 2-3 jours |
| **Bannière cookies non-conforme** | Sanction CNIL modérée | **60 jours** | 3-5 jours |
| **Allégations santé interdites** | Amende DGCCRF | **45 jours** | 2-3 jours audit |
| **One-click withdrawal manquant** | Amende administrative (juin 2026) | **Avant 19 juin 2026** | 2-3 jours dev |
| **Transfert Hugging Face USA** | Risque invalidation Data Privacy Framework | **90 jours** | 5-10 jours investigation |

**Action globale P1**: Sprint "Compliance avancée" post-P0 (1 semaine)

### 🟢 Risques FAIBLES (Best Practices)

| Risque | Impact | Délai Action | Effort Estimé |
|--------|--------|--------------|---------------|
| **Classification dispositif médical** | Aucun (NutriProfile = wellness) | N/A | 0 jours |
| **DPO non-désigné** | Recommandation forte uniquement | **6 mois** | 1 jour (nomination) |
| **Assurance RC Pro absente** | Exigence contractuelle potentielle | **6 mois ou 500 users** | 1 jour (souscription) |
| **Accessibilité RGAA** | Non obligatoire (PME) | **12 mois** | 10-15 jours |
| **TVA Europe** | Géré par Lemon Squeezy | N/A | 0 jours |

**Action globale P2**: Amélioration continue sur 6-12 mois

---

## 7. Plan d'Action Priorisé (PRD)

### Phase 1: Compliance Critique (Sprint 2 semaines) - **URGENT**

**Objectif**: Éliminer risques bloquants légaux

#### Tâche 1.1: Consentement RGPD Données Santé (5 jours)

**Dev Backend**:
- [ ] Ajouter champ `health_data_consent` (boolean) à table `users`
- [ ] Créer endpoint `POST /api/v1/users/consent` pour enregistrer consentement
- [ ] Endpoint `GET /api/v1/users/consent-status` pour vérifier statut
- [ ] Migration Alembic

**Dev Frontend**:
- [ ] Créer composant `HealthDataConsentModal`
- [ ] Affichage obligatoire après inscription (onboarding step 6)
- [ ] Contenu modal:
  - Titre: "Consentement Traitement Données de Santé"
  - Explication claire: "NutriProfile collecte des données de santé (poids, allergies, objectifs) pour personnaliser vos recommandations."
  - Case à cocher: "Je consens expressément au traitement de mes données de santé pour les finalités décrites."
  - Lien vers Politique Confidentialité
  - Boutons: "Refuser" (désactive features santé) et "Accepter"
- [ ] Page Settings > "Gestion consentement" pour révocation
- [ ] Traductions 7 langues

**Critères succès**:
- Consentement explicite enregistré en DB
- Utilisateur peut révoquer facilement
- Features santé désactivées si refus

#### Tâche 1.2: Hébergement HDS (10 jours)

**Recherche**:
- [ ] Vérifier certification HDS de Fly.io (contacter support)
- [ ] Si non certifié: Comparer alternatives HDS
  - OVHcloud Public Cloud + Managed Databases (certifié HDS)
  - Scaleway (certifié HDS)
  - Outscale (certifié HDS)

**Migration (si nécessaire)**:
- [ ] Setup environnement OVHcloud/Scaleway
- [ ] Migration base de données Postgres
- [ ] Migration backend Docker
- [ ] Tests complets
- [ ] DNS switchover

**Deadline**: 16 mai 2026 (nouvelle norme HDS)

#### Tâche 1.3: Documentation Juridique (10 jours)

**Rédaction**:
- [ ] **CGV (Conditions Générales de Vente)** - 3 jours
  - Identification vendeur (auto-entrepreneur Maroc)
  - Prix des plans Free/Premium/Pro
  - Modalités paiement (Lemon Squeezy)
  - Droit de rétractation 14 jours UE
  - Résiliation abonnement
  - Clause réversibilité données (30 jours export JSON)
  - Garanties légales
  - Loi applicable et juridiction

- [ ] **CGU (Conditions Générales d'Utilisation)** - 2 jours
  - Objet application (wellness, non médical)
  - Disclaimer responsabilité
  - Règles d'usage (interdictions)
  - Propriété intellectuelle
  - Données personnelles (référence Politique Confidentialité)

- [ ] **Mentions Légales** - 1 jour
  - Éditeur: [Nom], auto-entrepreneur Maroc, [adresse]
  - Directeur publication
  - Hébergeur: Fly.io [coordonnées]
  - Contact: email, téléphone

- [ ] **Politique de Confidentialité (Privacy Policy)** - 3 jours
  - Données collectées (liste exhaustive)
  - Finalités traitement (par feature: Vision, Recipes, Coach, etc.)
  - Base juridique (Article 6.1.b contrat + Article 9.2.a consentement)
  - Destinataires (Hugging Face, Lemon Squeezy)
  - Transferts hors UE (USA, Data Privacy Framework)
  - Durée conservation (actif: durée contrat, inactif: 3 ans)
  - Droits utilisateurs (RGPD):
    - Droit d'accès
    - Droit de rectification
    - Droit à l'effacement
    - Droit à la portabilité
    - Droit d'opposition
    - Droit de limitation du traitement
  - Contact DPO/Référent (email dédié)
  - Droit réclamation CNIL

- [ ] **Politique de Cookies** - 1 jour
  - Liste cookies utilisés (authentification, localStorage)
  - Finalités
  - Durée conservation
  - Gestion paramètres

**Intégration Frontend**:
- [ ] Créer pages statiques `/legal/cgv`, `/legal/cgu`, `/legal/mentions-legales`, `/legal/privacy`, `/legal/cookies`
- [ ] Footer links vers toutes pages légales
- [ ] Case "J'accepte les CGU" à l'inscription (obligatoire)
- [ ] Traductions 7 langues (priorité FR/EN, puis autres)

**Validation**:
- [ ] Optionnel mais recommandé: Review par avocat droit digital (budget 500-1000€)

**Critères succès**:
- Documentation complète et accessible
- Conformité Code Consommation FR + RGPD
- Utilisateurs informés clairement

### Phase 2: Compliance Avancée (Sprint 1 semaine)

#### Tâche 2.1: Disclaimer Wellness (2 jours)

- [ ] Rédiger disclaimer complet (voir section 3.1)
- [ ] Afficher sur:
  - HomePage (section hero)
  - Dashboard (bandeau haut)
  - Avant première utilisation Vision IA
  - Avant première utilisation Recipes IA
  - Avant première utilisation Coach IA
  - Footer global
- [ ] Email bienvenue après inscription
- [ ] Traductions 7 langues

#### Tâche 2.2: Bannière Cookies CNIL (4 jours)

- [ ] Audit cookies/traceurs actuels (localStorage, React Query, analytics)
- [ ] Si analytics (PostHog, GA): Implémenter consentement
- [ ] Créer composant `CookieBanner`
  - Affichage au premier chargement
  - Boutons "Accepter" et "Refuser" équivalents (pas de dark pattern)
  - Lien "Gérer mes préférences"
  - Modal paramètres détaillés (catégories: fonctionnels, analytics)
- [ ] Stocker consentement en localStorage
- [ ] Bloquer traceurs non-essentiels si refus
- [ ] Page Settings > "Cookies" pour modifier consentement
- [ ] Traductions 7 langues

#### Tâche 2.3: Audit Allégations Santé (2 jours)

- [ ] Audit complet textes:
  - HomePage marketing
  - Emails marketing
  - Descriptions features (Dashboard, Vision, Recipes, Coach)
  - Notifications push/email
- [ ] Remplacer wording médical:
  - "Améliore votre santé" → "Soutient votre bien-être"
  - "Réduit le cholestérol" → "Aide à équilibrer votre nutrition"
  - "Traite" → "Accompagne"
  - "Diagnostique" → "Analyse"
- [ ] Valider avec checklist UE 1924/2006
- [ ] Documenter vocabulaire autorisé (guidelines internes)

#### Tâche 2.4: One-Click Withdrawal (2 jours)

- [ ] Ajouter bouton "Résilier mon abonnement" dans Settings > Subscription
- [ ] Modal confirmation:
  - "Êtes-vous sûr de vouloir résilier votre abonnement Premium/Pro ?"
  - Liste avantages perdus
  - "Votre accès restera actif jusqu'au [date fin période]"
  - Boutons: "Annuler" et "Confirmer résiliation"
- [ ] Backend: Endpoint `POST /api/v1/subscriptions/cancel`
- [ ] Webhook Lemon Squeezy pour synchroniser statut
- [ ] Email confirmation résiliation automatique
- [ ] Traductions 7 langues

#### Tâche 2.5: Transfert Hugging Face USA (3 jours)

- [ ] Vérifier certification Hugging Face sur [dataprivacyframework.gov](https://www.dataprivacyframework.gov/s/participant-search)
- [ ] Si certifié: ✅ Documenter dans Privacy Policy
- [ ] Si non certifié:
  - [ ] Contacter Hugging Face pour SCCs (Standard Contractual Clauses)
  - [ ] Signer SCCs si fournis
  - [ ] Ou explorer alternatives EU (Scaleway AI, OVHcloud AI)
- [ ] Mettre à jour Privacy Policy section "Transferts internationaux"

### Phase 3: Best Practices (6-12 mois)

#### Tâche 3.1: Désignation Référent RGPD (1 jour)

- [ ] Désigner fondateur ou CTO comme "Référent RGPD"
- [ ] Créer registre des traitements (Excel ou Airtable):
  - Liste activités (Vision IA, Recipes, Coach, etc.)
  - Finalités
  - Catégories données
  - Destinataires
  - Durée conservation
- [ ] Créer procédure demandes utilisateurs (exercice droits RGPD):
  - Email dédié: privacy@nutriprofile.app
  - Délai réponse: 1 mois max
  - Formulaire web optionnel
- [ ] Documenter mesures sécurité (chiffrement DB, HTTPS, backups)

#### Tâche 3.2: Assurance RC Pro (1 jour)

- [ ] Souscrire RC Pro dès:
  - 500+ utilisateurs actifs
  - Premier contrat B2B
  - Levée de fonds
- [ ] Comparer offres (OnlyNNov, Hiscox, AXA Pro)
- [ ] Budget: 500-800€/an pour TPE SaaS
- [ ] Couverture: Panne service, erreurs code, fuite données

#### Tâche 3.3: Accessibilité RGAA (10 jours)

- [ ] Audit accessibilité avec outil automatique (axe DevTools, WAVE)
- [ ] Corriger quick wins:
  - Contrastes texte (ratio 4.5:1)
  - Alt-texts images
  - Labels formulaires
  - Navigation clavier complète
  - Hiérarchie titres logique
- [ ] Ajouter déclaration accessibilité (optionnel pour PME)
- [ ] Tests avec lecteur écran (NVDA, VoiceOver)

---

## 8. Budget Compliance

| Poste | Coût Estimé | Priorité | Timing |
|-------|-------------|----------|--------|
| **Avocat review documentation** | 500-1000€ | P1 | Phase 1 |
| **Migration hébergeur HDS** (si requis) | 0-500€ setup | P0 | Phase 1 (avant mai 2026) |
| **Assurance RC Pro** | 500-800€/an | P2 | Phase 3 (> 500 users) |
| **Outil gestion cookies** (Axeptio, Didomi) | 0-50€/mois (gratuit < 10K users) | P1 | Phase 2 |
| **Total Year 1** | **~2000-3000€** | | |

**Budget total raisonnable** pour startup/solo dev. La majorité du coût est du temps dev (20-30 jours sprint compliance), pas des frais externes.

---

## 9. Checklist de Conformité NutriProfile 2026

### Conformité RGPD

- [ ] Modal consentement explicite données santé Article 9
- [ ] Politique de Confidentialité complète publiée
- [ ] Registre des traitements documenté
- [ ] Procédure exercice droits utilisateurs (accès, rectification, effacement, portabilité)
- [ ] Email dédié privacy@nutriprofile.app
- [ ] Hébergement données santé dans EEE (HDS si France)
- [ ] Transfert Hugging Face USA sécurisé (Data Privacy Framework ou SCCs)
- [ ] Durée conservation données documentée et respectée
- [ ] Chiffrement base de données + HTTPS
- [ ] Backups sécurisés et testés

### Documentation Juridique

- [ ] CGV publiées et accessibles
- [ ] CGU publiées et accessibles
- [ ] Mentions Légales publiées
- [ ] Politique de Confidentialité publiée
- [ ] Politique de Cookies publiée
- [ ] Acceptation CGU obligatoire à l'inscription
- [ ] Footer liens vers toutes pages légales
- [ ] Traductions 7 langues (FR/EN minimum)

### Wellness & Responsabilité

- [ ] Disclaimer "non dispositif médical" visible
- [ ] Aucune allégation santé non-autorisée (UE 1924/2006)
- [ ] Wording wellness validé (pas de termes médicaux)
- [ ] Recommandation consultation professionnelle santé
- [ ] CGU section limitation responsabilité claire

### Cookies & Traceurs

- [ ] Bannière cookies conforme CNIL
- [ ] Boutons Accepter/Refuser équivalents
- [ ] Paramètres cookies accessibles
- [ ] Consentement analytics si tracking tiers
- [ ] Cookies fonctionnels exemptés documentés

### E-Commerce & SaaS

- [ ] Prix TTC affichés clairement
- [ ] Modalités paiement (Lemon Squeezy) documentées
- [ ] Droit rétractation 14 jours UE mentionné
- [ ] Résiliation abonnement en 1-2 clics (juin 2026)
- [ ] Email confirmation résiliation automatique
- [ ] Clause réversibilité données (export 30 jours)

### Fiscalité & Paiements

- [ ] Lemon Squeezy configuré (Merchant of Record)
- [ ] TVA Europe gérée automatiquement
- [ ] Déclaration fiscale Maroc trimestrielle
- [ ] Facturation Lemon Squeezy archivée

### Sécurité

- [ ] HTTPS obligatoire
- [ ] Authentification JWT sécurisée
- [ ] Mots de passe hashés (bcrypt)
- [ ] Rate limiting endpoints sensibles
- [ ] Validation inputs (Pydantic)
- [ ] CORS configuré correctement
- [ ] Logs sécurisés (pas de données sensibles)

---

## 10. Monitoring Continu & Veille Réglementaire

### Veille Juridique à Maintenir

**Fréquence trimestrielle** (ou lors d'événements majeurs):

- [ ] Consulter actualités CNIL (newsletter)
- [ ] Vérifier mises à jour ANSM (logiciels santé)
- [ ] Suivre jurisprudence CJUE (Data Privacy Framework)
- [ ] Monitorer évolutions RGAA/accessibilité
- [ ] Suivre mises à jour Lemon Squeezy (TVA, compliance)

### Audits Internes

**Annuellement**:
- [ ] Audit complet RGPD (registre, consentements, durées conservation)
- [ ] Audit wording marketing (allégations santé)
- [ ] Audit cookies/traceurs (conformité CNIL)
- [ ] Review documentation juridique (CGV, CGU, Privacy)
- [ ] Tests accessibilité RGAA

### Indicateurs Compliance

**KPIs à tracker**:
- % utilisateurs ayant consenti Article 9
- % utilisateurs ayant accepté cookies analytics
- Nombre demandes exercice droits RGPD (mensuel)
- Temps réponse moyen demandes RGPD (< 1 mois)
- Incidents sécurité/fuite données (objectif: 0)

---

## 11. Conclusion & Recommandations Stratégiques

### Points Clés

1. **NutriProfile n'est PAS un dispositif médical** ✅ - Simplification réglementaire majeure
2. **RGPD données santé est le risque #1** 🔴 - Mais gérable avec consentement explicite
3. **Lemon Squeezy élimine complexité fiscale Europe** ✅ - Excellent choix stratégique
4. **Documentation juridique manquante est critique** 🔴 - Mais corrigeable en 2 semaines
5. **Auto-entrepreneur Maroc optimisé fiscalement** ✅ - 1% impôt vs 22% France

### Avantages Compétitifs NutriProfile

- ✅ Pas de barrières réglementaires devices médicaux
- ✅ Coûts conformité modérés (2-3K€ Y1)
- ✅ Fiscalité ultra-favorable Maroc
- ✅ Scalabilité Europe sans friction TVA
- ✅ Différenciation wellness (non médical) vs concurrents

### Risques à Surveiller 2026-2027

1. **Invalidation Data Privacy Framework EU-USA** - Préparer alternative EU Hugging Face
2. **Renforcement réglementation données santé** - CNIL pourrait durcir contrôles apps wellness
3. **Évolution seuils DPO** - Si forte croissance (10K+ users), DPO pourrait devenir obligatoire
4. **Contentieux utilisateurs** - Un seul litige médiatisé peut impacter réputation (importance disclaimer)

### Prochaines Étapes Immédiates

**Semaine 1-2 (Sprint Compliance Critique)**:
1. Rédiger documentation juridique (CGV, CGU, Privacy Policy, Mentions Légales)
2. Implémenter modal consentement RGPD Article 9
3. Vérifier certification HDS Fly.io (ou planifier migration)

**Semaine 3-4 (Sprint Compliance Avancée)**:
1. Déployer disclaimer wellness
2. Implémenter bannière cookies CNIL
3. Auditer allégations santé marketing
4. Ajouter résiliation 1-clic abonnement

**Mois 2-6 (Best Practices)**:
1. Désigner référent RGPD + registre traitements
2. Souscrire RC Pro (si > 500 users)
3. Améliorer accessibilité RGAA
4. Veille réglementaire trimestrielle

**Une fois ces actions complétées**, NutriProfile sera en **conformité légale complète** pour lancer commercialisation agressive en Europe francophone et Maroc.

---

## Annexes

### A. Sources Réglementaires Officielles

**Union Européenne**:
- [EU MDR 2017/745](https://eur-lex.europa.eu/eli/reg/2017/745/oj/eng)
- [RGPD - Règlement 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Règlement UE 1924/2006 - Allégations santé](https://eur-lex.europa.eu/LexUriServ/LexUriServ.do?uri=OJ:L:2007:012:0003:0018:FR:PDF)

**France**:
- [ANSM - Logiciels et applications mobiles en santé](https://ansm.sante.fr/documents/reference/logiciels-et-applications-mobiles-en-sante)
- [CNIL - Cookies et traceurs](https://www.cnil.fr/fr/cookies-et-autres-traceurs)
- [DGCCRF - Allégations nutritionnelles](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/allegations-nutritionnelles-et-de-sante-ne-vous-faites-pas-avoir)

**International**:
- [EU-US Data Privacy Framework](https://www.dataprivacyframework.gov/)

### B. Outils Compliance Recommandés

**RGPD**:
- [CNIL - Registre des traitements](https://www.cnil.fr/fr/RGDP-le-registre-des-activites-de-traitement)
- [Airtable template RGPD](https://www.airtable.com/templates/rgpd-compliance)

**Cookies**:
- [Axeptio](https://www.axeptio.eu/) (gratuit < 10K users)
- [Didomi](https://www.didomi.io/) (gratuit < 5K users)
- [Tarteaucitron.js](https://tarteaucitron.io/) (open source, gratuit)

**Documentation Juridique**:
- [LegalPlace - Générateur CGV/CGU](https://www.legalplace.fr/)
- [CaptainContrat - Templates juridiques](https://www.captaincontrat.com/)

**Accessibilité**:
- [axe DevTools](https://www.deque.com/axe/devtools/) (extension Chrome/Firefox)
- [WAVE](https://wave.webaim.org/) (audit gratuit)

### C. Contacts Utiles

**Autorités**:
- CNIL France: [www.cnil.fr](https://www.cnil.fr) | 01 53 73 22 22
- ANSM: [ansm.sante.fr](https://ansm.sante.fr)
- DGCCRF: [economie.gouv.fr/dgccrf](https://www.economie.gouv.fr/dgccrf)

**Juridique**:
- Avocats droit digital (budget 150-200€/h): Lexing, CMS Francis Lefebvre, Hogan Lovells

**Hébergeurs HDS Certifiés**:
- OVHcloud: [ovhcloud.com](https://www.ovhcloud.com)
- Scaleway: [scaleway.com](https://www.scaleway.com)
- Outscale: [outscale.com](https://www.outscale.com)

---

**Document rédigé le**: 28 janvier 2026
**Prochaine revue**: 28 avril 2026 (ou lors de changements réglementaires majeurs)
**Version**: 1.0
**Auteur**: Analyse basée sur recherche web exhaustive 2024-2026
