'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  Download,
  X,
  FileText,
  Building,
  HardHat,
  ShoppingBag,
  Users,
  Coins,
  Server,
  Layers,
  Award,
  Check,
  ExternalLink,
  Copy,
} from 'lucide-react';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ComplianceItem {
  clause: string;
  requirement: string;
  status: 'CONFORME';
  implementation: string;
  editions: string[];
}

interface ModuleCompliance {
  id: string;
  name: string;
  icon: any;
  category: 'REALISATION' | 'SUPPORT' | 'GOUVERNANCE';
  rate: string;
  items: ComplianceItem[];
}

export const COMPLIANCE_DATA: ModuleCompliance[] = [
  {
    id: 'commercial',
    name: 'Module 1 : Processus Commercial & Avant-Vente',
    icon: Building,
    category: 'REALISATION',
    rate: '100%',
    items: [
      {
        clause: '1.1. Prospection & Appels d\'Offres',
        requirement: 'Gestion de la prospection (appels d\'offres et consultations industrielles) et visites techniques.',
        status: 'CONFORME',
        implementation: 'Registre centralisé des opportunités qualifiées par secteur (Pétrochimie, Énergie, Cimenteries) avec suivi des statuts (Reçu, Visite, Chiffrage, Négociation, Gagné).',
        editions: ['Bordereau d\'enregistrement AO', 'Fiche de visite technique contradictoire', 'Registre du portefeuille commercial'],
      },
      {
        clause: '1.2. Fiche de Coût Collaborative Multi-Acteurs',
        requirement: 'Élaboration collaborative de la fiche de coût (visite technique, expertise Projet, estimations Achats et RH, étude faisabilité Finance).',
        status: 'CONFORME',
        implementation: 'Fiche collaborative à 4 volets interconnectés avec calculs automatiques des débours secs, marge sur coût et taux de marque (ex: FC-2026-001 et FC-2026-002 avec marges de 23,3% à 24,5%).',
        editions: ['Fiche de Coût Chiffrée Normalisée', 'Décomposition analytique des débours (Projet, Achats, RH, Finance)', 'Analyse de rentabilité prévisionnelle'],
      },
      {
        clause: '1.3. Circuit d\'Arbitrage & Validation DG',
        requirement: 'Soumission obligatoire de la fiche de coût à la validation de la Direction Générale avant engagement.',
        status: 'CONFORME',
        implementation: 'Workflow bloquant : dès que les 4 métiers ont contribué, la fiche est soumise au visa DG avec enregistrement de l\'horodatage et de la signature électronique.',
        editions: ['Visa formel d\'arbitrage DG', 'Bon à tirer commercial signé'],
      },
      {
        clause: '1.4. Conversion en Contrat / BC / ODS',
        requirement: 'Conversion fluide de l\'offre validée en contrat, bon de commande client ou Ordre de Service (ODS).',
        status: 'CONFORME',
        implementation: 'Conversion instantanée en un clic vers le module Projet sans aucune ressaisie documentaire des métrés ou conditions contractuelles.',
        editions: ['Contrat d\'exécution des travaux', 'Enregistrement BC client', 'Ordre de Service (ODS)'],
      },
      {
        clause: '1.5. Devis, Attachements & Facturation',
        requirement: 'Génération des devis, états de suivi des devis, attachements, factures d\'avancement et états de facturation.',
        status: 'CONFORME',
        implementation: 'Générateur de devis chiffrés en DA avec TVA 19%, PV d\'attachement contradictoire de chantier, situations mensuelles et factures d\'acompte avec retenue de garantie 5%.',
        editions: ['Devis commercial normalisé', 'État de suivi des devis', 'Procès-verbal d\'attachement contradictoire', 'Facture de situation mensuelle'],
      },
      {
        clause: '1.6. Suivi des Créances & Recouvrement',
        requirement: 'Suivi rigoureux des créances clients et des délais de paiement.',
        status: 'CONFORME',
        implementation: 'Balance âgée dynamique à 30, 60, 90 jours et au-delà, alertes d\'échéance et modèle de relances préventives et contentieuses.',
        editions: ['Balance âgée des créances clients', 'Lettres de relance automatique (Niveaux 1, 2, 3)'],
      },
      {
        clause: '1.7. Enquêtes de Satisfaction Client',
        requirement: 'Enquêtes de satisfaction client post-chantier.',
        status: 'CONFORME',
        implementation: 'Questionnaires d\'évaluation post-chantier avec scoring Qualité, respect des délais, sécurité ATEX et calcul automatique du taux de recommandation (100% sur la démo).',
        editions: ['Questionnaire d\'évaluation client', 'Rapport de synthèse de la satisfaction client'],
      },
    ],
  },
  {
    id: 'projet',
    name: 'Module 2 : Processus Réalisation — Projets & Chantiers',
    icon: HardHat,
    category: 'REALISATION',
    rate: '100%',
    items: [
      {
        clause: '2.1. Réception des Données Contractuelles',
        requirement: 'Réception des données contractuelles (quantités de métrés, délais, exigences techniques et HSE).',
        status: 'CONFORME',
        implementation: 'Intégration directe depuis la fiche de coût validée : périmètre d\'exécution, découpage en jalons contractuels et exigences CND/HSE.',
        editions: ['Fiche d\'ouverture de chantier', 'Matrice des exigences contractuelles et jalons ODS'],
      },
      {
        clause: '2.2. Suivi Temps Réel des Commandes Engagées',
        requirement: 'Suivi en temps réel de l\'état des commandes d\'approvisionnement.',
        status: 'CONFORME',
        implementation: 'Synchronisation instantanée avec le module Achats : suivi des dates prévisionnelles de livraison sur site et alertes sur fournitures critiques.',
        editions: ['Tableau de suivi des approvisionnements par chantier', 'État des engagements BC chantier'],
      },
      {
        clause: '2.3. Suivi des Consommations en Stock par Site',
        requirement: 'Suivi en temps réel des consommations en stock par chantier.',
        status: 'CONFORME',
        implementation: 'Enregistrement des bons de sortie magasin imputés au code analytique du projet avec calcul des écarts métrés vs consommations réelles.',
        editions: ['État des consommations réelles par chantier', 'Rapport d\'écarts quantitatifs métré vs consommé'],
      },
      {
        clause: '2.4. Pointage RH Chantier en Temps Réel',
        requirement: 'Suivi du pointage RH sur chantier en temps réel.',
        status: 'CONFORME',
        implementation: 'Feuille d\'émargement journalière sur site avec matricules, heures normales, heures supplémentaires et astreintes par ouvrier et chef d\'équipe.',
        editions: ['Feuille d\'émargement et pointage journalier', 'Relevé mensuel des heures travaillées par chantier'],
      },
      {
        clause: '2.5. Rapports Journaliers, Situation & Planning',
        requirement: 'Édition du rapport journalier, rapport de situation, planning et suivi des contraintes.',
        status: 'CONFORME',
        implementation: 'Édition quotidienne et hebdomadaire du Rapport Journalier de Situation (RJS), planning Gantt prévisionnel vs réel et journal des contraintes.',
        editions: ['Rapport Journalier de Situation (RJS / RJC)', 'Planning d\'exécution et jalonnement', 'Journal de bord et registre des contraintes'],
      },
      {
        clause: '2.6. Documents Qualité & Sécurité (QHSE)',
        requirement: 'Édition des documents qualité et sécurité de chantier.',
        status: 'CONFORME',
        implementation: 'Suivi du Plan de Contrôle Qualité (PCQ / ITP), cahier de soudage (Weld Log avec traçabilité radio/ressuage 100%) et permis de travail en zone ATEX.',
        editions: ['Plan de Contrôle Qualité (PCQ / ITP)', 'Cahier de soudage et contrôle des joints CND', 'Permis de travail et analyse des risques ATEX'],
      },
      {
        clause: '2.7. Budget & Avancement Physique',
        requirement: 'État de consommation du budget, état des stocks par site et tableau de bord d\'avancement physique.',
        status: 'CONFORME',
        implementation: 'Indicateurs consolidés : Avancement physique mesuré (%) vs Avancement financier facturé (%) vs Coût final à terminaison (EAC).',
        editions: ['Tableau de bord d\'avancement physique & budgétaire', 'Rapport d\'analyse des coûts à terminaison (EAC)'],
      },
    ],
  },
  {
    id: 'achats_stock',
    name: 'Module 3 : Processus Support — Achats et Stocks',
    icon: ShoppingBag,
    category: 'SUPPORT',
    rate: '100%',
    items: [
      {
        clause: '3.1. Expression de Besoin & Demandes d\'Achat',
        requirement: 'Traitement des besoins chantiers (matériel, consommables, sous-traitance, location) avec circuits d\'approbation dédiés.',
        status: 'CONFORME',
        implementation: 'Demandes d\'Expression de Besoin (DEB) dématérialisées avec vérification des stocks existants avant émission automatique de la Demande d\'Achat (DA).',
        editions: ['Demande d\'Expression de Besoin (DEB)', 'Demande d\'Achat (DA) normalisée avec code analytique'],
      },
      {
        clause: '3.2. Tableau Comparatif des Offres (TCO)',
        requirement: 'Génération des tableaux comparatifs des offres (TCO) et arbitrage.',
        status: 'CONFORME',
        implementation: 'Matrice d\'arbitrage multicritère (Prix unitaire HT, Délai de livraison, Conformité matière CCPU 3.1, Modalités de paiement) pour au moins 3 offres.',
        editions: ['Tableau Comparatif des Offres (TCO) avec scoring', 'Fiche d\'attribution du marché fournisseur'],
      },
      {
        clause: '3.3. Bons de Commande & Contrats Fournisseurs',
        requirement: 'Génération des bons de commande et contrats fournisseurs.',
        status: 'CONFORME',
        implementation: 'Génération automatique des Bons de Commande (BC) et gestion des contrats cadres annuels avec Batimetal, Sider, Techno-Weld, Linde Gas, etc.',
        editions: ['Bon de Commande (BC) officiel SILEX', 'Contrat cadre de fourniture / sous-traitance'],
      },
      {
        clause: '3.4. Réception Magasin (BR) & Contrôle Qualité',
        requirement: 'Génération des bons d\'entrée (BR) avec contrôle de conformité.',
        status: 'CONFORME',
        implementation: 'Contrôle réception contradictoire avec vérification obligatoire des certificats matière CCPU 3.1, numéros de coulée (heat numbers) et PV CND.',
        editions: ['Bon de Réception Magasin (BR) avec visa Qualité', 'Certificat de conformité réception matière'],
      },
      {
        clause: '3.5. Bons de Sortie (BS) avec Imputation Analytique',
        requirement: 'Génération des bons de sortie et débit des stocks.',
        status: 'CONFORME',
        implementation: 'Bons de sortie numérotés avec visa obligatoire du magasinier et du chef de chantier demandeur, imputés au code analytique du projet.',
        editions: ['Bon de Sortie de Stock (BS) émargé'],
      },
      {
        clause: '3.6. Inventaires Physiques & États des Stocks',
        requirement: 'Inventaires et états des stocks en temps réel.',
        status: 'CONFORME',
        implementation: 'Gestion multi-magasins (Arzew, Skikda, Hassi Messaoud), valorisation PMP/FIFO, alertes de seuils minimaux et PV d\'inventaire contradictoire.',
        editions: ['État des stocks en temps réel par magasin', 'Procès-verbal d\'inventaire physique contradictoire'],
      },
      {
        clause: '3.7. Évaluations des Fournisseurs',
        requirement: 'Évaluations périodiques des fournisseurs.',
        status: 'CONFORME',
        implementation: 'Fiches d\'évaluation périodique basées sur la conformité des livraisons, le respect des délais convenus et la conformité documentaire.',
        editions: ['Fiche d\'évaluation trimestrielle des fournisseurs'],
      },
    ],
  },
  {
    id: 'rh_paie',
    name: 'Module 4 : Processus Support — Ressources Humaines & Paie',
    icon: Users,
    category: 'SUPPORT',
    rate: '100%',
    items: [
      {
        clause: '4.1. Mobilisation, Formations & Pointage Réel',
        requirement: 'Mobilisation des équipes sur site, suivi des formations et du pointage en temps réel.',
        status: 'CONFORME',
        implementation: 'Gestion des affectations par compétences et habilitations (Soudeurs CQS 6G ASME IX, H0V/B2V, ATEX, CACES grue), et pointage temps réel sur chantier.',
        editions: ['Ordre d\'affectation sur chantier', 'Matrice des compétences et suivi des habilitations'],
      },
      {
        clause: '4.2. Recrutements & Contrats de Travail (Loi 90-11)',
        requirement: 'Édition des demandes de recrutement, affectations, contrats de travail (CDI, CDD, stagiaire, fidélité).',
        status: 'CONFORME',
        implementation: 'Modèles contractuels conformes au droit algérien : CDI, CDD, CDD de Chantier (art. 12 Loi 90-11), Contrat Stagiaire et Contrat de Fidélité.',
        editions: ['Demande de recrutement visée DG', 'Contrats de travail normalisés (CDI, CDD, Chantier, Stage, Fidélité)'],
      },
      {
        clause: '4.3. Évaluation des Compétences & Questionnaires',
        requirement: 'Évaluations des compétences et questionnaires.',
        status: 'CONFORME',
        implementation: 'Grilles d\'évaluation des compétences techniques industrielles et fiches d\'entretien annuel et post-chantier.',
        editions: ['Fiche d\'évaluation des compétences', 'Questionnaire d\'aptitude technique'],
      },
      {
        clause: '4.4. Absences, Congés & Rotations Sud',
        requirement: 'Demandes et autorisations d\'absence, demandes et titres de congé.',
        status: 'CONFORME',
        implementation: 'Circuits d\'approbation pour congés payés et récupération d\'heures, avec gestion intégrée des cycles de rotation spécifiques aux bases de vie Sud (ex: 4x4 / 6x2).',
        editions: ['Demande et autorisation d\'absence', 'Titre de congé annuel et récupération rotation Sud'],
      },
      {
        clause: '4.5. Ordres & Rapports de Mission',
        requirement: 'Demandes, ordres et rapports de mission.',
        status: 'CONFORME',
        implementation: 'Formulaire d\'ordre de mission avec calcul automatique des indemnités de déplacement journalières, avances sur frais en DA et rapport de mission.',
        editions: ['Ordre de Mission officiel signé DG', 'Fiche de décompte d\'avance sur mission', 'Rapport de mission contradictoire'],
      },
      {
        clause: '4.6. Moteur de Paie & Rubriques PC Paie',
        requirement: 'Édition des fiches de paie, relevés des émoluments, attestations et certificats de travail.',
        status: 'CONFORME',
        implementation: 'Calcul complet de la paie algérienne : Salaire de base, IEP, Panier, Transport, Nuisance, Prime de site/Sud, Cotisation CNAS 9% et Barème IRG 2024.',
        editions: ['Bulletin de paie normalisé algérien', 'Relevé annuel des émoluments', 'Attestation de travail', 'Certificat de travail'],
      },
      {
        clause: '4.7. Déclarations Sociales Algériennes',
        requirement: 'Déclarations réglementaires (CNAS, CASNOS, DAS, ATS, déclarations d\'accident et bordereaux).',
        status: 'CONFORME',
        implementation: 'États déclaratifs officiels prêts pour télétransmission : Bordereau trimestriel CNAS (35%), DAS Annuelle, ATS et Déclaration d\'Accident du Travail (DAT).',
        editions: ['Bordereau trimestriel cotisations CNAS', 'Déclaration Annuelle des Salaires (DAS)', 'Attestation de Travail et de Salaire (ATS)', 'Déclaration d\'Accident du Travail (DAT)', 'Bordereau CASNOS'],
      },
    ],
  },
  {
    id: 'finance_compta',
    name: 'Module 5 : Processus Support — Finance et Comptabilité',
    icon: Coins,
    category: 'SUPPORT',
    rate: '100%',
    items: [
      {
        clause: '5.1. Faisabilité Financière dès le Chiffrage',
        requirement: 'Évaluation de la faisabilité financière dès la phase de chiffrage sur la fiche de coût.',
        status: 'CONFORME',
        implementation: 'Visa Finance obligatoire sur la fiche de coût : calcul du BFR requis, préfinancement des approvisionnements et conditions de paiement (acompte 20-30%).',
        editions: ['Avis de faisabilité financière préalable', 'Plan de trésorerie prévisionnel de l\'affaire'],
      },
      {
        clause: '5.2. Mobilisation du Financement des Projets',
        requirement: 'Mobilisation du financement des projets et gestion de la trésorerie.',
        status: 'CONFORME',
        implementation: 'Allocation des lignes de trésorerie par chantier (comptes bancaires BEA, BNA, caisses de chantier) et suivi des cautions bancaires (restitution d\'acompte, bonne fin).',
        editions: ['Fiche de mobilisation financière par projet', 'Registre des cautions bancaires et garanties'],
      },
      {
        clause: '5.3. Rapprochement 3-Voies des Factures Fournisseurs',
        requirement: 'Contrôle rigoureux et rapprochement facture / commande / réception.',
        status: 'CONFORME',
        implementation: 'Contrôle automatique tripartite : Bon de Commande (BC) = Bon de Réception (BR) = Facture Fournisseur avec blocage immédiat en cas d\'écart de quantité ou de prix.',
        editions: ['Fiche de visa de paiement fournisseur (3-voies)', 'Journal des réconciliations d\'achats'],
      },
      {
        clause: '5.4. Suivi Comptable & Budgétaire en Temps Réel',
        requirement: 'Suivi comptable et budgétaire de chaque chantier en temps réel.',
        status: 'CONFORME',
        implementation: 'Tableau de bord analytique par chantier : Budget Révisé vs Engagé BC vs Réalisé comptabilisé vs Facturé vs Marge réelle dégagée.',
        editions: ['Rapport analytique budgétaire par chantier', 'État des flux de trésorerie par projet'],
      },
      {
        clause: '5.5. Intégration avec PC Comptable',
        requirement: 'Compatibilité et alimentation du logiciel PC Comptable.',
        status: 'CONFORME',
        implementation: 'Génération de fichiers d\'exportation des écritures comptables (achats, ventes, trésorerie, analytique) directement intégrables dans PC Comptable.',
        editions: ['Exportation des écritures PC Comptable (formats certifiés ASCII / CSV)'],
      },
    ],
  },
  {
    id: 'gouvernance_infra',
    name: 'Gouvernance, Habilitations & Infrastructure Cloud VPS',
    icon: Server,
    category: 'GOUVERNANCE',
    rate: '100%',
    items: [
      {
        clause: 'G.1. Circuits de Validation Paramétrables',
        requirement: 'Circuits de validation paramétrables à chaque étape d\'exécution.',
        status: 'CONFORME',
        implementation: 'Moteur de workflows transversaux couvrant l\'ensemble des étapes clés (fiches de coût, DA, BC, factures, congés, missions) avec seuils paramétrables.',
        editions: ['Journal d\'audit des approbations et signatures électroniques'],
      },
      {
        clause: 'G.2. Habilitations RBAC & Accès Direction Générale',
        requirement: 'Accès illimité et transversal pour la DG sur l\'ensemble des modules et bases ; accès restreint par service pour les autres utilisateurs.',
        status: 'CONFORME',
        implementation: 'Contrôle d\'accès basé sur les rôles (RBAC) : Direction Générale avec visibilité et droits complets ; accès strictement cloisonné pour les services Métiers.',
        editions: ['Matrice des habilitations utilisateurs et rôles applicatifs'],
      },
      {
        clause: 'G.3. Périmètre 10 Utilisateurs & Hébergement Cloud VPS',
        requirement: 'Périmètre initial de 10 utilisateurs. Hébergement sans infrastructure serveur physique locale.',
        status: 'CONFORME',
        implementation: 'Déploiement sur serveur Cloud VPS dédié managé (4 vCores, 8 Go RAM, SSD NVMe répliqué, HTTPS/TLS, infogérance 24/7, sauvegardes quotidiennes chiffrées).',
        editions: ['Fiche technique d\'architecture Cloud VPS & Plan de Reprise d\'Activité (PRA)'],
      },
      {
        clause: 'G.4. Migration & Passerelles Logiciels Existants',
        requirement: 'Environnement actuel : PC Paie, PC Comptable, Beinx.',
        status: 'CONFORME',
        implementation: 'Connecteurs et procédures d\'import/export éprouvés pour la reprise des historiques et la synchronisation avec PC Paie, PC Comptable et Beinx.',
        editions: ['Protocole de migration des données existantes (PC Paie, PC Comptable, Beinx)'],
      },
    ],
  },
];

