'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { formatCurrencyDA, formatDateDZ, ServiceOrderType } from '@silex/shared';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  Coins,
  Boxes,
  FileText,
  AlertCircle,
  Plus,
  CheckCircle,
  Clock,
  Layers,
  ShieldAlert,
  Edit,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  ShieldCheck,
  ExternalLink,
  X,
  MapPin,
  Gauge,
  HardHat,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Trash2,
  Scale,
  Zap,
  Phone,
  Mail,
  Users,
  Receipt,
  CalendarCheck,
  Briefcase,
} from 'lucide-react';

const SECTORS = [
  { value: 'OIL_AND_GAS', label: 'Pétrole & Gaz (Hydrocarbures / Sonatrach)' },
  { value: 'ENERGIE', label: 'Énergie & Centrales Électriques (Sonelgaz)' },
  { value: 'CHIMIE_PHARMA', label: 'Chimie & Pétrochimie' },
  { value: 'AGROALIMENTAIRE', label: 'Agroalimentaire & Froid Industriel' },
  { value: 'SIDERURGIE', label: 'Sidérurgie & Métallurgie' },
  { value: 'EAU_ENVIRONNEMENT', label: 'Dessalement & Traitement des Eaux' },
  { value: 'AUTRE_INDUSTRIE', label: 'Autre Industrie Lourde' },
];

const STATUSES = [
  { value: 'PLANNED', label: 'Planifié / Préparation' },
  { value: 'IN_PROGRESS', label: 'En cours (Chantier Actif)' },
  { value: 'ON_HOLD', label: 'En Arrêt / Suspendu' },
  { value: 'COMPLETED', label: 'Achevé / Réception Provisoire' },
  { value: 'CANCELLED', label: 'Annulé' },
];

const RISK_LEVELS = [
  { value: 'LOW', label: 'Faible (Sous contrôle)' },
  { value: 'MEDIUM', label: 'Modéré (Vigilance)' },
  { value: 'HIGH', label: 'Élevé (Plan d\'action requis)' },
  { value: 'CRITICAL', label: 'Critique (Arrêt potentiel)' },
];

