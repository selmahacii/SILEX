# SILEX ERP — Rapport Préalable à l'Implémentation du Module RH (Phase 5)
## Audit de Sécurité, Architecture et Conformité Réglementaire Algérienne

**Date :** 13 Novembre 2026  
**Société :** SARL SILEX SERVICES  
**Statut :** Gate de Sécurité Pré-Développement Franchie avec Succès  

---

## 1. Source de Vérité des Données RH
- **Base de Production :** PostgreSQL Neon Cloud via Prisma ORM (`model Employee`, `model EmployeeCertification`, `model Attendance`).
- **Adaptateur de Démonstration & Fallback :** `apps/web/src/lib/server-store.ts` orchestré par `apps/web/src/lib/db-bridge.ts`.
- **Principe de Cohérence :** `dbBridge` consulte toujours Neon en priorité (`hasDb = true`). Si la base est accessible, les données retournées sont celles de PostgreSQL. En cas d'indisponibilité ou en contexte de test unitaire/E2E isolé, le store en mémoire assure la continuité de service. Aucune double source de vérité discordante n'est créée.

---

## 2. Modèle Actuel des Employés dans Prisma & Store
Dans `apps/web/prisma/schema.prisma` :
```prisma
model Employee {
  id                 String                  @id @default(cuid())
  registrationNumber String                  @unique
  firstName          String
  lastName           String
  photoUrl           String?
  title              String
  departmentId       String
  department         Department              @relation(fields: [departmentId], references: [id])
  email              String                  @unique
  phone              String
  contractType       String                  @default("CDI")
  hireDate           DateTime
  status             String                  @default("ACTIF")
  certifications     EmployeeCertification[]
  attendances        Attendance[]
}
```

---

## 3. Données Personnelles Existantes & Protection Stricte
- **Constat vérifié :** La table `Employee` de Neon a été requêtée en mode sécurisé : elle contient **0 enregistrement**.
- **Mesure de protection absolue :**
  - **Zéro donnée réelle** : Aucun nom, prénom, numéro de téléphone, NIN, numéro CNAS, adresse ou salaire réel de Silex Services n'est inséré dans le code, les tests ou la documentation.
  - **Profils 100% fictifs** : Utilisation exclusive d'identifiants standardisés de type `DEMO-EMP-001` à `DEMO-EMP-012`, matricules `DEMO-MAT-001` à `DEMO-MAT-012`, adresses fictives et téléphones de convention `+213 550 00 00 XX`.
  - **Distinction Salarié / Compte Utilisateur ERP** : Les 12 collaborateurs de démonstration représentent l'effectif métier (tuyauteurs, soudeurs, chefs d'équipe, superviseur HSE, magasinier, ingénieur travaux). Seuls les profils d'encadrement disposent d'un compte ERP (`User` avec RBAC).

---

## 4. Modèles à Réutiliser
- `model Employee` & `StoredEmployee` : Répertoire de base des salariés.
- `model EmployeeCertification` : Base pour le rattachement des qualifications aux collaborateurs.
- `model Attendance` : Pointage des présences quotidiennes par chantier (`regularHours`, `overtimeHours`, `isAbsent`, `absenceReason`).
- `model Project` & `model Department` : Rattachement organisationnel et analytique par chantier.

---

## 5. Modèles Complémentaires Développés (Structures Industrielles)
Pour satisfaire les exigences **RH-01 à RH-12** sans altérer destructivement la base de données :
1. **Certifications & Qualifications Spécialisées (`StoredIndustrialCertification`) :**
   - Typologie stricte : `QUALIFICATION_SOUDAGE_CQS`, `HABILITATION_ELECTRIQUE`, `SECURITE_ESPACE_CONFINE`, `TRAVAIL_EN_HAUTEUR`, `VISITE_MEDICALE_APTITUDE`.
   - Spécifications CQS métallurgie : Référentiel (ASME IX / API 1104 / EN ISO 9606-1), Procédé (141 TIG, 111 SMAW ARC), Position (6G, 1G-4G), Domaine de validité (diamètres, épaisseurs).
   - Workflow d'audit documentaire : Vérificateur désigné, date de contrôle, statut (`VALIDE`, `EN_ATTENTE_VERIFICATION`, `REJETE`, `EXPIRE`), motif de rejet.
2. **Demandes de Congés & Titres de Congé (`StoredLeaveRequest`) :**
   - Types : `CONGE_PAYE`, `RECUPERATION_ROTATION_SUD`, `MALADIE`, `EVENEMENT_FAMILIAL`, `SANS_SOLDE`.
   - Circuit d'approbation : `SOUMIS` $\rightarrow$ Visa Responsable RH $\rightarrow$ Accord Direction Générale $\rightarrow$ Génération du Titre de Congé A4.
3. **Ordres de Mission & Déplacements Chantiers (`StoredMissionOrder`) :**
   - Destination industrielle : Base Arzew, Raffinerie Skikda RA1K, Base Sud Hassi Messaoud.
   - Objet de mission, durée, moyen de transport, hébergement prévu, avance sur frais, indemnités journalières de déplacement (*per diem*).
   - Circuit : Émission $\rightarrow$ Visa RH $\rightarrow$ Validation DG $\rightarrow$ Ordre de Mission officiel A4.