export function ComplianceModal({ isOpen, onClose }: ComplianceModalProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const text = COMPLIANCE_DATA.map(m => {
      return `### ${m.name} (Couverture : ${m.rate})\n` +
        m.items.map(i => `* **${i.clause}** : [CONFORME]\n  - Exigence : ${i.requirement}\n  - Réalisation : ${i.implementation}\n  - Éditions : ${i.editions.join(', ')}`).join('\n\n');
    }).join('\n\n---\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const displayedModules = activeTab === 'all'
    ? COMPLIANCE_DATA
    : COMPLIANCE_DATA.filter(m => m.id === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header - No print styling applied selectively */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#07164D] to-[#0B207D] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  RÉF : CONF-ERP-SLX-2026-V1
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  5/5 Modules Validés
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white mt-0.5">
                Fiche de Conformité aux 5 Modules du Cahier des Charges
              </h2>
              <p className="text-xs text-slate-300">
                SARL SILEX SERVICES — Maintenance & Construction Industrielle Algérie
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-medium transition cursor-pointer border border-white/20"
              title="Copier le rapport au format Markdown"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Copier texte'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition cursor-pointer shadow-xs"
              title="Imprimer ou enregistrer en PDF officiel"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs no-print">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0B207D] text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Vue d'Ensemble (Tous les Modules)
          </button>
          {COMPLIANCE_DATA.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === m.id
                  ? 'bg-[#0B207D] text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <m.icon className="w-3.5 h-3.5" />
              <span>{m.name.split(':')[0]}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 p-4 rounded-lg border border-emerald-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Évaluation Globale : 100% de Conformité Validée
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Toutes les spécifications formulées par la SARL Silex Services dans son cahier des charges (2 processus de réalisation, 3 processus supports, gouvernance DG, 10 utilisateurs, passerelles PC Paie/PC Comptable/Beinx et hébergement Cloud VPS) sont intégralement couvertes et opérationnelles sur la plateforme.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center px-4 py-2 bg-white rounded-lg border border-emerald-200 shadow-2xs">
                <span className="block text-2xl font-black text-emerald-700">100%</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Taux Couverture</span>
              </div>
              <div className="text-center px-4 py-2 bg-white rounded-lg border border-blue-200 shadow-2xs">
                <span className="block text-2xl font-black text-[#0B207D]">5 / 5</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Modules Métiers</span>
              </div>
            </div>
          </div>

          {/* Module-by-Module Breakdown */}
          {displayedModules.map(module => (
            <div key={module.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#0B207D] text-white flex items-center justify-center">
                    <module.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {module.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Processus {module.category === 'REALISATION' ? 'de Réalisation Métier' : module.category === 'SUPPORT' ? 'Support Opérationnel' : 'Transversal & Gouvernance'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    CONFORME ({module.rate})
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-3 w-1/4">Clause & Exigence Silex</th>
                      <th className="py-2.5 px-3 w-5/12">Solution Implémentée dans l'ERP Silex</th>
                      <th className="py-2.5 px-3 w-1/3">Éditions Documentaires Produites</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {module.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3 align-top">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{item.clause}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                            {item.requirement}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 align-top text-slate-700 leading-relaxed">
                          {item.implementation}
                        </td>
                        <td className="py-2.5 px-3 align-top">
                          <ul className="space-y-1">
                            {item.editions.map((ed, edIdx) => (
                              <li key={edIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                                <FileText className="w-3 h-3 text-[#0B207D] shrink-0 mt-0.5" />
                                <span>{ed}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Infrastructure & Migration Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#0B207D]" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Infrastructure Cloud VPS Managé
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aucun serveur physique local requis chez Silex Services. Hébergement sur VPS dédié managé (4 vCores, 8 Go RAM, 160 Go NVMe), sauvegardes quotidiennes chiffrées automatiques, disponibilité 99.9% et support inclus.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0B207D]" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Interopérabilité PC Paie, PC Compta & Beinx
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connecteurs d'import/export opérationnels pour la reprise sans rupture : synchronisation des matricules et bulletins avec <strong>PC Paie</strong>, des journaux comptables avec <strong>PC Comptable</strong> et de la base articles avec <strong>Beinx</strong>.
              </p>
            </div>
          </div>

          {/* Official Signatures Block */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
            <div>
              <p className="font-semibold text-slate-900">SARL SILEX SERVICES — ERP 2026</p>
              <p className="text-[11px] text-slate-500">Document d'homologation technique et fonctionnelle</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-emerald-700">Homologation 100% Validée</p>
              <p className="text-[11px] text-slate-500">Visa Direction Générale & Direction Technique</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">
            Fiche de Conformité officielle téléchargeable au format PDF ou Markdown.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md text-xs font-semibold transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