export interface SitLineItem {
  id: string;
  designation: string;
  unit: string;
  contractQty: number;
  periodQty: number;
  unitPrice: number;
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);

  // 1. Modal Modifier le Projet
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editClientName, setEditClientName] = useState('');
  const [editSiteLocation, setEditSiteLocation] = useState('');
  const [editSector, setEditSector] = useState('OIL_AND_GAS');
  const [editStatus, setEditStatus] = useState('IN_PROGRESS');
  const [editRiskLevel, setEditRiskLevel] = useState('LOW');
  const [editContractAmount, setEditContractAmount] = useState<number>(0);
  const [editBudgetAmount, setEditBudgetAmount] = useState<number>(0);
  const [editDescription, setEditDescription] = useState('');
  const [editObjectives, setEditObjectives] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editContractEndDate, setEditContractEndDate] = useState('');
  const [editManagerId, setEditManagerId] = useState('');

  // 2. Modal Ajuster Avancement
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [editPhysicalProgress, setEditPhysicalProgress] = useState<number>(0);
  const [editFinancialProgress, setEditFinancialProgress] = useState<number>(0);

  // 3. Modal Nouveau Jalon (Micro-Détaillé, Pratique & Interconnecté)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('Contrôles Non Destructifs 100% Radio (RT) & Ressuage (PT)');
  const [milestoneDescription, setMilestoneDescription] = useState('Tir radiographique à 100% sur soudures bout-à-bout haute pression et ressuage sur piquages selon ASME B31.3.');
  const [milestoneLivrable, setMilestoneLivrable] = useState('Rapport d\'interprétation des clichés radiographiques agréé');
  const [milestoneWeight, setMilestoneWeight] = useState<number>(15);
  const [milestoneControlOrg, setMilestoneControlOrg] = useState('Bureau Veritas Algérie');
  const [milestoneSupervisor, setMilestoneSupervisor] = useState('');
  const [milestoneSupervisorContact, setMilestoneSupervisorContact] = useState('');
  const [milestoneSupervisorEmail, setMilestoneSupervisorEmail] = useState('');
  const [milestoneStartDate, setMilestoneStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [milestoneTargetDate, setMilestoneTargetDate] = useState('2026-11-20');
  const [milestoneParticipants, setMilestoneParticipants] = useState<string[]>([
    'Mourad Zitouni (Soudeur Qualifié 6G)',
    'Yacine Khelifi (Superviseur CND)',
    'Tarek Meziani (Gestionnaire Matériel)',
  ]);
  const [milestoneBudgetCost, setMilestoneBudgetCost] = useState<number>(2400000);
  const [milestoneLinkedOrders, setMilestoneLinkedOrders] = useState('BC-2026-0051 - Prestation tirs radiographiques Bureau Veritas');
  const [milestoneExpenses, setMilestoneExpenses] = useState('Films radio argentiques, produits pénétrants/révélateurs PT, carburant 4x4 & groupe');

  // Modales Pratiques : Gestion des Participants au Projet & Imputation des Frais Chantier
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedNewMemberId, setSelectedNewMemberId] = useState('');
  const [showCostModal, setShowCostModal] = useState(false);
  const [costCategory, setCostCategory] = useState('AUTRE');
  const [costAmount, setCostAmount] = useState<number>(250000);
  const [costDescription, setCostDescription] = useState('Frais de mission & hébergement équipe base de vie Hassi Messaoud');

  const applyMilestonePreset = (
    title: string,
    desc: string,
    livrable: string,
    weight: number,
    org: string,
    cost?: number,
    orders?: string,
    expenses?: string,
  ) => {
    setMilestoneTitle(title);
    setMilestoneDescription(desc);
    setMilestoneLivrable(livrable);
    setMilestoneWeight(weight);
    setMilestoneControlOrg(org);
    if (cost !== undefined) setMilestoneBudgetCost(cost);
    if (orders !== undefined) setMilestoneLinkedOrders(orders);
    if (expenses !== undefined) setMilestoneExpenses(expenses);
  };

  // 4. Modal Ordre de Service ODS (Micro-Détaillé & Interconnecté)
  const [showOdsModal, setShowOdsModal] = useState(false);
  const [odsType, setOdsType] = useState<ServiceOrderType>(ServiceOrderType.DEMARRAGE);
  const [odsDate, setOdsDate] = useState(new Date().toISOString().split('T')[0]);
  const [odsDescription, setOdsDescription] = useState('');
  const [odsDelay, setOdsDelay] = useState<number>(0);
  const [odsCostImpact, setOdsCostImpact] = useState<number>(0);
  const [odsClientRef, setOdsClientRef] = useState('');
  const [odsSignatory, setOdsSignatory] = useState('');
  const [odsHseLoto, setOdsHseLoto] = useState(true);
  const [odsHseHotWork, setOdsHseHotWork] = useState(false);
  const [odsHsePermit, setOdsHsePermit] = useState(true);

  const applyOdsPreset = (type: ServiceOrderType) => {
    setOdsType(type);
    if (type === ServiceOrderType.DEMARRAGE) {
      setOdsDescription('Notification officielle de démarrage des travaux sur le site pétrochimique suite à signature du contrat et levée des réserves d\'accès.');
      setOdsDelay(0);
      setOdsCostImpact(0);
      setOdsHsePermit(true);
    } else if (type === ServiceOrderType.ARRET) {
      setOdsDescription('Suspension temporaire des travaux de tuyauterie pour consignation générale LOTO du collecteur gaz et purge azote.');
      setOdsDelay(15);
      setOdsCostImpact(0);
      setOdsHseLoto(true);
    } else if (type === ServiceOrderType.REPRISE) {
      setOdsDescription('Ordre de reprise complète des activités suite à achèvement de la consignation et délivrance du permis de travail tri-partite.');
      setOdsDelay(0);
      setOdsCostImpact(0);
      setOdsHseHotWork(true);
    } else {
      setOdsDescription('Avenant contractuel pour extension de tuyauterie HP (+45 ml) et ajout de deux skids de régulation haute pression.');
      setOdsDelay(21);
      setOdsCostImpact(12500000);
    }
  };

  // 5. Modal Situation de Travaux Périodique (Multi-Lignes, Fiscalité & Interconnecté)
  const [showSituationModal, setShowSituationModal] = useState(false);
  const [sitPeriodStart, setSitPeriodStart] = useState('2026-03-01');
  const [sitPeriodEnd, setSitPeriodEnd] = useState('2026-03-31');
  const [sitPvRef, setSitPvRef] = useState('');
  const [sitInspector, setSitInspector] = useState('');
  const [sitTvaRate, setSitTvaRate] = useState<number>(19);
  const [sitRetenueGarantieRate, setSitRetenueGarantieRate] = useState<number>(5);
  const [sitNotes, setSitNotes] = useState('');

  const [sitLines, setSitLines] = useState<SitLineItem[]>([
    {
      id: '1',
      designation: '',
      unit: 'U',
      contractQty: 1,
      periodQty: 1,
      unitPrice: 0,
    },
  ]);

  const addSitLine = () => {
    setSitLines(prev => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        designation: '',
        unit: 'U',
        contractQty: 1,
        periodQty: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeSitLine = (id: string) => {
    setSitLines(prev => prev.filter(l => l.id !== id));
  };

  const updateSitLine = (id: string, updates: Partial<SitLineItem>) => {
    setSitLines(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const calculatedSitTotalHT = sitLines.reduce((acc, l) => acc + (Number(l.periodQty || 0) * Number(l.unitPrice || 0)), 0);
  const calculatedRetenueGarantie = calculatedSitTotalHT * (sitRetenueGarantieRate / 100);
  const calculatedTVA = calculatedSitTotalHT * (sitTvaRate / 100);
  const calculatedNetTTC = calculatedSitTotalHT - calculatedRetenueGarantie + calculatedTVA;

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>(`/projects/${resolvedParams.code}`);
      setProject(data);
    } catch (err: any) {
      alert(err.message || 'Erreur chargement projet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    api.get<any[]>('/users').then(data => setUsersList(Array.isArray(data) ? data : [])).catch(() => {});
  }, [resolvedParams.code]);

  const handleOpenEdit = () => {
    if (!project) return;
    setEditName(project.name || '');
    setEditClientName(project.clientName || '');
    setEditSiteLocation(project.siteLocation || '');
    setEditSector(project.sector || 'OIL_AND_GAS');
    setEditStatus(project.status || 'IN_PROGRESS');
    setEditRiskLevel(project.riskLevel || 'LOW');
    setEditContractAmount(Number(project.contractAmount || 0));
    setEditBudgetAmount(Number(project.budgetAmount || 0));
    setEditDescription(project.description || '');
    setEditObjectives(project.objectives || '');
    setEditStartDate(project.contractStartDate ? project.contractStartDate.split('T')[0] : (project.startDate ? project.startDate.split('T')[0] : ''));
    setEditContractEndDate(project.contractEndDate ? project.contractEndDate.split('T')[0] : '');
    setEditManagerId(project.managerId || project.manager?.id || '');
    setShowEditModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/projects/${project.id}`, {
        name: editName,
        clientName: editClientName,
        siteLocation: editSiteLocation,
        sector: editSector,
        status: editStatus,
        riskLevel: editRiskLevel,
        contractAmount: Number(editContractAmount),
        budgetAmount: Number(editBudgetAmount),
        description: editDescription,
        objectives: editObjectives,
        contractStartDate: editStartDate ? new Date(editStartDate).toISOString() : undefined,
        contractEndDate: editContractEndDate ? new Date(editContractEndDate).toISOString() : undefined,
        managerId: editManagerId || undefined,
      });
      setShowEditModal(false);
      setNotification('Fiche projet modifiée avec succès dans PostgreSQL !');
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la modification');
    }
  };

  const handleOpenProgress = () => {
    if (!project) return;
    setEditPhysicalProgress(Number(project.physicalProgress || 0));
    setEditFinancialProgress(Number(project.financialProgress || 0));
    setShowProgressModal(true);
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/projects/${project.id}/progress`, {
        physicalProgress: Number(editPhysicalProgress),
        financialProgress: Number(editFinancialProgress),
      });
      setShowProgressModal(false);
      setNotification(`Avancement mis à jour : Physique ${editPhysicalProgress}%, Dépenses ${editFinancialProgress}% !`);
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur avancement');
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const participantsStr = milestoneParticipants.length > 0 ? milestoneParticipants.join(', ') : 'Équipe chantier';
      const delayDays = Math.max(1, Math.ceil((new Date(milestoneTargetDate).getTime() - new Date(milestoneStartDate).getTime()) / (1000 * 3600 * 24)));
      const fullDesc = `${milestoneDescription} | Responsable: ${milestoneSupervisor} (Contact: ${milestoneSupervisorContact}, ${milestoneSupervisorEmail}) | Équipe: ${participantsStr} | Délai: ${delayDays}j | Budget: ${formatCurrencyDA(milestoneBudgetCost, false)} | Commandes: ${milestoneLinkedOrders || 'N/A'} | Frais: ${milestoneExpenses || 'N/A'} | Livrable: ${milestoneLivrable} | Organisme: ${milestoneControlOrg} | Poids: ${milestoneWeight}%`;

      await api.post(`/projects/${project.id}/milestones`, {
        title: milestoneTitle,
        description: fullDesc,
        targetDate: new Date(milestoneTargetDate).toISOString(),
      });
      setShowMilestoneModal(false);
      setNotification(`Jalon "${milestoneTitle}" créé avec succès (${milestoneWeight}% pondération, Responsable: ${milestoneSupervisor}) !`);
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur création jalon');
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!userId) return;
    try {
      await api.post(`/projects/${project.id}/members`, { userId });
      setShowAddMemberModal(false);
      setSelectedNewMemberId('');
      setNotification('Collaborateur affecté avec succès au chantier !');
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur affectation collaborateur');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Retirer ce collaborateur du chantier ?')) return;
    try {
      await api.delete(`/projects/${project.id}/members/${userId}`);
      setNotification('Collaborateur retiré du chantier.');
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur suppression collaborateur');
    }
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costAmount || costAmount <= 0) {
      alert('Veuillez saisir un montant valide');
      return;
    }
    try {
      await api.post(`/projects/${project.id}/costs`, {
        category: costCategory,
        amount: Number(costAmount),
        description: costDescription,
        sourceModule: 'MANUAL',
      });
      setShowCostModal(false);
      setNotification(`Dépense de ${formatCurrencyDA(Number(costAmount), false)} imputée au coût réel du chantier !`);
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur imputation frais');
    }
  };

  const handleValidateMilestone = async (milestoneId: string) => {
    try {
      await api.patch(`/projects/${project.id}/milestones/${milestoneId}`, {
        status: 'COMPLETED',
        completedDate: new Date().toISOString(),
      });
      setNotification('Jalon contractuel validé et marqué franchi ! Recalcul de l\'avancement physique opéré.');
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur validation jalon');
    }
  };

  const handleCreateOds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hseList = [
        odsHseLoto ? 'Consignation LOTO' : null,
        odsHseHotWork ? 'Permis Travail Chaud/Feu' : null,
        odsHsePermit ? 'Permis Tri-Partite' : null,
      ].filter(Boolean).join(', ');

      const fullDesc = `${odsDescription} | Réf Client : ${odsClientRef} | Signataire : ${odsSignatory}${hseList ? ` | HSE : ${hseList}` : ''}`;

      await api.post(`/projects/${project.id}/service-orders`, {
        type: odsType,
        issueDate: odsDate,
        description: fullDesc,
        delayImpactDays: Number(odsDelay || 0),
        costImpactAmount: Number(odsCostImpact || 0),
      });
      setShowOdsModal(false);
      setNotification(`ODS émis avec succès (${odsType}) ! ${odsDelay > 0 ? `Délai contractuel projet ajusté (+${odsDelay}j).` : ''}`);
      setTimeout(() => setNotification(null), 6000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSituation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sitLines.length === 0) {
      alert('Veuillez ajouter au moins une ligne de métré.');
      return;
    }
    try {
      const linesSummary = sitLines
        .map(l => `${l.periodQty} ${l.unit} x ${l.designation} (${formatCurrencyDA(l.periodQty * l.unitPrice, false)})`)
        .join(' ; ');

      const fiscalSummary = `TVA: ${sitTvaRate}% (${formatCurrencyDA(calculatedTVA, false)}) | Retenue Garantie: ${sitRetenueGarantieRate}% (-${formatCurrencyDA(calculatedRetenueGarantie, false)}) | Net TTC: ${formatCurrencyDA(calculatedNetTTC, false)}`;
      const fullNotes = `[MÉTRÉS DÉTAILLÉS] ${linesSummary} | PV Attachement: ${sitPvRef} | Inspecteur Client: ${sitInspector} | ${fiscalSummary} | Observations: ${sitNotes}`;

      await api.post(`/projects/${project.id}/work-situations`, {
        periodStart: sitPeriodStart,
        periodEnd: sitPeriodEnd,
        amountHT: Number(calculatedSitTotalHT),
        notes: fullNotes,
      });
      setShowSituationModal(false);
      setNotification(`Situation de travaux créée (${formatCurrencyDA(calculatedSitTotalHT, false)} HT) et soumise au workflow d'arbitrage DG !`);
      setTimeout(() => setNotification(null), 6000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 space-y-2">
        <Building className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
        <div>Chargement du projet {resolvedParams.code}...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 space-y-3">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <div className="font-bold text-slate-800 text-sm">Projet &quot;{resolvedParams.code}&quot; introuvable</div>
        <p className="text-slate-500">Ce projet n&apos;existe pas dans la base de données vierge.</p>
        <Link href="/projects" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B207D] text-white rounded-lg text-xs font-semibold hover:bg-[#07164D] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des projets</span>
        </Link>
      </div>
    );
  }

  // Calculs financiers analytiques
  const contractAmountNum = Number(project.contractAmount || 0);
  const budgetAmountNum = Number(project.budgetAmount || 0);
  const actualCostNum = Number(project.actualCost || 0);
  const committedCostNum = Number(project.committedCost || 0);

  const plannedMarginDA = contractAmountNum - budgetAmountNum;
  const plannedMarginPct = contractAmountNum > 0 ? ((plannedMarginDA / contractAmountNum) * 100).toFixed(1) : '0';
  const currentMarginDA = contractAmountNum - actualCostNum;
  const currentMarginPct = contractAmountNum > 0 ? ((currentMarginDA / contractAmountNum) * 100).toFixed(1) : '0';

  const budgetConsumedPct = budgetAmountNum > 0 ? ((actualCostNum / budgetAmountNum) * 100).toFixed(1) : '0';

  const totalSituationsHT = (project.workSituations || []).reduce((acc: number, s: any) => acc + Number(s.amountHT || 0), 0);
  const billedPct = contractAmountNum > 0 ? ((totalSituationsHT / contractAmountNum) * 100).toFixed(1) : '0';

  const completedMilestones = (project.milestones || []).filter((m: any) => m.status === 'COMPLETED').length;

  const tabs = [
    { id: 'overview', label: 'Vue d’ensemble' },
    { id: 'planning', label: `Planning & Jalons (${project.milestones?.length || 0})` },
    { id: 'budget', label: 'Budget & Coûts' },
    { id: 'materials', label: `Matériel consommé (${project.allocations?.length || 0})` },
    { id: 'procurement', label: `Achats liés (${project.purchaseOrders?.length || 0})` },
    { id: 'ods', label: `Ordres de Service (${project.serviceOrders?.length || 0})` },
    { id: 'situations', label: `Situations de travaux (${project.workSituations?.length || 0})` },
    { id: 'quality', label: `Qualité & CND (${project.nonConformities?.length || 0})` },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0A7F7C]" />
            <span className="font-medium">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-teal-600 hover:text-teal-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header bar with Back button & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Retour au registre des chantiers"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {project.code}
              </span>
              <StatusBadge status={project.status} type="project" />
              <StatusBadge status={project.riskLevel} type="risk" />
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {project.sector}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#07164D] mt-0.5 flex items-center gap-2">
              {project.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenProgress}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#0B207D] text-[#0B207D] rounded-md hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Gauge className="w-3.5 h-3.5" />
            Ajuster Avancement ({project.physicalProgress}%)
          </button>

          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-md hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Modifier le Projet
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">Client Contractuel</div>
          <div className="text-xs font-bold text-slate-900 mt-1">{project.clientName}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {project.siteLocation}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">Montant Contractuel HT</div>
          <div className="text-xs font-extrabold text-[#07164D] mt-1">{formatCurrencyDA(contractAmountNum, false)}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Budget alloué : <strong className="text-slate-700">{formatCurrencyDA(budgetAmountNum, false)}</strong>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">Coûts Réels Imputés</div>
          <div className="text-xs font-bold text-[#0A7F7C] mt-1">{formatCurrencyDA(actualCostNum, false)}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Engagé : <strong className="text-slate-700">{formatCurrencyDA(committedCostNum, false)}</strong>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider flex items-center justify-between">
            <span>Avancement Physique</span>
            <span className="text-emerald-700 font-bold">{project.physicalProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
            <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${project.physicalProgress}%` }} />
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Dépenses : {budgetConsumedPct}%</span>
            <span>Facturé : {billedPct}%</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-semibold">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === t.id
                ? 'border-[#0B207D] text-[#0B207D] font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VUE D'ENSEMBLE */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Descriptif Technique */}
            <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0B207D]" />
                  Descriptif Technique & Périmètre Contractuel
                </h2>
                <button
                  onClick={handleOpenEdit}
                  className="text-[11px] text-[#0B207D] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3 h-3" />
                  Modifier
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{project.description || 'Aucun descriptif saisi.'}</p>
              {project.objectives && (
                <div className="p-3 bg-blue-50/60 border-l-4 border-[#0B207D] text-xs text-slate-800 rounded-r space-y-1">
                  <strong className="text-[#07164D]">Objectifs stratégiques & exigences HSE :</strong>
                  <div>{project.objectives}</div>
                </div>
              )}
            </div>

            {/* Distinction des 4 avancements découplés */}
            <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-[#0A7F7C]" />
                  Indicateurs Opérationnels Découplés (Exigences SILEX)
                </h2>
                <button
                  onClick={handleOpenProgress}
                  className="text-[11px] text-[#0B207D] font-semibold hover:underline cursor-pointer"
                >
                  Recalibrer
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">1. Avanc. Physique</div>
                  <div className="text-xl font-extrabold text-emerald-700 mt-1">{project.physicalProgress}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Métrés & Soudures</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">2. Avanc. Dépenses</div>
                  <div className="text-xl font-extrabold text-slate-800 mt-1">{budgetConsumedPct}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Coûts / Budget</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">3. Facturation</div>
                  <div className="text-xl font-extrabold text-[#0B207D] mt-1">{billedPct}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Situations validées</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">4. Encaissement</div>
                  <div className="text-xl font-extrabold text-amber-700 mt-1">{project.financialProgress || '20.0'}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Règlements reçus</div>
                </div>
              </div>
            </div>

            {/* Marges & Rentabilité Prévisionnelle */}
            <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-3">
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Marge & Rentabilité Projet
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Marge Cible Initiale</div>
                  <div className="text-base font-extrabold text-emerald-900 mt-0.5">
                    {formatCurrencyDA(plannedMarginDA, false)} ({plannedMarginPct}%)
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">
                    Calcul : Montant Contractuel - Budget alloué
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="text-[10px] uppercase font-bold text-[#0B207D]">Marge Actuelle Estimée</div>
                  <div className="text-base font-extrabold text-[#07164D] mt-0.5">
                    {formatCurrencyDA(currentMarginDA, false)} ({currentMarginPct}%)
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    Calcul : Montant Contractuel - Dépenses réelles
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Responsable, Équipe & Dates */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#0B207D]" />
                  Responsable & Équipe Chantier
                </h2>
                <button
                  onClick={handleOpenManagerModal}
                  className="text-[11px] text-[#0B207D] font-semibold hover:underline cursor-pointer"
                >
                  Changer
                </button>
              </div>

              {/* Fiche Responsable & Contacts Directs */}
              {project.manager ? (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0B207D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {project.manager.name ? project.manager.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'RP'}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 truncate">{project.manager.name}</div>
                      <div className="text-[11px] text-[#0A7F7C] font-semibold">{project.manager.title || (project.manager.role ? project.manager.role.replace(/_/g, ' ') : 'Responsable Projet')}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                    {project.manager.phone && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${project.manager.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] text-[#0B207D] font-bold hover:underline"
                        >
                          <Phone className="w-3 h-3 text-[#0A7F7C]" />
                          {project.manager.phone}
                        </a>
                      </div>
                    )}
                    {project.manager.email && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${project.manager.email}`}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 truncate"
                        >
                          <Mail className="w-3 h-3 text-slate-400" />
                          {project.manager.email}
                        </a>
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      Base Opérationnelle : {project.siteLocation || 'Site Industriel Algérie'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center font-bold text-xs">
                    NR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Aucun Responsable Assigné</div>
                    <div className="text-[11px] text-slate-500">Veuillez désigner le Chef de Projet / Responsable Chantier.</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenManagerModal}
                    className="px-3 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded hover:bg-[#07164D] transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <User className="w-3.5 h-3.5" />
                    + Désigner le Responsable
                  </button>
                </div>
              )}

              {/* Équipe participante & Bouton Affecter */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0B207D]" />
                    Participants au Projet ({project.assignedUsers?.length || 0}) :
                  </div>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="text-[11px] font-bold text-[#0B207D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Affecter
                  </button>
                </div>

                {(!project.assignedUsers || project.assignedUsers.length === 0) ? (
                  <div className="p-2.5 bg-slate-50 rounded border border-dashed border-slate-200 text-center text-[11px] text-slate-500">
                    Aucun collaborateur spécifique affecté.
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="block mx-auto mt-1 text-[#0B207D] font-bold hover:underline"
                    >
                      + Ajouter le premier intervenant
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(Array.isArray(project.assignedUsers) ? project.assignedUsers : []).map((a: any) => (
                      <div
                        key={a.id || a.userId}
                        className="text-xs flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        <div className="overflow-hidden">
                          <span className="font-semibold text-slate-800 block truncate">{a.user?.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{a.user?.role}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(a.userId || a.user?.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                          title="Retirer ce collaborateur du chantier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dates Contractuelles & Calcul Délai */}
            <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0B207D]" />
                  Dates Contractuelles & Délais
                </h2>
                <button
                  onClick={handleOpenDatesModal}
                  className="text-[11px] text-[#0B207D] font-semibold hover:underline cursor-pointer"
                >
                  Modifier
                </button>
              </div>

              {(() => {
                const daysRemaining = Math.ceil(
                  (new Date(project.contractEndDate).getTime() - Date.now()) / (1000 * 3600 * 24)
                );
                return (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Date de notification :</span>
                      <strong className="text-slate-800">{formatDateDZ(project.startDate || project.contractStartDate)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Fin contractuelle :</span>
                      <strong className="text-slate-800">{formatDateDZ(project.contractEndDate)}</strong>
                    </div>

                    {daysRemaining > 0 ? (
                      <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-[11px] text-emerald-800 font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" /> Délai Restant
                        </span>
                        <span>{daysRemaining} jours (Dans les temps)</span>
                      </div>
                    ) : (
                      <div className="p-2 bg-red-50 rounded border border-red-200 text-[11px] text-red-800 font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Dépassement Délai
                        </span>
                        <span>+{Math.abs(daysRemaining)} jours de retard</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Actions rapides */}
            <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-2">
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider">Actions Rapides</h2>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  onClick={() => setShowMilestoneModal(true)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-[#0B207D]" /> Nouveau Jalon Contractuel</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => setShowOdsModal(true)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-[#0A7F7C]" /> Émettre un Ordre de Service (ODS)</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => setShowSituationModal(true)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-blue-700" /> Créer une Situation de Travaux</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PLANNING & JALONS */}
      {/* ========================================================================= */}
      {activeTab === 'planning' && (
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0B207D]" />
                Planning Opérationnel & Jalons Contractuels
              </h2>
              <p className="text-[11px] text-slate-500">
                Suivi des étapes clés : Épreuves hydrostatiques, CND, réceptions intermédiaires et livrables.
              </p>
            </div>
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded hover:bg-[#07164D] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau Jalon Contractuel
            </button>
          </div>

          {/* Progress bar jalons */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs font-semibold text-slate-800">
              Avancement des Jalons : <strong>{completedMilestones}</strong> sur {project.milestones?.length || 0} validé(s)
            </div>
            <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{
                  width: `${project.milestones?.length > 0 ? (completedMilestones / project.milestones.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {project.milestones?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-semibold text-slate-700">Aucun jalon contractuel n'a été défini pour ce projet.</div>
                <button
                  onClick={() => setShowMilestoneModal(true)}
                  className="px-3 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Créer le premier jalon
                </button>
              </div>
            ) : (
              project.milestones?.map((m: any, idx: number) => {
                const isCompleted = m.status === 'COMPLETED';
                return (
                  <div
                    key={m.id}
                    className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{m.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      {m.description && <div className="text-xs text-slate-600 font-medium">{m.description}</div>}
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>Cible : <strong>{formatDateDZ(m.targetDate)}</strong></span>
                        {m.completedDate && (
                          <span className="text-emerald-700 font-semibold">• Réalisé le {formatDateDZ(m.completedDate)}</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {!isCompleted ? (
                        <button
                          onClick={() => handleValidateMilestone(m.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Marquer Franchi
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Conforme
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BUDGET & COÛTS ANALYTIQUES */}
      {/* ========================================================================= */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Montant Contractuel Vendu (HT)</div>
              <div className="text-base font-extrabold text-[#07164D] mt-1">{formatCurrencyDA(contractAmountNum, false)}</div>
              <div className="text-[10px] text-slate-400 mt-1">Facturation maximale contractuelle</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Budget Débours Max Alloué</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">{formatCurrencyDA(budgetAmountNum, false)}</div>
              <div className="text-[10px] text-slate-400 mt-1">Plafond budgétaire validé par la DG</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Coûts Réels Imputés</div>
              <div className="text-base font-extrabold text-[#0A7F7C] mt-1">{formatCurrencyDA(actualCostNum, false)}</div>
              <div className="text-[10px] text-slate-400 mt-1">Matières déstockées + Main d'œuvre</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Engagements Fournisseurs</div>
              <div className="text-base font-extrabold text-amber-700 mt-1">{formatCurrencyDA(committedCostNum, false)}</div>
              <div className="text-[10px] text-slate-400 mt-1">Bons de commande émis non soldés</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
              Consommation Budgétaire & Écart Analytique
            </h2>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Consommé : {formatCurrencyDA(actualCostNum, false)} ({budgetConsumedPct}%)</span>
                <span>Reliquat budgétaire disponible : {formatCurrencyDA(Math.max(0, budgetAmountNum - actualCostNum), false)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    Number(budgetConsumedPct) > 90 ? 'bg-red-500' : Number(budgetConsumedPct) > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, Number(budgetConsumedPct))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Journal Analytique des Écritures */}
          <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
                  Journal Analytique des Coûts & Frais Chantier ({project.costEntries?.length || 0} écritures)
                </h3>
                <span className="text-[10px] text-slate-500">Mise à jour en direct du coût réel et de la marge</span>
              </div>
              <button
                onClick={() => setShowCostModal(true)}
                className="px-3 py-1.5 bg-[#0A7F7C] hover:bg-[#075957] text-white text-xs font-semibold rounded cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Imputer une Dépense / Frais Chantier
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {!project.costEntries || project.costEntries.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Aucune écriture de coût direct enregistrée. Les coûts sont consolidés depuis les sorties de stocks et commandes fournisseurs.
                </div>
              ) : (
                (Array.isArray(project.costEntries) ? project.costEntries : []).map((ce: any) => (
                  <div key={ce.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">{ce.description || 'Imputation analytique'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Catégorie : <strong>{ce.category}</strong> • Date : {formatDateDZ(ce.recordedAt)} • Réf : {ce.reference || 'Auto-Généré'}
                      </div>
                    </div>
                    <div className="text-right font-extrabold text-[#07164D]">
                      {formatCurrencyDA(ce.amount, false)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MATÉRIAUX CONSOMMÉS */}
      {/* ========================================================================= */}
      {activeTab === 'materials' && (
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-[#0B207D]" />
                Sorties Magasins & Matériaux Affectés au Chantier ({project.allocations?.length || 0})
              </h2>
              <p className="text-[11px] text-slate-500">Matériel imputé directement depuis le ledger d'inventaire central et avancé.</p>
            </div>
          </div>

          <div className="space-y-2">
            {project.allocations?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Boxes className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-semibold text-slate-700">Aucune sortie de matériel enregistrée pour ce chantier.</div>
                <div className="text-[11px] text-slate-400">Rendez-vous dans le module Stock & Approvisionnement pour allouer du matériel.</div>
              </div>
            ) : (
              project.allocations?.map((al: any) => (
                <div key={al.id} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <Link
                      href="/inventory"
                      className="font-mono font-bold text-[#0B207D] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 inline-flex items-center gap-1 group"
                      title="Consulter l'article dans le stock central"
                    >
                      {al.item?.code}
                      <ExternalLink className="w-2.5 h-2.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                    </Link>{' '}
                    <span className="font-bold text-slate-900 ml-1">{al.item?.name}</span>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Magasin source :{' '}
                      <Link
                        href="/inventory"
                        className="font-semibold text-slate-700 hover:text-[#0B207D] hover:underline"
                      >
                        {al.warehouse?.name}
                      </Link>{' '}
                      • Zone / Iso : <strong>{al.workZone || 'Chantier Principal'}</strong> • Date : {formatDateDZ(al.allocatedAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#0A7F7C] text-sm">{al.quantity} {al.item?.unit}</div>
                    <div className="text-[11px] text-slate-600 font-extrabold">{formatCurrencyDA(al.totalCost, false)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ACHATS LIÉS */}
      {/* ========================================================================= */}
      {activeTab === 'procurement' && (
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-[#0B207D]" />
                Commandes Fournisseurs (BC) & Demandes d'Achat (DA)
              </h2>
              <p className="text-[11px] text-slate-500">Traçabilité des engagements achats rattachés à ce code projet.</p>
            </div>
            <Link
              href="/procurement"
              className="text-xs font-semibold text-[#0B207D] hover:underline flex items-center gap-1"
            >
              Ouvrir Module Achats <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!project.purchaseOrders || project.purchaseOrders.length === 0) && (!project.purchaseRequests || project.purchaseRequests.length === 0) ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-semibold text-slate-700">Aucune commande ni demande d'achat rattachée à ce projet.</div>
              </div>
            ) : (
              <>
                {project.purchaseOrders?.map((po: any) => (
                  <div key={po.id} className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href="/procurement"
                          className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 inline-flex items-center gap-1 group"
                          title="Consulter ce bon de commande dans le module Achats"
                        >
                          {po.poNumber}
                          <ExternalLink className="w-2.5 h-2.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                        </Link>
                        <span className="text-xs font-bold text-slate-900">
                          Fournisseur : {po.supplier?.name}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {po.status}
                        </span>
                      </div>
                      <div className="text-right font-extrabold text-xs text-[#07164D]">
                        {formatCurrencyDA(po.totalAmountHT, false)} HT
                      </div>
                    </div>
                    {po.lines && po.lines.length > 0 && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        {(Array.isArray(po.lines) ? po.lines : []).map((l: any, i: number) => (
                          <div key={i} className="flex justify-between py-0.5">
                            <span>• {l.quantity}x {l.item?.name || 'Fourniture industrielle'}</span>
                            <span className="font-medium">{formatCurrencyDA(l.totalPrice, false)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {project.purchaseRequests?.map((pr: any) => (
                  <div key={pr.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/procurement"
                          className="font-mono text-xs font-bold text-slate-700 hover:text-[#0B207D] bg-slate-200 hover:bg-blue-50 px-2 py-0.5 rounded inline-flex items-center gap-1 group border border-transparent hover:border-blue-200 transition-colors"
                          title="Consulter cette demande d'achat dans le module Achats"
                        >
                          {pr.requestNumber}
                          <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover:text-blue-500 opacity-60 group-hover:opacity-100" />
                        </Link>
                        <span className="font-semibold text-slate-900">{pr.description}</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {pr.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Demandeur : {pr.createdBy?.name} • Créé le {formatDateDZ(pr.createdAt)}
                      </div>
                    </div>
                    <div className="text-right font-bold text-slate-800">
                      {formatCurrencyDA(pr.estimatedAmountHT, false)}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ORDRES DE SERVICE (ODS) */}
      {/* ========================================================================= */}
      {activeTab === 'ods' && (
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0B207D]" />
                Ordres de Service (ODS) Juridiques & Contractuels ({project.serviceOrders?.length || 0})
              </h2>
              <p className="text-[11px] text-slate-500">Traçabilité juridique : Démarrage, Arrêt, Reprise, Modification Périmètre.</p>
            </div>
            <button
              onClick={() => {
                applyOdsPreset(ServiceOrderType.DEMARRAGE);
                setShowOdsModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded hover:bg-[#07164D] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Émettre un ODS
            </button>
          </div>

          <div className="space-y-3">
            {project.serviceOrders?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-semibold text-slate-700">Aucun Ordre de Service notifié pour ce chantier.</div>
              </div>
            ) : (
              project.serviceOrders?.map((ods: any) => (
                <div key={ods.id} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {ods.orderNumber}
                      </span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                        {ods.type}
                      </span>
                      <span className="text-[11px] text-slate-500">Notifié le {formatDateDZ(ods.issueDate)}</span>
                    </div>
                    <div className="text-xs text-slate-800 mt-1 font-medium">{ods.description}</div>
                    <div className="flex items-center gap-3 mt-1 text-[11px]">
                      {ods.delayImpactDays > 0 && (
                        <span className="text-amber-700 font-semibold">
                          Impact sur délai : +{ods.delayImpactDays} jours
                        </span>
                      )}
                      {Number(ods.costImpactAmount || 0) > 0 && (
                        <span className="text-emerald-700 font-semibold">
                          Impact financier : +{formatCurrencyDA(ods.costImpactAmount, false)} HT
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {ods.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SITUATIONS DE TRAVAUX */}
      {/* ========================================================================= */}
      {activeTab === 'situations' && (
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#0B207D]" />
                Situations Périodiques de Travaux & Décomptes ({project.workSituations?.length || 0})
              </h2>
              <p className="text-[11px] text-slate-500">Métrés contradictoires soumis à vérification et facturation client.</p>
            </div>
            <button
              onClick={() => setShowSituationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded hover:bg-[#07164D] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Créer une Situation
            </button>
          </div>

          <div className="space-y-3">
            {project.workSituations?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-semibold text-slate-700">Aucune situation périodique enregistrée.</div>
              </div>
            ) : (
              project.workSituations?.map((sit: any) => (
                <div key={sit.id} className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {sit.situationNumber}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                        {sit.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        Période : {formatDateDZ(sit.periodStart)} au {formatDateDZ(sit.periodEnd)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 mt-1 font-medium">
                      <em>{sit.notes}</em>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-extrabold text-[#07164D]">{formatCurrencyDA(sit.amountHT, false)} HT</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Cumul : {formatCurrencyDA(sit.cumulativeAmountHT, false)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: QUALITÉ, DMOS & CND */}
      {/* ========================================================================= */}
      {activeTab === 'quality' && (
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0B207D]" />
                Qualité, Non-Conformités (FNC) & Contrôles CND ({project.nonConformities?.length || 0})
              </h2>
              <p className="text-[11px] text-slate-500">
                Suivi des fiches d'anomalies, contrôles radiographiques/ressuage et actions correctives.
              </p>
            </div>
            <Link
              href="/quality"
              className="text-xs font-semibold text-[#0B207D] hover:underline flex items-center gap-1"
            >
              Ouvrir Module Qualité <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {project.nonConformities?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-semibold text-emerald-800">Aucune Non-Conformité majeure signalée. Chantier 100% conforme.</div>
              </div>
            ) : (
              project.nonConformities?.map((fnc: any) => (
                <div key={fnc.id} className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href="/quality"
                        className="font-mono text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200 inline-flex items-center gap-1 group"
                        title="Consulter la fiche FNC dans le module Qualité & CND"
                      >
                        {fnc.fncNumber}
                        <ExternalLink className="w-2.5 h-2.5 text-red-500 opacity-60 group-hover:opacity-100" />
                      </Link>
                      <span className="text-xs font-bold text-slate-900">{fnc.title}</span>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        {fnc.severity}
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {fnc.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Détectée le {formatDateDZ(fnc.detectedDate)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-700 font-medium">{fnc.description}</div>
                  {fnc.actions && fnc.actions.length > 0 && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                      <div className="font-bold text-slate-800">Actions Correctives :</div>
                      {(Array.isArray(fnc.actions) ? fnc.actions : []).map((act: any, i: number) => (
                        <div key={i}>• {act.actionText} ({act.status})</div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE 1 : MODIFIER LE PROJET */}
      {/* ========================================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#0B207D]" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#07164D]">
                    Modifier la Fiche du Projet : {project.code}
                  </h3>
                  <p className="text-[11px] text-slate-500">Mise à jour des données contractuelles, budgétaires et techniques.</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Intitulé du Projet *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client Contractuel *</label>
                  <input
                    type="text"
                    value={editClientName}
                    onChange={e => setEditClientName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Localisation / Site *</label>
                  <input
                    type="text"
                    value={editSiteLocation}
                    onChange={e => setEditSiteLocation(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Secteur Industriel *</label>
                  <select
                    value={editSector}
                    onChange={e => setEditSector(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-medium"
                  >
                    {SECTORS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Statut *</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-semibold"
                  >
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Niveau de Risque *</label>
                  <select
                    value={editRiskLevel}
                    onChange={e => setEditRiskLevel(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-semibold"
                  >
                    {RISK_LEVELS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Montant Contractuel HT (DA) *</label>
                  <input
                    type="number"
                    value={editContractAmount}
                    onChange={e => setEditContractAmount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Budget Max Alloué HT (DA) *</label>
                  <input
                    type="number"
                    value={editBudgetAmount}
                    onChange={e => setEditBudgetAmount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date Notification / Démarrage</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={e => setEditStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fin Contractuelle</label>
                  <input
                    type="date"
                    value={editContractEndDate}
                    onChange={e => setEditContractEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chef de Projet Responsable</label>
                  <select
                    value={editManagerId}
                    onChange={e => setEditManagerId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-medium"
                  >
                    <option value="">Sélectionner un responsable...</option>
                    {(Array.isArray(usersList) ? usersList : []).map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Descriptif Technique du Périmètre</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Objectifs Stratégiques & HSE</label>
                <textarea
                  rows={2}
                  value={editObjectives}
                  onChange={e => setEditObjectives(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE 2 : AJUSTER L'AVANCEMENT */}
      {/* ========================================================================= */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#07164D] flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#0B207D]" />
                Ajuster les Avancements Découplés
              </h3>
              <button onClick={() => setShowProgressModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Avancement Physique (Métrés & Soudures)</span>
                  <span className="font-extrabold text-emerald-700">{editPhysicalProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={editPhysicalProgress}
                  onChange={e => setEditPhysicalProgress(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={editPhysicalProgress}
                  onChange={e => setEditPhysicalProgress(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full mt-1.5 p-2 border border-slate-300 rounded font-bold text-slate-900"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Avancement Dépenses / Financier</span>
                  <span className="font-extrabold text-[#0B207D]">{editFinancialProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={editFinancialProgress}
                  onChange={e => setEditFinancialProgress(Number(e.target.value))}
                  className="w-full accent-[#0B207D] cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={editFinancialProgress}
                  onChange={e => setEditFinancialProgress(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full mt-1.5 p-2 border border-slate-300 rounded font-bold text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Appliquer les Avancements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE 3 : AJOUTER UN JALON CONTRACTUEL (MICRO-DÉTAILLÉ & INTERCONNECTÉ) */}
      {/* ========================================================================= */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#0B207D]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#07164D]">
                    Définir un Jalon Contractuel Déterminant
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Interconnexion directe avec l'avancement physique et les réceptions réglementaires.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowMilestoneModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Industriels 1 Clic */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Préréglages d'étapes industrielles chantiers (1 clic) :
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    applyMilestonePreset(
                      'Épreuve hydrostatique réseau HP 150 bars sous contrôle APAVE',
                      'Mise en pression d\'épreuve hydrostatique à froid (150 bars) avec maintien de pression 4 heures sous PV contradictoire Bureau Veritas et Sonatrach DP.',
                      'PV d\'épreuve hydrostatique certifié conforme et signé',
                      25,
                      'APAVE Algérie'
                    )
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-[#0B207D] border border-blue-200 rounded cursor-pointer transition-colors"
                >
                  Épreuve Hydro 150B
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyMilestonePreset(
                      'Préfabrication 50% spools tuyauterie HP en atelier',
                      'Assemblage, soudage TIG/SMAW et traçage de 50% des lignes de tuyauterie 6" et 10" avec CCPU 3.1 certifiés.',
                      'Fiches suiveuses de soudage et rapport dimensionnel atelier',
                      20,
                      'Contrôle Interne SILEX'
                    )
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded cursor-pointer transition-colors"
                >
                  Préfab Spools 50%
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyMilestonePreset(
                      'Contrôles Non Destructifs 100% Radio (RT) & Ressuage (PT)',
                      'Tir radiographique à 100% sur soudures bout-à-bout haute pression et ressuage sur piquages selon ASME B31.3.',
                      'Rapport d\'interprétation des clichés radiographiques agréé',
                      15,
                      'Bureau Veritas Algérie'
                    )
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded cursor-pointer transition-colors"
                >
                  Contrôle CND 100%
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyMilestonePreset(
                      'Homologation DMOS & Qualifications Soudeurs ASME IX',
                      'Cahier de soudage approuvé par le client et qualifications de soudage 6G délivrées aux tuyauteurs-soudeurs.',
                      'Certificats CQS soudeurs validés Bureau Veritas',
                      10,
                      'Bureau Veritas Algérie'
                    )
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded cursor-pointer transition-colors"
                >
                  Homologation DMOS
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyMilestonePreset(
                      'Réception Provisoire des Travaux & Levée des Réserves',
                      'Visite contradictoire du chantier avec la commission Sonatrach DP, vérification des skids et signature du PV de réception provisoire.',
                      'Procès-Verbal de Réception Provisoire (PVRP) sans réserves',
                      30,
                      'Commission Sonatrach / Client'
                    )
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded cursor-pointer transition-colors"
                >
                  Réception Provisoire
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs">
              {/* Intitulé & Description */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Intitulé du Jalon Contractuel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={milestoneTitle}
                  onChange={e => setMilestoneTitle(e.target.value)}
                  placeholder="ex: Contrôles Non Destructifs 100% Radio (RT) & Ressuage (PT)"
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-[#0B207D]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Critères d'Acceptation & Modalités d'Exécution
                </label>
                <textarea
                  rows={2}
                  value={milestoneDescription}
                  onChange={e => setMilestoneDescription(e.target.value)}
                  placeholder="ex: Tir radiographique à 100% sur soudures bout-à-bout haute pression..."
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              {/* BLOC PRATIQUE 1 : RESPONSABLE ET CONTACT DIRECT */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-[#07164D] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#0B207D]" />
                    Responsable du Jalon & Coordonnées Directes
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Contact joignable sur site</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Sélectionner le Responsable
                    </label>
                    <select
                      value={milestoneSupervisor}
                      onChange={e => {
                        const val = e.target.value;
                        setMilestoneSupervisor(val);
                        const found = (Array.isArray(usersList) ? usersList : []).find(u => `${u.name} (${u.title || u.role})` === val || u.name === val);
                        if (found) {
                          setMilestoneSupervisorEmail(found.email);
                          setMilestoneSupervisorContact('+213 (0) 560 21 88 44');
                        }
                      }}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                    >
                      <option value="Sofiane Belkacem (Ingénieur Chef de Chantier SILEX)">Sofiane Belkacem (Chef de Chantier)</option>
                      <option value="Yacine Khelifi (Superviseur CND & Soudage)">Yacine Khelifi (Superviseur CND)</option>
                      <option value="Karim Mansouri (Directeur Technique)">Karim Mansouri (Directeur Technique)</option>
                      <option value="Nadia Chaib (Responsable QHSE)">Nadia Chaib (Responsable QHSE)</option>
                      {(Array.isArray(usersList) ? usersList : []).map(u => (
                        <option key={u.id} value={`${u.name} (${u.title || u.role})`}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#0A7F7C]" />
                      Numéro de Téléphone Direct *
                    </label>
                    <input
                      type="text"
                      value={milestoneSupervisorContact}
                      onChange={e => setMilestoneSupervisorContact(e.target.value)}
                      placeholder="ex: +213 (0) 560 21 88 44"
                      className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      Email Professionnel *
                    </label>
                    <input
                      type="email"
                      value={milestoneSupervisorEmail}
                      onChange={e => setMilestoneSupervisorEmail(e.target.value)}
                      placeholder="ex: s.belkacem@silex-services.dz"
                      className="w-full p-2 border border-slate-300 rounded text-slate-900 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* BLOC PRATIQUE 2 : QUI VA PARTICIPER AU PROJET / JALON */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0B207D]" />
                    Qui va participer à ce Jalon (Équipe Terrain) :
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {milestoneParticipants.length} intervenant(s) sélectionné(s)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[
                    'Mourad Zitouni (Soudeur Qualifié 6G)',
                    'Yacine Khelifi (Superviseur CND)',
                    'Tarek Meziani (Gestionnaire Matériel)',
                    'Amina Benali (Acheteuse Industrielle)',
                    'Samira Haddad (Gestion RH Chantier)',
                    'Technicien CND Radio (Bureau Veritas)',
                  ].map(p => {
                    const isSelected = milestoneParticipants.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setMilestoneParticipants(prev => prev.filter(x => x !== p));
                          } else {
                            setMilestoneParticipants(prev => [...prev, p]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors border flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#0B207D] text-white border-[#0B207D]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BLOC PRATIQUE 3 : DÉLAIS & PLANNING OPÉRATIONNEL */}
              {(() => {
                const delayDays = Math.max(
                  1,
                  Math.ceil(
                    (new Date(milestoneTargetDate).getTime() - new Date(milestoneStartDate).getTime()) /
                      (1000 * 3600 * 24)
                  )
                );
                return (
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold text-[#07164D] uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#0B207D]" />
                        Délai & Calendrier d'Exécution
                      </span>
                      <span className="text-xs font-extrabold text-[#0B207D] bg-blue-100 px-2 py-0.5 rounded">
                        Délai imparti : {delayDays} jours calendaires
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Date de Début Prévue
                        </label>
                        <input
                          type="date"
                          value={milestoneStartDate}
                          onChange={e => setMilestoneStartDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Date Cible Contractuelle *
                        </label>
                        <input
                          type="date"
                          value={milestoneTargetDate}
                          onChange={e => setMilestoneTargetDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded font-bold text-[#07164D] bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* BLOC PRATIQUE 4 : COÛTS, COMMANDES & FRAIS UTILISÉS */}
              <div className="p-3.5 bg-blue-50/40 rounded-lg border border-blue-200 space-y-3">
                <div className="text-[11px] font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-[#0A7F7C]" />
                  Budget Alloué, Commandes d'Achats & Frais Utilisés
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Coût / Budget Prévu Alloué (DA HT)
                    </label>
                    <input
                      type="number"
                      value={milestoneBudgetCost}
                      onChange={e => setMilestoneBudgetCost(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900 bg-white"
                      placeholder="ex: 2400000"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Soit : <strong>{formatCurrencyDA(milestoneBudgetCost, false)}</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Commandes d'Achats / Bons de Commande Liés
                    </label>
                    <input
                      type="text"
                      value={milestoneLinkedOrders}
                      onChange={e => setMilestoneLinkedOrders(e.target.value)}
                      placeholder="ex: BC-2026-0051 (Prestation Radio Bureau Veritas)"
                      className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Réf. BC ou DA du chantier
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Frais de Chantier & Consommables Utilisés
                  </label>
                  <input
                    type="text"
                    value={milestoneExpenses}
                    onChange={e => setMilestoneExpenses(e.target.value)}
                    placeholder="ex: Films radio argentiques, produits ressuage, carburant 4x4, hébergement base de vie"
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* Livrable & Organisme Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Poids Avancement (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={milestoneWeight}
                    onChange={e => setMilestoneWeight(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Organisme Tiers de Contrôle
                  </label>
                  <input
                    type="text"
                    value={milestoneControlOrg}
                    onChange={e => setMilestoneControlOrg(e.target.value)}
                    placeholder="ex: Bureau Veritas Algérie"
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Livrable / Document Contractuel Exigé *
                </label>
                <input
                  type="text"
                  value={milestoneLivrable}
                  onChange={e => setMilestoneLivrable(e.target.value)}
                  placeholder="ex: Rapport d'interprétation des clichés radiographiques agréé"
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 text-[11px] text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#0B207D]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Interconnexion Automatique :
                </div>
                <div>
                  La validation de ce jalon recalculera immédiatement le pourcentage d'avancement physique du projet dans PostgreSQL et mettra à jour l'ensemble des tableaux de bord.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Valider & Interconnecter ce Jalon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE PRATIQUE : AFFECTER UN PARTICIPANT AU PROJET */}
      {/* ========================================================================= */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0B207D]" />
                <h3 className="text-sm font-bold text-[#07164D]">Affecter un Collaborateur au Chantier</h3>
              </div>
              <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Sélectionner le Collaborateur SILEX
                </label>
                <select
                  value={selectedNewMemberId}
                  onChange={e => setSelectedNewMemberId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                >
                  <option value="">-- Choisir un intervenant --</option>
                  {(Array.isArray(usersList) ? usersList : [])
                    .filter(u => !(project.assignedUsers || []).some((a: any) => a.userId === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.title || u.role} ({u.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div>Le collaborateur aura accès au suivi opérationnel, aux pointages et aux ordres de service de ce chantier.</div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!selectedNewMemberId}
                  onClick={() => handleAddMember(selectedNewMemberId)}
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] disabled:opacity-50 cursor-pointer"
                >
                  Confirmer l'Affectation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE PRATIQUE : IMPUTER UNE DÉPENSE / FRAIS DE CHANTIER DANS POSTGRES */}
      {/* ========================================================================= */}
      {showCostModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#0A7F7C]" />
                <h3 className="text-sm font-bold text-[#07164D]">Imputer un Frais / Dépense de Chantier</h3>
              </div>
              <button onClick={() => setShowCostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCost} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Catégorie de Dépense</label>
                <select
                  value={costCategory}
                  onChange={e => setCostCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                >
                  <option value="AUTRE">Frais de Mission & Hébergement Base de Vie</option>
                  <option value="CARBURANT">Carburant, Groupes & Énergie</option>
                  <option value="MATERIEL">Fournitures & Consommables Tuyauterie</option>
                  <option value="SOUS_TRAITANCE">Sous-Traitance & Contrôles CND</option>
                  <option value="MAIN_OEUVRE">Main-d'Œuvre & Débours Directs</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Montant Débours Réel (DA HT) *</label>
                <input
                  type="number"
                  value={costAmount}
                  onChange={e => setCostAmount(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
                  placeholder="ex: 250000"
                  required
                />
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Montant : <strong>{formatCurrencyDA(costAmount, false)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description / Justificatif *</label>
                <textarea
                  rows={2}
                  value={costDescription}
                  onChange={e => setCostDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                  placeholder="ex: Facture hôtel & restauration équipe base de vie Hassi Messaoud..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCostModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0A7F7C] text-white font-semibold rounded hover:bg-[#075957] cursor-pointer shadow-xs"
                >
                  Imputer au Coût Réel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE 4 : ÉMISSION ORDRE DE SERVICE (ODS DÉTAILLÉ & IMPACT CONTRACTUEL) */}
      {/* ========================================================================= */}
      {showOdsModal && (() => {
        const currentEnd = project.contractEndDate ? new Date(project.contractEndDate) : new Date();
        const projectedEnd = new Date(currentEnd.getTime() + (Number(odsDelay || 0) * 24 * 60 * 60 * 1000));
        const projectedContractAmount = contractAmountNum + Number(odsCostImpact || 0);

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
            <div className="bg-white rounded-xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#0B207D]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#07164D]">
                      Émettre un Ordre de Service (ODS) Officiel
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Notification contractuelle ayant valeur juridique d'attachement au marché.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowOdsModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sélecteur de type en boutons interactifs */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nature de l'Ordre de Service * :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyOdsPreset(ServiceOrderType.DEMARRAGE)}
                    className={`p-2 rounded-lg border text-left text-xs font-semibold cursor-pointer transition-all ${
                      odsType === ServiceOrderType.DEMARRAGE
                        ? 'bg-blue-50 border-[#0B207D] text-[#0B207D] shadow-2xs ring-1 ring-[#0B207D]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    1. Démarrage
                  </button>
                  <button
                    type="button"
                    onClick={() => applyOdsPreset(ServiceOrderType.ARRET)}
                    className={`p-2 rounded-lg border text-left text-xs font-semibold cursor-pointer transition-all ${
                      odsType === ServiceOrderType.ARRET
                        ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs ring-1 ring-amber-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    2. Arrêt / Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => applyOdsPreset(ServiceOrderType.REPRISE)}
                    className={`p-2 rounded-lg border text-left text-xs font-semibold cursor-pointer transition-all ${
                      odsType === ServiceOrderType.REPRISE
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-2xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    3. Reprise
                  </button>
                  <button
                    type="button"
                    onClick={() => applyOdsPreset(ServiceOrderType.MODIFICATION_PERIMETRE)}
                    className={`p-2 rounded-lg border text-left text-xs font-semibold cursor-pointer transition-all ${
                      odsType === ServiceOrderType.MODIFICATION_PERIMETRE
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-2xs ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    4. Avenant
                  </button>
                </div>
              </div>

              {/* Simulation en direct de l'impact contractuel */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-[#07164D] flex items-center justify-between">
                  <span>Impacts Contractuels Immédiats (Interconnexion Projet) :</span>
                  {odsDelay !== 0 && (
                    <span className="text-amber-800 font-extrabold bg-amber-100 px-2 py-0.5 rounded">
                      +{odsDelay} jours
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Fin Contractuelle :</span>{' '}
                    <strong className="text-slate-800">{formatDateDZ(project.contractEndDate)}</strong>
                    {odsDelay !== 0 && (
                      <span className="text-amber-700 font-bold block mt-0.5">
                        ↳ Projetée au : {formatDateDZ(projectedEnd)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Montant Contractuel :</span>{' '}
                    <strong className="text-slate-800">{formatCurrencyDA(contractAmountNum, false)}</strong>
                    {odsCostImpact !== 0 && (
                      <span className="text-emerald-700 font-bold block mt-0.5">
                        ↳ Avenant : {formatCurrencyDA(projectedContractAmount, false)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateOds} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Date d’Effet Officielle *
                    </label>
                    <input
                      type="date"
                      value={odsDate}
                      onChange={e => setOdsDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Réf. Lettre ou PV Client (Sonatrach)
                    </label>
                    <input
                      type="text"
                      value={odsClientRef}
                      onChange={e => setOdsClientRef(e.target.value)}
                      placeholder="ex: LETTRE-SONATRACH-DP-2026-192"
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Description Juridique & Motifs Contractuels *
                  </label>
                  <textarea
                    value={odsDescription}
                    onChange={e => setOdsDescription(e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-[#0B207D]"
                    placeholder="ex: Notification officielle d'arrêt pour attente consignation..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Impact sur le Délai Contractuel (jours)
                    </label>
                    <input
                      type="number"
                      value={odsDelay}
                      onChange={e => setOdsDelay(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Impact Financier Avenant (DA HT)
                    </label>
                    <input
                      type="number"
                      value={odsCostImpact}
                      onChange={e => setOdsCostImpact(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Signataire / Représentant habilité
                  </label>
                  <input
                    type="text"
                    value={odsSignatory}
                    onChange={e => setOdsSignatory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                {/* Prescriptions HSE */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700">Prescriptions HSE Chantier :</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={odsHseLoto}
                        onChange={e => setOdsHseLoto(e.target.checked)}
                        className="rounded text-[#0B207D]"
                      />
                      <span>Consignation LOTO</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={odsHseHotWork}
                        onChange={e => setOdsHseHotWork(e.target.checked)}
                        className="rounded text-[#0B207D]"
                      />
                      <span>Permis Travail Chaud</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={odsHsePermit}
                        onChange={e => setOdsHsePermit(e.target.checked)}
                        className="rounded text-[#0B207D]"
                      />
                      <span>Permis Tri-Partite</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowOdsModal(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Émettre l'ODS & Mettre à Jour le Projet
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODALE 5 : CRÉER UNE SITUATION DE TRAVAUX (BORDEREAU BPU & MULTI-LIGNES) */}
      {/* ========================================================================= */}
      {showSituationModal && (() => {
        const previousCumul = totalSituationsHT;
        const newCumulProjected = previousCumul + calculatedSitTotalHT;
        const projectedBilledPct = contractAmountNum > 0 ? ((newCumulProjected / contractAmountNum) * 100).toFixed(1) : '0';

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
            <div className="bg-white rounded-xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-[#0B207D]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#07164D]">
                      Établir une Situation Périodique de Travaux (Métrés Contradictoires)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Bordereau des prix unitaires, application TVA algérienne, retenue de garantie et envoi automatique en arbitrage DG.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowSituationModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSituation} className="space-y-4 text-xs">
                {/* Période & Attachements contradictoires */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Début Période *</label>
                    <input
                      type="date"
                      value={sitPeriodStart}
                      onChange={e => setSitPeriodStart(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Fin Période *</label>
                    <input
                      type="date"
                      value={sitPeriodEnd}
                      onChange={e => setSitPeriodEnd(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">N° PV Attachement</label>
                    <input
                      type="text"
                      value={sitPvRef}
                      onChange={e => setSitPvRef(e.target.value)}
                      placeholder="ex: PV-ATT-2026-084"
                      className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Inspecteur Sonatrach</label>
                    <input
                      type="text"
                      value={sitInspector}
                      onChange={e => setSitInspector(e.target.value)}
                      placeholder="ex: M. Belhadj (Superviseur)"
                      className="w-full p-2 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                {/* Tableau multi-lignes des métrés (BPU) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Détail des Postes Exécutés (Métrés de la période) :
                    </label>
                    <button
                      type="button"
                      onClick={addSitLine}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-[#0B207D] border border-blue-200 rounded hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter une ligne de métré
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Poste / Désignation des Travaux</th>
                          <th className="p-2.5 w-16 text-center">Unité</th>
                          <th className="p-2.5 w-24 text-right">Qté Exécutée</th>
                          <th className="p-2.5 w-32 text-right">Prix Unitaire (DA)</th>
                          <th className="p-2.5 w-32 text-right">Montant HT</th>
                          <th className="p-2.5 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(Array.isArray(sitLines) ? sitLines : []).map(l => (
                          <tr key={l.id} className="hover:bg-slate-50">
                            <td className="p-2">
                              <input
                                type="text"
                                value={l.designation}
                                onChange={e => updateSitLine(l.id, { designation: e.target.value })}
                                className="w-full p-1.5 border border-slate-200 rounded font-medium"
                                required
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="text"
                                value={l.unit}
                                onChange={e => updateSitLine(l.id, { unit: e.target.value })}
                                className="w-full p-1.5 border border-slate-200 rounded text-center font-mono"
                                required
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0.1"
                                step="any"
                                value={l.periodQty}
                                onChange={e => updateSitLine(l.id, { periodQty: Number(e.target.value) })}
                                className="w-full p-1.5 border border-slate-200 rounded text-right font-bold"
                                required
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={l.unitPrice}
                                onChange={e => updateSitLine(l.id, { unitPrice: Number(e.target.value) })}
                                className="w-full p-1.5 border border-slate-200 rounded text-right font-bold"
                                required
                              />
                            </td>
                            <td className="p-2 text-right font-extrabold text-[#07164D]">
                              {formatCurrencyDA(Number(l.periodQty || 0) * Number(l.unitPrice || 0), false)}
                            </td>
                            <td className="p-2 text-center">
                              {sitLines.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSitLine(l.id)}
                                  className="text-slate-400 hover:text-red-600 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fiscalité Algérienne & Déductions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Paramètres Fiscaux & Contractuels :
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                          Régime TVA
                        </label>
                        <select
                          value={sitTvaRate}
                          onChange={e => setSitTvaRate(Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-semibold"
                        >
                          <option value={19}>19% (Standard)</option>
                          <option value={9}>9% (Taux Réduit)</option>
                          <option value={0}>0% (Exonéré / ANDI)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                          Retenue de Garantie (RG)
                        </label>
                        <select
                          value={sitRetenueGarantieRate}
                          onChange={e => setSitRetenueGarantieRate(Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-semibold"
                        >
                          <option value={5}>5% (Standard Marchés)</option>
                          <option value={10}>10% (Chantier Spécial)</option>
                          <option value={0}>0% (Sans Retenue)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                        Observations & Réserves de métrés
                      </label>
                      <textarea
                        rows={2}
                        value={sitNotes}
                        onChange={e => setSitNotes(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B207D]"
                        placeholder="Métrés contradictoires vérifiés in situ..."
                      />
                    </div>
                  </div>

                  {/* Récapitulatif Financier Dynamique */}
                  <div className="bg-blue-50/50 p-3.5 rounded-lg border border-blue-200 flex flex-col justify-between space-y-2">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span>Montant Brut HT Période :</span>
                        <strong className="font-extrabold text-[#07164D]">{formatCurrencyDA(calculatedSitTotalHT, false)}</strong>
                      </div>
                      {sitRetenueGarantieRate > 0 && (
                        <div className="flex justify-between text-amber-800 text-[11px]">
                          <span>Retenue de Garantie (-{sitRetenueGarantieRate}%) :</span>
                          <strong>-{formatCurrencyDA(calculatedRetenueGarantie, false)}</strong>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-700 text-[11px]">
                        <span>TVA ({sitTvaRate}%) :</span>
                        <strong>+{formatCurrencyDA(calculatedTVA, false)}</strong>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-[#0B207D] pt-1 border-t border-blue-200">
                        <span>Net à Facturer TTC :</span>
                        <span>{formatCurrencyDA(calculatedNetTTC, false)}</span>
                      </div>
                    </div>

                    {/* Impact sur le Marché */}
                    <div className="p-2 bg-white rounded border border-blue-100 text-[10px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Cumul Antérieur HT :</span>
                        <strong className="text-slate-800">{formatCurrencyDA(previousCumul, false)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Nouveau Cumul Projeté :</span>
                        <strong className="text-emerald-700">{formatCurrencyDA(newCumulProjected, false)}</strong>
                      </div>
                      <div className="flex justify-between font-bold text-[#0B207D]">
                        <span>Taux de Facturation Projet :</span>
                        <span>{projectedBilledPct}% du marché</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSituationModal(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Soumettre la Situation à l'Arbitrage DG
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    
      {/* ========================================================================= */}
      {/* MODALE : DÉSIGNER / CHANGER LE RESPONSABLE DU PROJET */}
      {/* ========================================================================= */}
      {showChangeManagerModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#0B207D]" />
                <h3 className="text-sm font-bold text-[#07164D]">Désigner le Responsable de Chantier</h3>
              </div>
              <button onClick={() => setShowChangeManagerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManager} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Sélectionner le Chef de Projet / Responsable *
                </label>
                <select
                  value={selectedManagerId}
                  onChange={e => setSelectedManagerId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                  required
                >
                  <option value="">-- Choisir un responsable --</option>
                  {(Array.isArray(usersList) ? usersList : []).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.title || u.role} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50/60 rounded border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0B207D]" />
                  Habilitation & Rôle Directeur / Direction
                </div>
                <div>Le collaborateur désigné sera le garant de l'exécution QCD, du suivi des métrés et de la validation des pointages sur ce chantier.</div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChangeManagerModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!selectedManagerId}
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] disabled:opacity-50 cursor-pointer"
                >
                  Confirmer la Désignation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE : MODIFIER LES DATES CONTRACTUELLES & DÉLAIS */}
      {/* ========================================================================= */}
      {showChangeDatesModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0B207D]" />
                <h3 className="text-sm font-bold text-[#07164D]">Modifier le Calendrier Contractuel</h3>
              </div>
              <button onClick={() => setShowChangeDatesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDates} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Date de Notification / Démarrage Chantier *
                </label>
                <input
                  type="date"
                  value={dateNotification}
                  onChange={e => setDateNotification(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Date de Fin Contractuelle Prévue *
                </label>
                <input
                  type="date"
                  value={dateFinContractuelle}
                  onChange={e => setDateFinContractuelle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                  required
                />
              </div>

              {dateFinContractuelle && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                  {(() => {
                    const days = Math.ceil(
                      (new Date(dateFinContractuelle).getTime() - Date.now()) / (1000 * 3600 * 24)
                    );
                    return days > 0 ? (
                      <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Nouveau Délai Restant : {days} jours
                      </div>
                    ) : (
                      <div className="text-red-700 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Date échue : +{Math.abs(days)} jours de dépassement
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChangeDatesModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] cursor-pointer"
                >
                  Enregistrer les Nouvelles Dates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