4. **Besoins en Recrutement & Renfort Chantiers (`StoredRecruitmentRequest`) :**
   - Déclencheur : Demande du Responsable Projet pour arrêt d'unité programmé.
   - Profil recherché, nombre de postes, qualification exigée (ex: 4 soudeurs 6G radio, 6 tuyauteurs ISO), durée de mobilisation, validation DG.
5. **Gestion Paramétrable des Rotations Sud (`StoredRotationCycle`) :**
   - Cycles industriels : `4x4` (4 semaines travaillées / 4 semaines de repos) ou `6x2` (6 semaines travaillées / 2 semaines de repos).
   - Date de démarrage, site affecté, calendrier prévisionnel des relèves, pointage contradictoire entre planning théorique et présence effective sur base.
6. **Architecture des Rubriques Salariales & Bulletin de Paie DEMO (`StoredSalaryRubricConfig`, `StoredPayslipDemo`) :**
   - Paramétrage unitaire de chaque rubrique (Code, Libellé, Type Gain/Retenue, Base de calcul, Assujettissement CNAS, Assujettissement IRG, Date d'effet, Statut de validation).

---

## 6. Références Réglementaires Algériennes 2026 Intégrées

Les paramètres suivants sont intégrés sous forme de **table de configuration versionnée et transparente** (avec dates d'effet) :

### A. SNMG (Salaire National Minimum Garanti)
- **Montant mensuel :** 24 000,00 DA.
- **Durée légale hebdomadaire :** 40 heures.
- **Base mensuelle de référence :** 173,33 heures ($40 \text{ h} \times \frac{52}{12}$).
- **Taux horaire de base :** 138,46 DA.
- **Date d'effet :** 01/01/2026.
- **Source légale :** Décret présidentiel n° 26-01 du 07/01/2026 (Journal officiel n° 1 de 2026).

### B. Cotisations de Sécurité Sociale (CNAS)
- **Part ouvrière (salariale) déductible :** 9,00 %.
- **Part patronale (non déductible du brut salarié) :** 26,00 % (dont 0,5% œuvres sociales et 0,5% congés payés secteur BTP/Hydraulique selon CACOBATPH).
- **Date d'effet :** En vigueur continue.
- **Source légale :** Décret exécutif n° 15-236 du 03/09/2015 (Journal officiel n° 49 de 2015).

### C. Impôt sur le Revenu Global (IRG) — Traitements et Salaires
- **Barème progressif mensuel (Loi de Finances) :**
  - Tranche 0 à 20 000 DA : 0 %
  - Tranche 20 001 à 40 000 DA : 23 %
  - Tranche 40 001 à 80 000 DA : 27 %
  - Tranche 80 001 à 160 000 DA : 30 %
  - Tranche 160 001 à 320 000 DA : 33 %
  - Tranche supérieure à 320 000 DA : 35 %
- **Régime d'abattement fiscal légal :**
  - Abattement général de 40 % sur l'impôt brut résultant du barème, avec plancher minimum de 1 000 DA/mois et plafond maximum de 1 500 DA/mois.
  - Exonération totale d'IRG pour les revenus imposables inférieurs ou égaux à 30 000 DA/mois.
  - Dispositif spécifique de transition dégressive pour les salaires imposables compris entre 30 001 DA et 35 000 DA.
- **Avertissement de transparence :** Ce barème automatisé fournit une simulation indicative de haute précision pour les bulletins démo. Il ne remplace pas le progiciel certifié PC Paie utilisé par la direction financière de Silex Services pour les déclarations fiscales officielles (G50 / DAS).

---

## 7. Hypothèses Nécessitant Confirmation Ultérieure de Silex
1. **Convention Collective de Branche :** Confirmation des taux exacts de l'Indemnité d'Expérience Professionnelle (IEP) appliqués chez Silex (ex: 1% à 2% par an plafonné ou barème spécifique métallurgie).
2. **Forfaits Panier & Transport :** Plafonds d'exonération CNAS convenus pour les indemnités de panier et de transport sur les chantiers locaux d'Arzew vs les bases de vie du Sud.
3. **Régime des Rotations Sud :** Confirmation si le régime dominant à Hassi Messaoud est le 4×4 ou le 6×2, et si les jours de repos de récupération sont indemnisés à 100% du salaire de base.

---

## 8. Tests de Sécurité & Validation Prévus
- **Test E2E automatisé dédié :** `scripts/test-hr-e2e.js`.
- **Vérifications strictes :**
  1. Aucune donnée personnelle réelle dans les retours d'API.
  2. Présence obligatoire de la mention **"DOCUMENT DE DÉMONSTRATION — NON CONTRACTUEL"** sur les bulletins et états de paie.
  3. Ségrégation SoD : un collaborateur ne peut pas approuver ses propres congés ni ses ordres de mission.
  4. Blocage automatique d'affectation sur tâche critique si la qualification CQS est expirée ou non vérifiée.
  5. Imperméabilité absolue : Zéro bascule automatique du mode DEMO vers le mode PRODUCTION.
