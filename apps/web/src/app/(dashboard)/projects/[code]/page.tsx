'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { formatCurrencyDA, formatDateDZ, ServiceOrderType, SystemRole } from '@silex/shared';
import { StatusBadge } from '@/components/shared/status-badge';
import { ProjectContractTab } from '@/components/project-tabs/project-contract-tab';
import { ProjectTasksTab } from '@/components/project-tabs/project-tasks-tab';
import { ProjectDailyReportsTab } from '@/components/project-tabs/project-daily-reports-tab';
import { ProjectSituationReportsTab } from '@/components/project-tabs/project-situation-reports-tab';
import { ProjectConstraintsTab } from '@/components/project-tabs/project-constraints-tab';
import { ProjectHseTab } from '@/components/project-tabs/project-hse-tab';
import { ProjectHrTab } from '@/components/project-tabs/project-hr-tab';
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
  RefreshCw,
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
  const { activeRole, user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Matrice de permissions RBAC stricte (PERMISSIONS_MATRIX.md) :
  const isDG = activeRole === SystemRole.DIRECTEUR_GENERAL || activeRole === SystemRole.ADMINISTRATEUR;
  const isProjectManager = activeRole === SystemRole.RESPONSABLE_PROJET;
  const isFinance = activeRole === SystemRole.RESPONSABLE_FINANCIER;
  const isQuality = activeRole === SystemRole.RESPONSABLE_QUALITE;

  // Habilitations d'actions opérationnelles conformes :
  const canAssignManager = isDG;
  const canModifyDates = isDG;
  const canEditProject = isDG || isProjectManager;
  const canAdjustProgress = isDG || isProjectManager;
  const canManageMembers = isDG || isProjectManager;
  const canCreateMilestone = isDG || isProjectManager || isQuality;
  const canEmitODS = isDG || isProjectManager;
  const canCreateSituation = isDG || isProjectManager || isFinance;

  // États pour les modales de Désignation Responsable et Modification Dates :
  const [showChangeManagerModal, setShowChangeManagerModal] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [showChangeDatesModal, setShowChangeDatesModal] = useState(false);
  const [dateNotification, setDateNotification] = useState('');
  const [dateFinContractuelle, setDateFinContractuelle] = useState('');

  const handleOpenManagerModal = () => {
    if (!canAssignManager) {
      alert("Habilitation restreinte : Seule la Direction Générale (DG) ou l'Administrateur peut nommer ou changer le Responsable de Chantier.");
      return;
    }
    setSelectedManagerId(project?.managerId || project?.manager?.id || '');
    setShowChangeManagerModal(true);
  };

  const handleSaveManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.patch('/projects/' + project.id, {
        managerId: selectedManagerId,
      });
      setShowChangeManagerModal(false);
      setNotification('Responsable de Chantier désigné avec succès !');
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la désignation du responsable');
    }
  };

  const handleOpenDatesModal = () => {
    if (!canModifyDates) {
      alert("Habilitation restreinte : Seule la Direction Générale (DG) ou l'Administrateur peut modifier le calendrier contractuel et les délais.");
      return;
    }
    setDateNotification(project?.startDate ? project.startDate.split('T')[0] : (project?.contractStartDate ? project.contractStartDate.split('T')[0] : ''));
    setDateFinContractuelle(project?.contractEndDate ? project.contractEndDate.split('T')[0] : '');
    setShowChangeDatesModal(true);
  };

  const handleSaveDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await api.patch('/projects/' + project.id, {
        startDate: dateNotification ? new Date(dateNotification).toISOString() : undefined,
        contractEndDate: dateFinContractuelle ? new Date(dateFinContractuelle).toISOString() : undefined,
      });
      setShowChangeDatesModal(false);
      setNotification('Dates contractuelles et échéances mises à jour avec succès !');
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour des dates');
    }
  };

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

  // Modales d'interconnexion Achats & Stocks Chantier
  const [showPurchaseRequestModal, setShowPurchaseRequestModal] = useState(false);
  const [prDescription, setPrDescription] = useState('Fourniture électrodes basiques E7018 et disques meulage');
  const [prAmountHT, setPrAmountHT] = useState<number>(350000);
  const [prUrgency, setPrUrgency] = useState<'NORMALE' | 'URGENTE'>('URGENTE');
  const [prSubmitting, setPrSubmitting] = useState(false);

  const handleCreatePurchaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPrSubmitting(true);
      await api.post('/projects/' + project.code + '/purchase-requests', {
        description: prDescription,
        estimatedAmountHT: Number(prAmountHT),
        urgency: prUrgency,
      });
      setShowPurchaseRequestModal(false);
      setNotification("Demande d'Achat Chantier (DA) émise avec succès ! Budget engagé actualisé.");
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur DA');
    } finally {
      setPrSubmitting(false);
    }
  };

  const [showStockConsumptionModal, setShowStockConsumptionModal] = useState(false);
  const [stockItemName, setStockItemName] = useState('Électrodes basiques E7018 diam 3.2mm');
  const [stockQty, setStockQty] = useState<number>(50);
  const [stockUnitCost, setStockUnitCost] = useState<number>(4500);
  const [stockWorkZone, setStockWorkZone] = useState('Skid Gaz HP - ISO 01');
  const [stockSubmitting, setStockSubmitting] = useState(false);

  const handleCreateStockConsumption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStockSubmitting(true);
      await api.post('/projects/' + project.code + '/stock-consumptions', {
        itemId: 'ITEM-ELEC-7018',
        itemName: stockItemName,
        quantity: Number(stockQty),
        unitCost: Number(stockUnitCost),
        workZone: stockWorkZone,
      });
      setShowStockConsumptionModal(false);
      setNotification("Sortie réelle de stock enregistrée ! Dépenses réelles chantier imputées.");
      setTimeout(() => setNotification(null), 5000);
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Erreur sortie stock');
    } finally {
      setStockSubmitting(false);
    }
  };

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

  // 6. Modal Pointage Journalier Main-d'Œuvre
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [tsWorkerName, setTsWorkerName] = useState('Mourad Zitouni');
  const [tsCorpsEtat, setTsCorpsEtat] = useState<string>('SOUDEUR_ASME');
  const [tsQualification, setTsQualification] = useState('ASME IX 6G TIG/SMAW');
  const [tsDate, setTsDate] = useState(new Date().toISOString().split('T')[0]);
  const [tsNormalHours, setTsNormalHours] = useState<number>(8);
  const [tsOvertimeHours, setTsOvertimeHours] = useState<number>(2);
  const [tsWeatherHours, setTsWeatherHours] = useState<number>(0);
  const [tsHourlyRate, setTsHourlyRate] = useState<number>(1400);
  const [tsTaskRef, setTsTaskRef] = useState('TSK-05');
  const [tsProductivityRatio, setTsProductivityRatio] = useState<number>(1.05);
  const [tsSubmitting, setTsSubmitting] = useState(false);

  const handleSaveTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTsSubmitting(true);
      await api.post(`/projects/${project.code}/timesheets`, {
        workerName: tsWorkerName,
        corpsEtat: tsCorpsEtat,
        workerQualification: tsQualification,
        date: tsDate,
        normalHours: Number(tsNormalHours),
        overtimeHours: Number(tsOvertimeHours),
        weatherHours: Number(tsWeatherHours),
        hourlyRate: Number(tsHourlyRate),
        taskRef: tsTaskRef,
        productivityRatio: Number(tsProductivityRatio),
      });
      setShowTimesheetModal(false);
      setNotification('Pointage journalier enregistré avec succès ! Coût MO imputé.');
      setTimeout(() => setNotification(null), 5000);
      await fetchProject(true);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'enregistrement du pointage');
    } finally {
      setTsSubmitting(false);
    }
  };

  const handleExportTimesheetsCSV = () => {
    const list = project.timesheets || [];
    if (list.length === 0) {
      alert('Aucun pointage à exporter.');
      return;
    }
    const headers = ['Date', 'Intervenant', 'Corps d’État', 'Qualification', 'Heures Normales', 'Heures Sup', 'Heures Intempéries', 'Taux Horaire DA', 'Coût Total DA', 'Tâche', 'Ratio Productivité', 'Statut'];
    const rows = list.map((t: any) => [
      t.date,
      `"${t.workerName || ''}"`,
      t.corpsEtat,
      `"${t.workerQualification || ''}"`,
      t.normalHours,
      t.overtimeHours,
      t.weatherHours,
      t.hourlyRate,
      t.totalCostDA,
      t.taskRef || '',
      t.productivityRatio || 1.0,
      t.status,
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r: any[]) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pointages_${project.code}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 7. Modales Réception de Chantier (PVRP & PVRD)
  const [showPvrpModal, setShowPvrpModal] = useState(false);
  const [pvrpDate, setPvrpDate] = useState(new Date().toISOString().split('T')[0]);
  const [pvrpStatus, setPvrpStatus] = useState<'VALIDE_SANS_RESERVE' | 'RESERVES_EN_COURS' | 'VALIDE_RESERVES_LEVEES'>('VALIDE_SANS_RESERVE');
  const [pvrpClientSignatory, setPvrpClientSignatory] = useState('M. Mustapha Larbi (Représentant Maître d\'Ouvrage)');
  const [pvrpReservesCount, setPvrpReservesCount] = useState<number>(0);
  const [pvrpReservesLifted, setPvrpReservesLifted] = useState(true);
  const [pvrpNotes, setPvrpNotes] = useState('Réception provisoire prononcée avec succès suite aux épreuves hydrostatiques à 45 bars sans fuite ni déformation.');
  const [pvrpSubmitting, setPvrpSubmitting] = useState(false);

  const handleSavePvrp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDG && !isProjectManager) {
      alert("Habilitation restreinte : Seul le Responsable de Projet ou la DG peut enregistrer le PVRP.");
      return;
    }
    try {
      setPvrpSubmitting(true);
      await api.post(`/projects/${project.code}/reception`, {
        type: 'PVRP',
        status: pvrpStatus,
        pvDate: pvrpDate,
        clientSignatory: pvrpClientSignatory,
        reservesCount: Number(pvrpReservesCount),
        reservesLifted: pvrpReservesLifted,
        notes: pvrpNotes,
      });
      setShowPvrpModal(false);
      setNotification('PV de Réception Provisoire (PVRP) enregistré avec succès !');
      setTimeout(() => setNotification(null), 5000);
      await fetchProject(true);
    } catch (err: any) {
      alert(err.message || 'Erreur PVRP');
    } finally {
      setPvrpSubmitting(false);
    }
  };

  const [showPvrdModal, setShowPvrdModal] = useState(false);
  const [pvrdDate, setPvrdDate] = useState(new Date().toISOString().split('T')[0]);
  const [pvrdNotes, setPvrdNotes] = useState('Expiration des 12 mois de garantie contractuelle sans réserve technique. Restitution et mainlevée ordonnancée de la retenue de garantie (5%).');
  const [pvrdSubmitting, setPvrdSubmitting] = useState(false);

  const handleSavePvrd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDG) {
      alert("Habilitation SoD stricte : Seule la Direction Générale (DG) peut prononcer la réception définitive et débloquer la retenue de garantie.");
      return;
    }
    try {
      setPvrdSubmitting(true);
      await api.post(`/projects/${project.code}/reception`, {
        type: 'PVRD',
        status: 'VALIDE_DEFINITIF',
        pvDate: pvrdDate,
        notes: pvrdNotes,
      });
      setShowPvrdModal(false);
      setNotification('PV de Réception Définitive (PVRD) validé ! Retenue de garantie libérée.');
      setTimeout(() => setNotification(null), 5000);
      await fetchProject(true);
    } catch (err: any) {
      alert(err.message || 'Erreur PVRD');
    } finally {
      setPvrdSubmitting(false);
    }
  };

  const fetchProject = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await api.get<any>(`/projects/${resolvedParams.code}`);
      setProject(data);
    } catch (err: any) {
      alert(err.message || 'Erreur chargement projet');
    } finally {
      if (!silent) setLoading(false);
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
      setNotification('Fiche projet modifiée avec succès !');
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
      const amt = Number(costAmount);
      const newEntry = {
        id: `cst-${Date.now()}`,
        category: costCategory,
        amount: amt,
        description: costDescription || 'Imputation analytique',
        sourceModule: 'MANUAL',
        recordedAt: new Date().toISOString(),
      };
      setProject((prev: any) => {
        if (!prev) return prev;
        const entries = [newEntry, ...(prev.costEntries || [])];
        const newActualCost = Number(prev.actualCost || 0) + amt;
        return { ...prev, costEntries: entries, actualCost: newActualCost };
      });

      await api.post(`/projects/${project.id}/costs`, {
        category: costCategory,
        amount: amt,
        description: costDescription,
        sourceModule: 'MANUAL',
      });
      setShowCostModal(false);
      setNotification(`Dépense de ${formatCurrencyDA(amt, false)} imputée au coût réel du chantier !`);
      setTimeout(() => setNotification(null), 5000);
      await fetchProject(true);
    } catch (err: any) {
      alert(err.message || 'Erreur imputation frais');
      await fetchProject(true);
    }
  };

  const handleValidateMilestone = async (milestoneId: string) => {
    try {
      setProject((prev: any) => {
        if (!prev) return prev;
        const updatedMilestones = (prev.milestones || []).map((m: any) =>
          m.id === milestoneId ? { ...m, status: 'COMPLETED', completed: true, completedDate: new Date().toISOString() } : m
        );
        return { ...prev, milestones: updatedMilestones };
      });

      await api.patch(`/projects/${project.id}/milestones/${milestoneId}`, {
        status: 'COMPLETED',
        completedDate: new Date().toISOString(),
      });
      setNotification('Jalon contractuel validé et marqué franchi ! Recalcul de l\'avancement physique opéré.');
      setTimeout(() => setNotification(null), 5000);
      await fetchProject(true);
    } catch (err: any) {
      alert(err.message || 'Erreur validation jalon');
      await fetchProject(true);
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
  const totalCollectedHT = (project.workSituations || [])
    .filter((s: any) => s.status === 'PAYE' || s.status === 'ENCAISSE' || s.status === 'VALIDE')
    .reduce((acc: number, s: any) => acc + (Number(s.amountHT || 0) * 0.95), 0);
  const collectedPct = contractAmountNum > 0 ? ((totalCollectedHT / contractAmountNum) * 100).toFixed(1) : '0';

  const completedMilestones = (project.milestones || []).filter((m: any) => m.status === 'COMPLETED' || m.completed === true || m.status === 'FRANCHI' || m.status === 'VALIDE').length;

  const tabs = [
    { id: 'overview', label: '1. Vue Générale' },
    { id: 'contract', label: `2. Données Contractuelles & ODS (${(project.contractItems?.length || 0) + (project.serviceOrders?.length || 0)})` },
    { id: 'planning', label: `3. Planning & Jalons (${(project.milestones?.length || 0) + (project.tasks?.length || 0)})` },
    { id: 'budget', label: '4. Budget & Rentabilité WBS' },
    { id: 'procurement', label: `5. Achats & Commandes (${(project.purchaseOrders?.length || 0) + (project.purchaseRequests?.length || 0)})` },
    { id: 'materials', label: `6. Stocks & Consommations (${project.allocations?.length || 0})` },
    { id: 'hr', label: `7. RH & Équipes (${project.members?.length || 0})` },
    { id: 'timesheets', label: `8. Pointages & Main-d’Œuvre (${project.timesheets?.length || 0})` },
    { id: 'quality-hse', label: `9. Qualité & Sécurité (${(project.hseIncidents?.length || 0) + (project.nonConformities?.length || 0)})` },
    { id: 'documents', label: `10. Documents & RJC (${project.dailyReports?.length || 0})` },
    { id: 'situations', label: `11. Situations de Travaux (${(project.workSituations?.length || 0) + (project.situationReports?.length || 0)})` },
    { id: 'audit', label: '12. Historique & Audit' },
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
            onClick={() => setActiveTab('tasks')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#0B207D]" />
            <span>Tâches ({project.tasks?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('daily-reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#0B207D]" />
            <span>+ Rapport RJC</span>
          </button>

          <button
            onClick={() => setActiveTab('constraints')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-rose-300 text-rose-700 rounded-md hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Contraintes ({project.constraints?.length || 0})</span>
          </button>

          <button
            onClick={() => setShowPurchaseRequestModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Demande d'Achat DA</span>
          </button>

          <button
            onClick={() => setShowStockConsumptionModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-emerald-300 text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Boxes className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Sortie Stock</span>
          </button>

          {canAdjustProgress && (
            <button
              onClick={handleOpenProgress}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#0B207D] text-[#0B207D] rounded-md hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5" />
              Ajuster Avancement ({project.physicalProgress}%)
            </button>
          )}

          {canEditProject && (
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-md hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Modifier le Projet
            </button>
          )}
        </div>
      </div>

      {/* Highlights Bar - 4 indicateurs distincts exigés par la Section 4.2 */}
      <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">Client & Localisation</div>
          <div className="text-xs font-bold text-slate-900 mt-1">{project.clientName}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {project.siteLocation} {project.wilaya ? `(${project.wilaya})` : ''}
          </div>
          <div className="text-[10px] text-[#0B207D] font-bold mt-1">
            Marché HT : {formatCurrencyDA(contractAmountNum, false)}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider flex items-center justify-between">
            <span>1. Avancement Physique Pondéré</span>
            <span className="text-emerald-700 font-bold">{project.physicalProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
            <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${project.physicalProgress}%` }} />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>Jalons : {completedMilestones}/{project.milestones?.length || 0} validés</span>
            <span className="text-slate-400 font-medium">Métrés WBS</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider flex items-center justify-between">
            <span>2. Consommation Budgétaire</span>
            <span className={`font-bold ${Number(budgetConsumedPct) > 90 ? 'text-rose-700' : 'text-blue-700'}`}>{budgetConsumedPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
            <div className={`h-full rounded-full transition-all ${Number(budgetConsumedPct) > 90 ? 'bg-rose-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, Number(budgetConsumedPct))}%` }} />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>Coût réel : {formatCurrencyDA(actualCostNum, false)}</span>
            <span>Budget : {formatCurrencyDA(budgetAmountNum, false)}</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider flex items-center justify-between">
            <span>3. Facturé / 4. Encaissé</span>
            <span className="text-purple-700 font-bold">{billedPct}% / {collectedPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 flex">
            <div className="bg-purple-600 h-full transition-all" style={{ width: `${Math.min(100, Number(billedPct))}%` }} title="Facturé" />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>Facturé : {formatCurrencyDA(totalSituationsHT, false)}</span>
            <span>Encaissé : {formatCurrencyDA(totalCollectedHT, false)}</span>
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
                {canAssignManager && (
                  <button
                    onClick={handleOpenManagerModal}
                    className="text-[11px] text-[#0B207D] font-semibold hover:underline cursor-pointer"
                  >
                    Changer
                  </button>
                )}
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
                  {canAssignManager ? (
                    <button
                      type="button"
                      onClick={handleOpenManagerModal}
                      className="px-3 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded hover:bg-[#07164D] transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      + Désigner le Responsable
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">Désignation réservée à la Direction Générale (DG)</div>
                  )}
                </div>
              )}

              {/* Équipe participante & Bouton Affecter */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0B207D]" />
                    Participants au Projet ({project.assignedUsers?.length || 0}) :
                  </div>
                  {canManageMembers && (
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="text-[11px] font-bold text-[#0B207D] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Affecter
                    </button>
                  )}
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
                {canModifyDates && (
                  <button
                    onClick={handleOpenDatesModal}
                    className="text-[11px] text-[#0B207D] font-semibold hover:underline cursor-pointer"
                  >
                    Modifier
                  </button>
                )}
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
      {/* TAB 2: DONNÉES CONTRACTUELLES & ORDRES DE SERVICE (ODS) */}
      {/* ========================================================================= */}
      {(activeTab === 'contract' || activeTab === 'ods') && (
        <div className="space-y-6">
          {/* Synthèse Financière Contractuelle */}
          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#0B207D]" />
                  Synthèse Contractuelle, Fiscalité & Retenues Réglementaires
                </h2>
                <p className="text-[11px] text-slate-500">
                  Cadre financier légal selon le Code des Marchés : Retenue de garantie 5%, TVA 19%, Pénalités plafonnées.
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                  Réf: {project.contractReference || `CTR-${project.code}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Marché HT Vendu</div>
                <div className="text-sm font-extrabold text-[#07164D] mt-1">{formatCurrencyDA(contractAmountNum, false)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Base d'engagement</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">TVA Réglementaire (19%)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">{formatCurrencyDA(contractAmountNum * 0.19, false)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Taux légal algérien</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Volume Global TTC</div>
                <div className="text-sm font-extrabold text-[#0B207D] mt-1">{formatCurrencyDA(contractAmountNum * 1.19, false)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">TTC Contractuel</div>
              </div>
              <div className="p-3 bg-purple-50 rounded border border-purple-200">
                <div className="text-[10px] text-purple-700 uppercase font-semibold">Retenue de Garantie (5%)</div>
                <div className="text-sm font-extrabold text-purple-900 mt-1">{formatCurrencyDA(contractAmountNum * 0.05, false)}</div>
                <div className="text-[10px] text-purple-600 mt-0.5">Déblocage à PVRD (12 mois)</div>
              </div>
              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                <div className="text-[10px] text-amber-700 uppercase font-semibold">Plafond Pénalités (10%)</div>
                <div className="text-sm font-bold text-amber-900 mt-1">{formatCurrencyDA(contractAmountNum * 0.1, false)}</div>
                <div className="text-[10px] text-amber-600 mt-0.5">Max contractuel retard</div>
              </div>
            </div>
          </div>

          {/* Lots & Prestations Métrées Contractuelles */}
          <ProjectContractTab
            project={project}
            onRefresh={async () => { await fetchProject(true); }}
            isDG={isDG}
            isProjectManager={isProjectManager}
          />

          {/* Ordres de Service (ODS) Juridiques & Contractuels */}
          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0B207D]" />
                  Ordres de Service (ODS) Juridiques & Contractuels ({project.serviceOrders?.length || 0})
                </h2>
                <p className="text-[11px] text-slate-500">
                  Traçabilité contractuelle : Notification de Démarrage, Arrêt technique, Reprise et Travaux Modificatifs.
                </p>
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
                <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="font-semibold text-slate-700">Aucun Ordre de Service notifié pour ce chantier.</div>
                </div>
              ) : (
                project.serviceOrders?.map((ods: any) => (
                  <div key={ods.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {ods.orderNumber}
                        </span>
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                          {ods.type}
                        </span>
                        <span className="text-slate-500">Notifié le {formatDateDZ(ods.issueDate || ods.effectiveDate)}</span>
                        {ods.signatory && (
                          <span className="text-slate-600 font-medium">• Signataire: <strong>{ods.signatory}</strong></span>
                        )}
                      </div>
                      <div className="text-slate-800 font-medium">{ods.description}</div>
                      <div className="flex items-center gap-3 text-[11px] pt-1">
                        {ods.delayImpactDays > 0 ? (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Impact délai : +{ods.delayImpactDays} jours
                          </span>
                        ) : (
                          <span className="text-slate-500">Sans impact délai</span>
                        )}
                        {Number(ods.costImpactAmount || ods.costImpact || 0) > 0 && (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Impact financier : +{formatCurrencyDA(Number(ods.costImpactAmount || ods.costImpact), false)} HT
                          </span>
                        )}
                        {ods.clientRef && (
                          <span className="text-slate-400">Réf client: {ods.clientRef}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                        {ods.status || 'SIGNE'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLANNING & JALONS, TÂCHES & CONTRAINTES */}
      {/* ========================================================================= */}
      {(activeTab === 'planning' || activeTab === 'tasks' || activeTab === 'constraints') && (
        <div className="space-y-6">
          {/* Jalons Contractuels & Épreuves */}
          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0B207D]" />
                  Jalons Contractuels & Épreuves Réglementaires ({project.milestones?.length || 0})
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
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="font-semibold text-slate-700">Aucun jalon contractuel n'a été défini pour ce projet.</div>
                </div>
              ) : (
                project.milestones?.map((m: any, idx: number) => {
                  const isCompleted = m.status === 'COMPLETED' || m.completed === true || m.status === 'FRANCHI' || m.status === 'VALIDE';
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

          {/* Tâches Opérationnelles WBS */}
          <ProjectTasksTab
            projectCode={project.code}
            tasks={project.tasks || []}
            canEdit={canEditProject}
            onRefresh={async () => { await fetchProject(true); }}
          />

          {/* Contraintes & Blocages Chantier */}
          <ProjectConstraintsTab
            projectCode={project.code}
            constraints={project.constraints || []}
            canEdit={canEditProject}
            onRefresh={async () => { await fetchProject(true); }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BUDGET & RENTABILITÉ WBS */}
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
              <div className="text-[10px] text-slate-400 mt-1">Plafond budgétaire approuvé</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Coûts Réels Imputés</div>
              <div className="text-base font-extrabold text-[#0A7F7C] mt-1">{formatCurrencyDA(actualCostNum, false)}</div>
              <div className="text-[10px] text-slate-400 mt-1">Matières déstockées + Pointages MO</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Engagements Fournisseurs</div>
              <div className="text-base font-extrabold text-amber-700 mt-1">{formatCurrencyDA(committedCostNum, false)}</div>
              <div className="text-[10px] text-slate-400 mt-1">Bons de commande émis non soldés</div>
            </div>
          </div>

          {/* Indicateurs EAC & Rentabilité Prévisionnelle vs Réalisée */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Coût Prévisionnel à Terminaison (EAC)</div>
              <div className="text-base font-extrabold text-[#07164D] mt-1">
                {formatCurrencyDA(project.eacCost || (actualCostNum + Math.max(0, budgetAmountNum - actualCostNum)), false)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Projection Coûts Réels + Reste à Faire</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Marge Prévisionnelle (CA - EAC)</div>
              {(() => {
                const eac = project.eacCost || (actualCostNum + Math.max(0, budgetAmountNum - actualCostNum));
                const prevMargin = contractAmountNum - eac;
                const prevMarginPct = contractAmountNum > 0 ? ((prevMargin / contractAmountNum) * 100).toFixed(1) : '0';
                return (
                  <>
                    <div className="text-base font-extrabold text-emerald-700 mt-1">
                      {formatCurrencyDA(prevMargin, false)} ({prevMarginPct}%)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Marge brute contractuelle attendue</div>
                  </>
                );
              })()}
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Marge Réalisée (Facturé - Réalisé)</div>
              {(() => {
                const realMargin = totalSituationsHT - actualCostNum;
                const realMarginPct = totalSituationsHT > 0 ? ((realMargin / totalSituationsHT) * 100).toFixed(1) : '0';
                return (
                  <>
                    <div className={`text-base font-extrabold mt-1 ${realMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatCurrencyDA(realMargin, false)} ({realMarginPct}%)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Sur situations de travaux validées</div>
                  </>
                );
              })()}
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

          {/* Décomposition Analytique WBS par lots de dépenses */}
          <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/60">
              <h3 className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
                Décomposition Budgétaire par Pôles de Dépenses (WBS Chantier)
              </h3>
              <span className="text-[10px] text-slate-500">Ventilation analytique pour le contrôle de gestion industriel</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-800">1. Main-d'Œuvre Directe</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Soudeurs, tuyauteurs, monteurs</div>
                <div className="font-extrabold text-[#07164D] mt-2">{formatCurrencyDA(budgetAmountNum * 0.35, false)}</div>
                <div className="text-[10px] text-slate-400">Poids : 35% du budget</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-800">2. Fournitures & Matières</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Tubes acier, brides, électrodes</div>
                <div className="font-extrabold text-[#07164D] mt-2">{formatCurrencyDA(budgetAmountNum * 0.40, false)}</div>
                <div className="text-[10px] text-slate-400">Poids : 40% du budget</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-800">3. Matériel & Engins</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Grues mobiles, compresseurs</div>
                <div className="font-extrabold text-[#07164D] mt-2">{formatCurrencyDA(budgetAmountNum * 0.12, false)}</div>
                <div className="text-[10px] text-slate-400">Poids : 12% du budget</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-800">4. Sous-Traitance CND</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Tirs radio & contrôles agréés</div>
                <div className="font-extrabold text-[#07164D] mt-2">{formatCurrencyDA(budgetAmountNum * 0.08, false)}</div>
                <div className="text-[10px] text-slate-400">Poids : 8% du budget</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-800">5. Frais Indirects & Base</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Transport, outillage, EPI</div>
                <div className="font-extrabold text-[#07164D] mt-2">{formatCurrencyDA(budgetAmountNum * 0.05, false)}</div>
                <div className="text-[10px] text-slate-400">Poids : 5% du budget</div>
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
                        Catégorie : <strong>{ce.category}</strong> • Date : {formatDateDZ(ce.recordedAt || ce.date)} • Réf : {ce.reference || 'Auto-Généré'}
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
      {/* TAB 5: ACHATS & COMMANDES */}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPurchaseRequestModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded hover:bg-[#07164D] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + Demande d'Achat (DA)
              </button>
              <Link
                href="/procurement"
                className="text-xs font-semibold text-[#0B207D] hover:underline flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded"
              >
                Module Achats <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
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
                          {po.poNumber || po.orderNumber}
                          <ExternalLink className="w-2.5 h-2.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                        </Link>
                        <span className="text-xs font-bold text-slate-900">
                          Fournisseur : {po.supplier?.name || po.supplierName}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {po.status}
                        </span>
                      </div>
                      <div className="text-right font-extrabold text-xs text-[#07164D]">
                        {formatCurrencyDA(po.totalAmountHT || po.amount, false)} HT
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
                        Demandeur : {pr.createdBy?.name || pr.requesterName} • Créé le {formatDateDZ(pr.createdAt)}
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
      {/* TAB 6: STOCKS & CONSOMMATIONS CHANTIER */}
      {/* ========================================================================= */}
      {activeTab === 'materials' && (
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-[#0B207D]" />
                Sorties Magasins & Matériaux Affectés au Chantier ({project.allocations?.length || 0})
              </h2>
              <p className="text-[11px] text-slate-500">
                Bons de sortie magasin (BSM) imputés directement depuis le stock central vers ce chantier.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStockConsumptionModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A7F7C] text-white text-xs font-semibold rounded hover:bg-[#075957] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + Sortie Stock Chantier
              </button>
              <Link
                href="/inventory"
                className="text-xs font-semibold text-[#0B207D] hover:underline flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded"
              >
                Module Stocks <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            {project.allocations?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Boxes className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-semibold text-slate-700">Aucune sortie de matériel enregistrée pour ce chantier.</div>
                <div className="text-[11px] text-slate-400">Cliquez sur "+ Sortie Stock Chantier" pour imputer des fournitures.</div>
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
                      {al.item?.code || al.itemCode}
                      <ExternalLink className="w-2.5 h-2.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                    </Link>{' '}
                    <span className="font-bold text-slate-900 ml-1">{al.item?.name || al.itemName}</span>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Magasin source : <strong>{al.warehouse?.name || 'Magasin Central Arzew'}</strong> • Zone / Iso : <strong>{al.workZone || 'Chantier Principal'}</strong> • Date : {formatDateDZ(al.allocatedAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#0A7F7C] text-sm">{al.quantity} {al.item?.unit || al.unit || 'U'}</div>
                    <div className="text-[11px] text-slate-600 font-extrabold">{formatCurrencyDA(al.totalCost || (al.quantity * 2500), false)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: RH, ÉQUIPES MOBILISÉES & QUALIFICATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'hr' && (
        <ProjectHrTab
          projectCode={project.code}
          projectName={project.name}
          members={project.members || []}
          canManage={canManageMembers}
          onRefresh={async () => { await fetchProject(true); }}
          onOpenAddMember={() => setShowAddMemberModal(true)}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 8: POINTAGES & PRODUCTIVITÉ MAIN-D'ŒUVRE */}
      {/* ========================================================================= */}
      {activeTab === 'timesheets' && (
        <div className="space-y-6">
          {/* Cartouches d'Heures & Productivité */}
          {(() => {
            const list = project.timesheets || [];
            const totalHours = list.reduce((acc: number, t: any) => acc + (Number(t.normalHours) || 0) + (Number(t.overtimeHours) || 0) + (Number(t.weatherHours) || 0), 0);
            const normalHours = list.reduce((acc: number, t: any) => acc + (Number(t.normalHours) || 0), 0);
            const overtimeHours = list.reduce((acc: number, t: any) => acc + (Number(t.overtimeHours) || 0), 0);
            const weatherHours = list.reduce((acc: number, t: any) => acc + (Number(t.weatherHours) || 0), 0);
            const totalCost = list.reduce((acc: number, t: any) => acc + (Number(t.totalCostDA) || 0), 0);
            const avgProductivity = list.length > 0 ? (list.reduce((acc: number, t: any) => acc + (Number(t.productivityRatio) || 1.0), 0) / list.length).toFixed(2) : '1.00';

            return (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Total Heures Travaillées</div>
                  <div className="text-xl font-extrabold text-[#07164D] mt-1">{totalHours} h</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Sur site d'intervention</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Heures Normales (HN)</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">{normalHours} h</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Base contractuelle 40h/semaine</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Heures Supplémentaires (HS)</div>
                  <div className="text-xl font-bold text-amber-700 mt-1">{overtimeHours} h</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Majoration 25% / 50%</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Heures Intempéries / Chômées</div>
                  <div className="text-xl font-bold text-blue-700 mt-1">{weatherHours} h</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Indemnisées selon convention</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Taux Moyen Productivité</div>
                  <div className="text-xl font-extrabold text-emerald-700 mt-1">{avgProductivity}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Ratio Heures Prévues / Réelles</div>
                </div>
              </div>
            );
          })()}

          {/* Tableau Détaillé des Pointages */}
          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-[#0B207D]" />
                  Relevé des Pointages Main-d'Œuvre par Corps d'État ({project.timesheets?.length || 0})
                </h2>
                <p className="text-[11px] text-slate-500">
                  Soudeurs ASME IX, Tuyauteurs ISO, Monteurs échafaudeurs, Contrôleurs CND et Encadrement.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTimesheetModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded hover:bg-[#07164D] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Enregistrer un Pointage
                </button>
                <button
                  onClick={handleExportTimesheetsCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded border border-slate-300 transition-colors cursor-pointer"
                >
                  Exporter CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[11px] font-bold text-[#07164D] uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Intervenant Mobilisé</th>
                    <th className="py-2.5 px-3">Corps d'État</th>
                    <th className="py-2.5 px-3">Qualification / Habilitation</th>
                    <th className="py-2.5 px-3 text-center">HN</th>
                    <th className="py-2.5 px-3 text-center">HS</th>
                    <th className="py-2.5 px-3 text-right">Taux Horaire</th>
                    <th className="py-2.5 px-3 text-right">Coût Total DA</th>
                    <th className="py-2.5 px-3 text-center">Tâche</th>
                    <th className="py-2.5 px-3 text-center">Productivité</th>
                    <th className="py-2.5 px-3 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!project.timesheets || project.timesheets.length === 0) ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400">
                        Aucun relevé d'heures enregistré pour ce chantier. Cliquez sur "+ Enregistrer un Pointage".
                      </td>
                    </tr>
                  ) : (
                    project.timesheets.map((ts: any) => (
                      <tr key={ts.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-semibold text-slate-700">{formatDateDZ(ts.date)}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{ts.workerName}</td>
                        <td className="py-2 px-3">
                          <span className="bg-blue-50 text-[#0B207D] font-bold px-2 py-0.5 rounded text-[10px] border border-blue-200">
                            {ts.corpsEtat}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-medium">{ts.workerQualification}</td>
                        <td className="py-2 px-3 text-center font-bold text-slate-800">{ts.normalHours} h</td>
                        <td className="py-2 px-3 text-center font-bold text-amber-700">{ts.overtimeHours > 0 ? `+${ts.overtimeHours} h` : '-'}</td>
                        <td className="py-2 px-3 text-right text-slate-700">{formatCurrencyDA(ts.hourlyRate, false)}</td>
                        <td className="py-2 px-3 text-right font-extrabold text-[#07164D]">{formatCurrencyDA(ts.totalCostDA, false)}</td>
                        <td className="py-2 px-3 text-center font-mono text-[10px] text-slate-500">{ts.taskRef || '-'}</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-700">{ts.productivityRatio || 1.0}</td>
                        <td className="py-2 px-3 text-right">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {ts.status || 'VALIDE'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: QUALITÉ, SÉCURITÉ HSE & CND */}
      {/* ========================================================================= */}
      {(activeTab === 'quality-hse' || activeTab === 'quality') && (
        <div className="space-y-6">
          {/* Événements HSE & Causeries Sécurité */}
          <ProjectHseTab
            projectCode={project.code}
            incidents={project.hseIncidents || []}
            canEdit={canEditProject}
            onRefresh={async () => { await fetchProject(true); }}
          />

          {/* Fiches de Non-Conformité (FNC) */}
          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0B207D]" />
                  Qualité, Fiches de Non-Conformité (FNC) ({project.nonConformities?.length || 0})
                </h2>
                <p className="text-[11px] text-slate-500">
                  Traitement CAPA des écarts : Détection, confinement immédiat, analyse des causes et actions correctives.
                </p>
              </div>
              <Link
                href="/quality"
                className="text-xs font-semibold text-[#0B207D] hover:underline flex items-center gap-1"
              >
                Module Qualité & Audits <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {project.nonConformities?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="font-semibold text-emerald-800">Aucune Non-Conformité majeure signalée. Chantier conforme.</div>
                </div>
              ) : (
                project.nonConformities?.map((fnc: any) => (
                  <div key={fnc.id} className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors space-y-2 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {fnc.fncNumber}
                        </span>
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
                    <div className="text-slate-700 font-medium">{fnc.description}</div>
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

          {/* Registre des Contrôles Non-Destructifs (CND) */}
          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0B207D]" />
                  Contrôles Non Destructifs (CND) & Inspections Soudures
                </h2>
                <p className="text-[11px] text-slate-500">
                  Tirs radiographiques 100% (RT), Ressuage (PT), Magnétoscopie (MT) et Épreuves sous pression.
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                Organisme tiers : Bureau Veritas Algérie
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-800">Radiographie (RT)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tirs argentiques soudures bout-à-bout</div>
                <div className="font-extrabold text-[#0B207D] mt-2">98 / 120 joints</div>
                <div className="text-[10px] text-emerald-700 font-bold">Taux de conformité : 97.5%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-800">Ressuage (PT)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Piquages et soudures d'angle</div>
                <div className="font-extrabold text-[#0B207D] mt-2">45 joints inspectés</div>
                <div className="text-[10px] text-emerald-700 font-bold">100% sans ressuage négatif</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-800">Magnétoscopie (MT)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Apparaux de levage & supports</div>
                <div className="font-extrabold text-[#0B207D] mt-2">18 points de contrôle</div>
                <div className="text-[10px] text-emerald-700 font-bold">Certificat de conformité délivré</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-800">Épreuve Hydrostatique</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Test de résistance sous pression</div>
                <div className="font-extrabold text-[#0B207D] mt-2">45 bars / 4 heures</div>
                <div className="text-[10px] text-emerald-700 font-bold">PV conjoint émargé</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: DOCUMENTS, GED & RAPPORTS JOURNALIERS (RJC) */}
      {/* ========================================================================= */}
      {(activeTab === 'documents' || activeTab === 'daily-reports') && (
        <div className="space-y-6">
          {/* GED Technique Industrielle */}
          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0B207D]" />
                  Gestion Électronique des Documents (GED) Technique & Qualité ({project.documents?.length || 0})
                </h2>
                <p className="text-[11px] text-slate-500">
                  Plans isométriques (ISO), Cahiers de soudage DMOS/QMOS, Certificats 3.1 EN 10204 et PV d'essais.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {project.documents?.map((doc: any) => (
                <div key={doc.id} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{doc.name}</div>
                    <div className="text-[10px] text-slate-500">
                      Type: <strong>{doc.type}</strong> • Taille: {doc.size || '1.8 MB'}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Conforme
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rapports Journaliers de Chantier complets */}
          <ProjectDailyReportsTab
            projectCode={project.code}
            projectName={project.name}
            clientName={project.clientName}
            siteLocation={project.siteLocation}
            reports={project.dailyReports || []}
            canEdit={canEditProject}
            canValidate={isDG || isProjectManager}
            onRefresh={async () => { await fetchProject(true); }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 11: SITUATIONS DE TRAVAUX & DÉCOMPTES */}
      {/* ========================================================================= */}
      {(activeTab === 'situations' || activeTab === 'situation-reports') && (
        <div className="space-y-6">
          {/* Situations Périodiques de Travaux métrées BPU */}
          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#0B207D]" />
                  Situations Périodiques de Travaux & Décomptes ({project.workSituations?.length || 0})
                </h2>
                <p className="text-[11px] text-slate-500">
                  Métrés contradictoires soumis à vérification client, calcul TVA 19% et retenue de garantie 5%.
                </p>
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
                  <div key={sit.id} className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {sit.situationNumber}
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          {sit.status}
                        </span>
                        <span className="text-slate-500">
                          Période : {formatDateDZ(sit.periodStart)} au {formatDateDZ(sit.periodEnd)}
                        </span>
                        {sit.inspector && (
                          <span className="text-slate-500">• Contrôle : {sit.inspector}</span>
                        )}
                      </div>
                      {sit.notes && (
                        <div className="text-slate-700 font-medium"><em>{sit.notes}</em></div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-[#07164D]">{formatCurrencyDA(sit.amountHT, false)} HT</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Cumul HT : {formatCurrencyDA(sit.cumulatedAmountHT || sit.cumulativeAmountHT || sit.amountHT, false)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rapports Périodiques d'Avancement */}
          <ProjectSituationReportsTab
            projectCode={project.code}
            projectName={project.name}
            reports={project.situationReports || []}
            currentPhysicalProgress={Number(project.progress || project.physicalProgress || 0)}
            currentFinancialProgress={Number(billedPct || 0)}
            canEdit={canEditProject}
            onRefresh={async () => { await fetchProject(true); }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 12: HISTORIQUE, AUDIT & CLÔTURE FORMELLE */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Section Réception de Chantier & Clôture Formelle (Section 4.5) */}
          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0B207D]" />
                  Réception de Chantier & Clôture Formelle (PVRP & PVRD)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Gouvernance SoD : PVRP avec levée des réserves et PVRD à 12 mois pour restitution de la retenue de garantie (5%).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* PVRP - Réception Provisoire */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#0B207D]" />
                    PV de Réception Provisoire (PVRP)
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    project.pvrp?.status === 'VALIDE_SANS_RESERVE' || project.pvrp?.status === 'VALIDE_RESERVES_LEVEES'
                      ? 'bg-emerald-100 text-emerald-800'
                      : project.pvrp?.status === 'RESERVES_EN_COURS'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {project.pvrp?.status || 'NON_EMIS'}
                  </span>
                </div>

                <div className="space-y-1 text-slate-600">
                  <div>Date du PV : <strong>{project.pvrp?.pvDate ? formatDateDZ(project.pvrp.pvDate) : 'Non prononcée'}</strong></div>
                  <div>Signataire Maître d'Ouvrage : <strong>{project.pvrp?.clientSignatory || 'Non désigné'}</strong></div>
                  <div>Réserves notifiées : <strong>{project.pvrp?.reservesCount || 0}</strong> {project.pvrp?.reservesLifted ? '(Toutes levées)' : ''}</div>
                  {project.pvrp?.notes && <div className="text-[11px] italic bg-white p-2 rounded border border-slate-200 mt-1">{project.pvrp.notes}</div>}
                </div>

                <button
                  onClick={() => setShowPvrpModal(true)}
                  className="w-full mt-2 px-3 py-2 bg-[#0B207D] hover:bg-[#07164D] text-white font-semibold rounded cursor-pointer transition-colors text-center"
                >
                  Prononcer / Mettre à jour le PVRP
                </button>
              </div>

              {/* PVRD - Réception Définitive & Libération Retenue */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    PV de Réception Définitive (PVRD)
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    project.pvrd?.status === 'VALIDE_DEFINITIF'
                      ? 'bg-emerald-100 text-emerald-800'
                      : project.pvrd?.status === 'EN_GARANTIE_12M'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {project.pvrd?.status || 'NON_EMIS'}
                  </span>
                </div>

                <div className="space-y-1 text-slate-600">
                  <div>Échéance Période de Garantie : <strong>{project.pvrd?.warrantyEndDate ? formatDateDZ(project.pvrd.warrantyEndDate) : '12 mois après PVRP'}</strong></div>
                  <div>Retenue de garantie (5%) : <strong className="text-purple-800">{formatCurrencyDA(contractAmountNum * 0.05, false)}</strong></div>
                  <div>Mainlevée ordonnancée : <strong>{project.pvrd?.guaranteeReleased ? 'OUI (Fonds restitués)' : 'NON (Sous séquestre)'}</strong></div>
                  {project.pvrd?.notes && <div className="text-[11px] italic bg-white p-2 rounded border border-slate-200 mt-1">{project.pvrd.notes}</div>}
                </div>

                <button
                  onClick={() => setShowPvrdModal(true)}
                  disabled={!isDG}
                  title={!isDG ? 'Seule la DG peut valider le PVRD et libérer la garantie' : ''}
                  className="w-full mt-2 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded cursor-pointer transition-colors text-center"
                >
                  Valider le PVRD & Libérer la Retenue (SoD DG)
                </button>
              </div>
            </div>
          </div>

          {/* Journal Chronologique d'Audit Chantier */}
          <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0B207D]" />
                Journal d'Audit des Événements & Décisions Chantier
              </h2>
              <p className="text-[11px] text-slate-500">
                Traçabilité immuable des modifications budgétaires, jalons, ODS et situations de travaux.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 border-l-4 border-[#0B207D] bg-slate-50 rounded-r flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Notification ODS N°01 & Démarrage travaux</div>
                  <div className="text-[10px] text-slate-500">Par Amine Khelifi (Chef de Projet) • Conforme au contrat</div>
                </div>
                <div className="text-[10px] text-slate-400">{formatDateDZ(project.startDate)}</div>
              </div>
              <div className="p-3 border-l-4 border-emerald-500 bg-slate-50 rounded-r flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Validation Jalon : Spools tuyauterie HP réceptionnés</div>
                  <div className="text-[10px] text-slate-500">Visa Nadia Chaib (Qualité) • Contrôles CND favorables</div>
                </div>
                <div className="text-[10px] text-slate-400">{formatDateDZ(new Date(Date.now() - 5 * 86400000).toISOString())}</div>
              </div>
              <div className="p-3 border-l-4 border-purple-500 bg-slate-50 rounded-r flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Approbation Situation Périodique N°01</div>
                  <div className="text-[10px] text-slate-500">Visa Amine Benali (DG) • Facturation transmise à la Sonatrach</div>
                </div>
                <div className="text-[10px] text-slate-400">{formatDateDZ(new Date(Date.now() - 10 * 86400000).toISOString())}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE 1 : MODIFIER LE PROJET */}
      {/* ========================================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
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
                  <RefreshCw className="w-3.5 h-3.5 text-[#0B207D]" />
                  Interconnexion Automatique :
                </div>
                <div>
                  La validation de ce jalon recalculera immédiatement le pourcentage d'avancement physique du projet et mettra à jour l'ensemble des tableaux de bord.
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
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
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
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
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
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
      {/* Modal Demande d'Achat Chantier */}
      {showPurchaseRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-[#0B207D] text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Émettre une Demande d'Achat Chantier (DA)</span>
              </div>
              <button onClick={() => setShowPurchaseRequestModal(false)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreatePurchaseRequest} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Désignation des Fournitures Requises *</label>
                <textarea
                  rows={3}
                  required
                  value={prDescription}
                  onChange={e => setPrDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Montant Estimé HT (DA) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={prAmountHT}
                    onChange={e => setPrAmountHT(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Niveau d'Urgence</label>
                  <select
                    value={prUrgency}
                    onChange={e => setPrUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  >
                    <option value="NORMALE">Normale</option>
                    <option value="URGENTE">Urgente (Bloquante)</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowPurchaseRequestModal(false)} className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 cursor-pointer">Annuler</button>
                <button type="submit" disabled={prSubmitting} className="px-4 py-2 bg-[#0B207D] text-white font-semibold rounded-md hover:bg-[#07164D] disabled:opacity-50 cursor-pointer">
                  {prSubmitting ? 'Émission en cours...' : 'Transmettre aux Achats'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sortie Réelle Stock */}
      {showStockConsumptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-[#0A7F7C] text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4" />
                <span>Déclarer une Sortie Réelle de Stock Chantier</span>
              </div>
              <button onClick={() => setShowStockConsumptionModal(false)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateStockConsumption} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Désignation Article / Fourniture *</label>
                <input
                  type="text"
                  required
                  value={stockItemName}
                  onChange={e => setStockItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0A7F7C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Quantité Consommée *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockQty}
                    onChange={e => setStockQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0A7F7C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Coût Unitaire (DA) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockUnitCost}
                    onChange={e => setStockUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0A7F7C]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Zone d'Imputation / ISO *</label>
                <input
                  type="text"
                  required
                  value={stockWorkZone}
                  onChange={e => setStockWorkZone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0A7F7C]"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowStockConsumptionModal(false)} className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 cursor-pointer">Annuler</button>
                <button type="submit" disabled={stockSubmitting} className="px-4 py-2 bg-[#0A7F7C] text-white font-semibold rounded-md hover:bg-[#086663] disabled:opacity-50 cursor-pointer">
                  {stockSubmitting ? 'Enregistrement...' : 'Valider la Sortie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE : ENREGISTRER UN POINTAGE JOURNALIER MAIN-D'ŒUVRE */}
      {/* ========================================================================= */}
      {showTimesheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-4 bg-[#0B207D] text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <HardHat className="w-4 h-4" />
                <span>Enregistrer un Pointage Journalier Main-d'Œuvre</span>
              </div>
              <button onClick={() => setShowTimesheetModal(false)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveTimesheet} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nom de l'Intervenant *</label>
                  <input
                    type="text"
                    required
                    value={tsWorkerName}
                    onChange={e => setTsWorkerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Corps d'État *</label>
                  <select
                    value={tsCorpsEtat}
                    onChange={e => setTsCorpsEtat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  >
                    <option value="SOUDEUR_ASME">Soudeur ASME IX / ISO 9606</option>
                    <option value="TUYAUTEUR_ISO">Tuyauteur Industriel ISO</option>
                    <option value="MONTEUR_ECHAFAUDEUR">Monteur Échafaudeur R408</option>
                    <option value="CHEF_EQUIPE">Chef d'Équipe Tuyauterie</option>
                    <option value="CONTROLEUR_CND">Contrôleur CND COFREND</option>
                    <option value="MANOEUVRE">Aide / Manœuvre de Chantier</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Qualification / Habilitation *</label>
                <input
                  type="text"
                  required
                  value={tsQualification}
                  onChange={e => setTsQualification(e.target.value)}
                  placeholder="ex: ASME IX 6G TIG/SMAW, R408, H0/B0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={tsDate}
                    onChange={e => setTsDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Heures Normales (HN)</label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    required
                    value={tsNormalHours}
                    onChange={e => setTsNormalHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Heures Sup (HS)</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    step="0.5"
                    value={tsOvertimeHours}
                    onChange={e => setTsOvertimeHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Intempéries / Attente</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    step="0.5"
                    value={tsWeatherHours}
                    onChange={e => setTsWeatherHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Taux Horaire (DA) *</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={tsHourlyRate}
                    onChange={e => setTsHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Ratio Productivité</label>
                  <input
                    type="number"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={tsProductivityRatio}
                    onChange={e => setTsProductivityRatio(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Réf Tâche WBS / Zone</label>
                <input
                  type="text"
                  value={tsTaskRef}
                  onChange={e => setTsTaskRef(e.target.value)}
                  placeholder="ex: TSK-05, Soudure rack Sud"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-600 font-semibold">Coût Main-d'Œuvre Imputé :</span>
                <span className="text-base font-extrabold text-[#07164D]">
                  {formatCurrencyDA(
                    (tsNormalHours * tsHourlyRate) + (tsOvertimeHours * tsHourlyRate * 1.5) + (tsWeatherHours * tsHourlyRate * 0.75),
                    false
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowTimesheetModal(false)} className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Annuler
                </button>
                <button type="submit" disabled={tsSubmitting} className="px-4 py-2 bg-[#0B207D] text-white font-semibold rounded-md hover:bg-[#07164D] disabled:opacity-50 cursor-pointer">
                  {tsSubmitting ? 'Enregistrement...' : 'Valider & Imputer Coût MO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE : PV DE RÉCEPTION PROVISOIRE (PVRP) */}
      {/* ========================================================================= */}
      {showPvrpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-[#0B207D] text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Prononcer le PV de Réception Provisoire (PVRP)</span>
              </div>
              <button onClick={() => setShowPvrpModal(false)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSavePvrp} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date du PV de Réception Provisoire *</label>
                <input
                  type="date"
                  required
                  value={pvrpDate}
                  onChange={e => setPvrpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Statut de la Réception *</label>
                <select
                  value={pvrpStatus}
                  onChange={e => setPvrpStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                >
                  <option value="VALIDE_SANS_RESERVE">Validé Sans Réserve (Conforme aux spécifications)</option>
                  <option value="RESERVES_EN_COURS">Avec Réserves Mineures (Délai de levée imparti)</option>
                  <option value="VALIDE_RESERVES_LEVEES">Réserves Entièrement Levées</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Signataire Représentant Maître d'Ouvrage *</label>
                <input
                  type="text"
                  required
                  value={pvrpClientSignatory}
                  onChange={e => setPvrpClientSignatory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nombre de Réserves</label>
                  <input
                    type="number"
                    min="0"
                    value={pvrpReservesCount}
                    onChange={e => setPvrpReservesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={pvrpReservesLifted}
                      onChange={e => setPvrpReservesLifted(e.target.checked)}
                      className="rounded border-slate-300 text-[#0B207D]"
                    />
                    Réserves Levées
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Observations / Rapport d'Essais *</label>
                <textarea
                  rows={3}
                  required
                  value={pvrpNotes}
                  onChange={e => setPvrpNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowPvrpModal(false)} className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Annuler
                </button>
                <button type="submit" disabled={pvrpSubmitting} className="px-4 py-2 bg-[#0B207D] text-white font-semibold rounded-md hover:bg-[#07164D] disabled:opacity-50 cursor-pointer">
                  {pvrpSubmitting ? 'Enregistrement...' : 'Enregistrer le PVRP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE : PV DE RÉCEPTION DÉFINITIVE (PVRD) & LIBÉRATION RETENUE 5% */}
      {/* ========================================================================= */}
      {showPvrdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>PV de Réception Définitive (PVRD) & Mainlevée Retenue</span>
              </div>
              <button onClick={() => setShowPvrdModal(false)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSavePvrd} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  Gouvernance SoD — Direction Générale Uniquement
                </div>
                <div className="text-[11px]">
                  Cette signature formelle acte la fin de la période de garantie contractuelle de 12 mois et autorise la libération de la retenue de garantie (5%).
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date du PV de Réception Définitive *</label>
                <input
                  type="date"
                  required
                  value={pvrdDate}
                  onChange={e => setPvrdDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Montant de la Retenue de Garantie (5%)</div>
                <div className="text-lg font-extrabold text-[#07164D] mt-0.5">
                  {formatCurrencyDA(contractAmountNum * 0.05, false)}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Restitution intégrale par virement bancaire ordonnancée
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Motif de Clôture & Visa DG *</label>
                <textarea
                  rows={3}
                  required
                  value={pvrdNotes}
                  onChange={e => setPvrdNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowPvrdModal(false)} className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Annuler
                </button>
                <button type="submit" disabled={pvrdSubmitting} className="px-4 py-2 bg-emerald-700 text-white font-semibold rounded-md hover:bg-emerald-800 disabled:opacity-50 cursor-pointer">
                  {pvrdSubmitting ? 'Validation...' : 'Valider PVRD & Libérer la Retenue (DG)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChangeDatesModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
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
