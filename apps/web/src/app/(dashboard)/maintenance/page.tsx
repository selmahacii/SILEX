'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDateDZ, formatCurrencyDA } from '@silex/shared';
import {
  Truck,
  Wrench,
  ShieldCheck,
  AlertCircle,
  Plus,
  CheckCircle,
  Clock,
  Activity,
  AlertTriangle,
  RotateCw,
  FolderGit2,
  Search,
  Filter,
  X,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  FileText,
  CheckSquare,
  Zap,
  Flame,
  HardHat,
  ClipboardCheck,
  Settings,
  AlertOctagon,
  ArrowRight,
  Gauge,
  Building,
  Droplet,
  Scale,
  Building2,
  Trash2,
  DollarSign,
  Package,
  Edit3,
  ExternalLink,
  History,
  Calendar,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Info,
} from 'lucide-react';

export interface OTSparePart {
  id: string;
  mode: 'STOCK' | 'CUSTOM';
  itemId: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export default function MaintenancePage() {
  const { activeRole } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'assets' | 'orders'>('assets');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Search
  const [searchAsset, setSearchAsset] = useState('');
  const [searchOrder, setSearchOrder] = useState('');

  // Multi-Criteria Filters for Assets
  const [filterAssetStatus, setFilterAssetStatus] = useState<string>('ALL');
  const [filterAssetType, setFilterAssetType] = useState<string>('ALL');
  const [filterAssetProject, setFilterAssetProject] = useState<string>('ALL');

  // Multi-Criteria Filters for Orders
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>('ALL');
  const [filterOrderType, setFilterOrderType] = useState<string>('ALL');
  const [filterOrderPriority, setFilterOrderPriority] = useState<string>('ALL');

  // Modal Fiche Matériel & Historique Complet
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<any | null>(null);

  // Modal Modifier Équipement
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<any | null>(null);
  const [editAssetName, setEditAssetName] = useState('');
  const [editAssetBrand, setEditAssetBrand] = useState('');
  const [editAssetModel, setEditAssetModel] = useState('');
  const [editAssetSerial, setEditAssetSerial] = useState('');
  const [editAssetType, setEditAssetType] = useState('');
  const [editAssetProjectId, setEditAssetProjectId] = useState('');
  const [editAssetStatus, setEditAssetStatus] = useState('');

  // Modal Nouvel Équipement
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('ENGIN_LEVAGE');
  const [assetBrand, setAssetBrand] = useState('Caterpillar');
  const [assetModel, setAssetModel] = useState('320D-GC');
  const [assetSerial, setAssetSerial] = useState('CAT-DZ-');
  const [assetProjectId, setAssetProjectId] = useState('');

  // Modal Nouvel Ordre de Travail (Multi-Modes & Ultra-Détaillé)
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderAssetId, setOrderAssetId] = useState('');
  const [orderInterventionMode, setOrderInterventionMode] = useState<'PREVENTIVE' | 'CORRECTIVE' | 'REGULATORY'>('PREVENTIVE');

  // Mode 1: Maintenance Préventive Programmée (PPM)
  const [preventiveCycle, setPreventiveCycle] = useState('250H');
  const [checkVidange, setCheckVidange] = useState(true);
  const [checkFiltres, setCheckFiltres] = useState(true);
  const [checkGraissage, setCheckGraissage] = useState(true);
  const [checkElectrique, setCheckElectrique] = useState(true);
  const [checkEtancheite, setCheckEtancheite] = useState(false);

  // Mode 2: Dépannage Curatif / Panne d'Urgence (CM)
  const [curativeSeverity, setCurativeSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');
  const [immediateImmobilization, setImmediateImmobilization] = useState(true);
  const [breakdownSymptom, setBreakdownSymptom] = useState('');
  const [sparePartsNeeded, setSparePartsNeeded] = useState('');

  // Mode 3: Visite Réglementaire & Sécurité (VGP Algérie)
  const [regulatoryOrganism, setRegulatoryOrganism] = useState('APAVE Algérie');
  const [regulatoryType, setRegulatoryType] = useState('VGP_LEVAGE');
  const [previousCertNumber, setPreviousCertNumber] = useState('');
  const [validityMonths, setValidityMonths] = useState(12);

  // HSE & Sécurité Chantier (Réglementation Sonatrach / Pétrochimie)
  const [hseHotWork, setHseHotWork] = useState(false);
  const [hseLoto, setHseLoto] = useState(true);
  const [hsePpe, setHsePpe] = useState(true);
  const [hseAreaSafety, setHseAreaSafety] = useState(true);

  // Données communes & Chiffrage analytique (Main d'œuvre, Pièces & Sous-traitance)
  const [orderDescription, setOrderDescription] = useState('');
  const [orderScheduledDate, setOrderScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderCost, setOrderCost] = useState<number>(0);
  const [orderTechnician, setOrderTechnician] = useState('');
  const [laborHours, setLaborHours] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(1500);
  const [externalSubcontractCost, setExternalSubcontractCost] = useState<number>(0);

  // Pièces de rechange issues du Stock Magasin Central SILEX
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [otSpareParts, setOtSpareParts] = useState<OTSparePart[]>([]);

  const addOTSparePart = () => {
    const itm = inventoryItems[0];
    setOtSpareParts(prev => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        mode: itm ? 'STOCK' : 'CUSTOM',
        itemId: itm?.id || '',
        name: itm?.name || 'Pièce / Fourniture de rechange',
        quantity: 1,
        unitCost: Number(itm?.unitCost || 5000),
      },
    ]);
  };

  const removeOTSparePart = (id: string) => {
    setOtSpareParts(prev => prev.filter(p => p.id !== id));
  };

  const updateOTSparePart = (id: string, updates: Partial<OTSparePart>) => {
    setOtSpareParts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        if (updates.itemId && updates.itemId !== p.itemId) {
          const itm = (Array.isArray(inventoryItems) ? inventoryItems : []).find(i => i.id === updates.itemId);
          if (itm) {
            updated.name = itm.name;
            updated.unitCost = Number(itm.unitCost || 0);
          }
        }
        return updated;
      })
    );
  };

  // Calculs dynamiques du chiffrage de l'ordre de travail
  const calculatedLaborCost = laborHours * hourlyRate;
  const calculatedPartsCost = otSpareParts.reduce((acc, p) => acc + (Number(p.quantity || 0) * Number(p.unitCost || 0)), 0);
  const calculatedTotalOTCost = calculatedLaborCost + calculatedPartsCost + Number(externalSubcontractCost || 0);

  // Presets Helpers
  const applyPreventivePreset = (preset: '250H' | '500H' | '1000H' | 'MISE_EN_SERVICE') => {
    setPreventiveCycle(preset);
    if (preset === '250H') {
      setOrderDescription('Révision périodique 250h : vidange huile moteur 15W40, filtre à huile, filtre gasoil, graissage des paliers et contrôle tension courroies.');
      setOrderCost(45000);
      setCheckVidange(true);
      setCheckFiltres(true);
      setCheckGraissage(true);
      setOrderTechnician('Équipe Mécanique SILEX Chantiers');
    } else if (preset === '500H') {
      setOrderDescription('Révision intermédiaire 500h : vidange complète, cartouches air primaire/secondaire, préfiltre décanteur gasoil, contrôle batterie 24V et étanchéité circuit hydraulique.');
      setOrderCost(78000);
      setCheckVidange(true);
      setCheckFiltres(true);
      setCheckGraissage(true);
      setCheckEtancheite(true);
      setOrderTechnician('Équipe Mécanique SILEX Chantiers');
    } else if (preset === '1000H') {
      setOrderDescription('Grande révision générale 1000h : renouvellement huile hydraulique ISO VG 46, vidange pont/réducteur, tarage injecteurs diesel, contrôle compression moteur et calage pompe.');
      setOrderCost(185000);
      setCheckVidange(true);
      setCheckFiltres(true);
      setCheckGraissage(true);
      setCheckElectrique(true);
      setCheckEtancheite(true);
      setOrderTechnician('Équipe Spécialisée SILEX & Support Constructeur');
    } else {
      setOrderDescription("Inspection générale de mise en service chantier : vérification conformité d'accès site pétrochimique, test à vide et en charge, extincteur et balisage.");
      setOrderCost(30000);
      setOrderTechnician('Superviseur Matériel SILEX');
    }
  };

  const applyCurativePreset = (symptom: string, costEst: number, parts: string) => {
    setBreakdownSymptom(symptom);
    setOrderDescription(`Intervention curative d'urgence suite à défaillance : ${symptom}. Démontage, diagnostic approfondi, remplacement de la pièce défectueuse et essais de pression en charge.`);
    setOrderCost(costEst);
    setSparePartsNeeded(parts);
    setImmediateImmobilization(true);
    setOrderTechnician("Équipe d'Intervention Rapide SILEX");
  };

  const applyRegulatoryPreset = (org: string, type: string, costEst: number, validity: number) => {
    setRegulatoryOrganism(org);
    setRegulatoryType(type);
    setValidityMonths(validity);
    setOrderCost(costEst);
    setOrderTechnician(`${org} — Inspecteur Agréé`);
    if (type === 'VGP_LEVAGE') {
      setOrderDescription("Visite Générale Périodique (VGP) annuelle d'appareil de levage selon arrêté interministériel. Essais statiques (surcharge 1.25), essais dynamiques (surcharge 1.1) et contrôle d'usure des câbles.");
    } else if (type === 'EPREUVE_HYDRO') {
      setOrderDescription("Épreuve hydrostatique réglementaire à froid et tarage des soupapes de sûreté sous pression (Directives Sonatrach DP). Délivrance du certificat d'épreuve.");
    } else if (type === 'CND_MAGNETO') {
      setOrderDescription("Contrôle Non Destructif (CND) par magnétoscopie et ressuage sur soudures maîtresses de flèche, châssis et crochets de levage. Rapport d'inspection formel.");
    } else {
      setOrderDescription("Audit de conformité électrique et mesure de boucle de terre des groupes électrogènes et armoires de chantier. Attestation de conformité réglementaire.");
    }
  };

  // Modale Traitement & Clôture OT
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<any | null>(null);
  const [orderActionType, setOrderActionType] = useState<'START' | 'COMPLETE' | 'HOLD' | 'CANCEL'>('COMPLETE');
  const [interventionReport, setInterventionReport] = useState('');
  const [actualFinalCost, setActualFinalCost] = useState<number>(65000);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      const [asts, ords, prjs, itms] = await Promise.all([
        api.get<any[]>('/fleet/assets'),
        api.get<any[]>('/fleet/maintenance-orders'),
        api.get<any[]>('/projects'),
        api.get<any[]>('/inventory/items'),
      ]);
      setAssets(Array.isArray(asts) ? asts : []);
      setOrders(Array.isArray(ords) ? ords : []);
      setProjects(Array.isArray(prjs) ? prjs : []);
      setInventoryItems(Array.isArray(itms) ? itms : []);

      if (asts.length > 0 && !orderAssetId) setOrderAssetId(asts[0].id);
      if (prjs.length > 0 && !assetProjectId) setAssetProjectId(prjs[0].id);

      if (itms && itms.length > 0) {
        setOtSpareParts(prev =>
          prev.map((sp, idx) => {
            if (sp.mode === 'STOCK' && !sp.itemId) {
              const itm = itms[idx % itms.length] || itms[0];
              return {
                ...sp,
                itemId: itm.id,
                name: itm.name,
                unitCost: Number(itm.unitCost || sp.unitCost),
              };
            }
            return sp;
          })
        );
      }
    } catch (err) {
      console.error('Erreur maintenance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenanceData();
  }, [activeRole]);

  // Availability calculation
  const operationalCount = assets.filter(a => a.status === 'OPERATIONAL').length;
  const availabilityRate = assets.length > 0 ? ((operationalCount / assets.length) * 100).toFixed(1) : '100';

  const handleToggleAssetStatus = async (asset: any) => {
    try {
      const newStatus = asset.status === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL';
      // Mise à jour visuelle instantanée
      setAssets(prev => prev.map(a => (a.id === asset.id ? { ...a, status: newStatus } : a)));
      if (selectedAssetForDetail?.id === asset.id) {
        setSelectedAssetForDetail((prev: any) => ({ ...prev, status: newStatus }));
      }
      setNotification(`Statut de ${asset.name} mis à jour : ${newStatus === 'OPERATIONAL' ? 'Remis en service (Opérationnel)' : 'Immobilisé (En Maintenance)'}.`);
      setTimeout(() => setNotification(null), 5000);

      await api.patch(`/fleet/assets/${asset.id}/status`, { status: newStatus });
      await loadMaintenanceData();
    } catch (err: any) {
      alert(err.message);
      await loadMaintenanceData();
    }
  };

  const handleOpenEditAsset = (asset: any) => {
    setSelectedAssetForEdit(asset);
    setEditAssetName(asset.name || '');
    setEditAssetBrand(asset.brand || '');
    setEditAssetModel(asset.model || '');
    setEditAssetSerial(asset.serialNumber || '');
    setEditAssetType(asset.assetType || 'POSTE_SOUDURE');
    setEditAssetProjectId(asset.currentProjectId || '');
    setEditAssetStatus(asset.status || 'OPERATIONAL');
  };

  const handleSaveAssetEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForEdit) return;
    try {
      const updated = await api.patch<any>(`/fleet/assets/${selectedAssetForEdit.id}`, {
        name: editAssetName,
        brand: editAssetBrand,
        model: editAssetModel,
        serialNumber: editAssetSerial,
        assetType: editAssetType,
        currentProjectId: editAssetProjectId || null,
        status: editAssetStatus,
      });

      setSelectedAssetForEdit(null);
      if (selectedAssetForDetail?.id === updated.id) {
        setSelectedAssetForDetail(updated);
      }
      await loadMaintenanceData();
      setNotification(`Fiche équipement ${updated.assetTag} mise à jour avec succès dans PostgreSQL !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la modification');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      // Mise à jour visuelle instantanée
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: nextStatus } : o)));
      setNotification(`Ordre de travail mis à jour : ${nextStatus}.`);
      setTimeout(() => setNotification(null), 5000);

      await api.patch(`/fleet/maintenance-orders/${orderId}/status`, { status: nextStatus });
      await loadMaintenanceData();
    } catch (err: any) {
      alert(err.message);
      await loadMaintenanceData();
    }
  };

  const handleSaveOrderAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForAction) return;
    try {
      let statusToSet = 'IN_PROGRESS';
      if (orderActionType === 'COMPLETE') statusToSet = 'COMPLETED';
      else if (orderActionType === 'HOLD') statusToSet = 'SCHEDULED';
      else if (orderActionType === 'CANCEL') statusToSet = 'CANCELLED';

      const orderId = selectedOrderForAction.id;
      // Mise à jour visuelle instantanée
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: statusToSet, cost: actualFinalCost } : o))
      );

      setSelectedOrderForAction(null);
      setInterventionReport('');
      setNotification(`Ordre de travail actualisé (${statusToSet}) !`);
      setTimeout(() => setNotification(null), 5000);

      await api.patch(`/fleet/maintenance-orders/${orderId}/status`, {
        status: statusToSet,
        interventionReport: interventionReport || undefined,
        cost: actualFinalCost,
      });
      await loadMaintenanceData();
    } catch (err: any) {
      alert(err.message || 'Erreur mise à jour ordre');
      await loadMaintenanceData();
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tag = `EQ-2026-${String(assets.length + 1).padStart(3, '0')}`;
      const created = await api.post<any>('/fleet/assets', {
        assetTag: tag,
        name: assetName,
        assetType,
        brand: assetBrand,
        model: assetModel,
        serialNumber: assetSerial + Math.floor(1000 + Math.random() * 9000),
        currentProjectId: assetProjectId || undefined,
        acquisitionDate: new Date().toISOString(),
      });

      setShowAssetModal(false);
      setAssetName('');
      await loadMaintenanceData();
      setNotification(`Équipement "${created.name}" (${created.assetTag}) enregistré avec succès dans PostgreSQL !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderAssetId) {
      alert('Veuillez sélectionner un équipement.');
      return;
    }
    try {
      let finalType: 'PREVENTIVE' | 'CORRECTIVE' = 'PREVENTIVE';
      let priorityToSet = 'NORMAL';
      let fullDescription = orderDescription;

      if (orderInterventionMode === 'CORRECTIVE') {
        finalType = 'CORRECTIVE';
        priorityToSet = curativeSeverity === 'CRITICAL' ? 'CRITICAL' : curativeSeverity === 'HIGH' ? 'HIGH' : 'NORMAL';
        const partsInfo = sparePartsNeeded ? ` | Pièces requises : ${sparePartsNeeded}` : '';
        fullDescription = `[DÉPANNAGE CURATIF - ${curativeSeverity}] Symptôme : ${breakdownSymptom}. ${orderDescription}${partsInfo}`;
      } else if (orderInterventionMode === 'REGULATORY') {
        finalType = 'PREVENTIVE';
        priorityToSet = 'REGLEMENTAIRE_VGP';
        fullDescription = `[VISITE RÉGLEMENTAIRE & SÉCURITÉ VGP] Organisme Agréé : ${regulatoryOrganism} | Type : ${regulatoryType} | N° PV Précédent : ${previousCertNumber || 'Nouveau'} | Validité : ${validityMonths} mois. ${orderDescription}`;
      } else {
        finalType = 'PREVENTIVE';
        priorityToSet = preventiveCycle === '1000H' ? 'HIGH' : 'NORMAL';
        const checks = [
          checkVidange ? 'Vidange 15W40' : null,
          checkFiltres ? 'Filtres huile/gasoil' : null,
          checkGraissage ? 'Graissage axes' : null,
          checkElectrique ? 'Contrôle électrique' : null,
          checkEtancheite ? 'Test étanchéité' : null,
        ].filter(Boolean).join(', ');
        fullDescription = `[MAINTENANCE PRÉVENTIVE ${preventiveCycle}] Checklist : ${checks}. ${orderDescription}`;
      }

      // Consignes de sécurité HSE
      const hseList = [
        hseLoto ? 'Consignation LOTO' : null,
        hseHotWork ? 'Permis travail chaud/à feu' : null,
        hsePpe ? 'EPI renforcés' : null,
        hseAreaSafety ? 'Balisage zone' : null,
      ].filter(Boolean).join(' | ');
      if (hseList) {
        fullDescription += ` (HSE : ${hseList})`;
      }

      // Ventilation détaillée des pièces déstockées et main d'œuvre
      if (otSpareParts.length > 0) {
        const partsSummary = (Array.isArray(otSpareParts) ? otSpareParts : []).map(p => `${p.quantity}x ${p.name} (${formatCurrencyDA(p.quantity * p.unitCost, false)})`).join(', ');
        fullDescription += ` | Pièces Magasin: ${partsSummary}`;
      }
      fullDescription += ` | MO: ${laborHours}h (${formatCurrencyDA(calculatedLaborCost, false)})`;

      const finalCostToCommit = Number(calculatedTotalOTCost || orderCost);

      const created = await api.post<any>('/fleet/maintenance-orders', {
        assetId: orderAssetId,
        type: finalType,
        priority: priorityToSet,
        description: fullDescription,
        scheduledDate: new Date(orderScheduledDate).toISOString(),
        cost: finalCostToCommit,
        technician: orderTechnician,
        immediateImmobilization: orderInterventionMode === 'CORRECTIVE' && (immediateImmobilization || curativeSeverity === 'CRITICAL'),
      });

      setShowOrderModal(false);
      await loadMaintenanceData();
      setNotification(`Ordre de travail ${created.orderNumber} émis avec succès (${priorityToSet}) ! Statut parc actualisé.`);
      setTimeout(() => setNotification(null), 6000);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'émission de l'ordre de travail");
    }
  };

  // Counts for Assets
  const countOperational = assets.filter(a => a.status === 'OPERATIONAL').length;
  const countMaintenance = assets.filter(a => a.status === 'MAINTENANCE').length;
  const countOutOfService = assets.filter(a => a.status === 'OUT_OF_SERVICE' || a.status === 'DECOMMISSIONED').length;

  // Counts for Orders
  const countScheduled = orders.filter(o => o.status === 'SCHEDULED').length;
  const countInProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
  const countCompleted = orders.filter(o => o.status === 'COMPLETED').length;
  const countUrgent = orders.filter(o => o.priority === 'CRITICAL' || o.priority === 'CRITIQUE').length;
  const countVGP = orders.filter(o => o.priority === 'REGLEMENTAIRE_VGP').length;

  const filteredAssets = assets.filter(a => {
    const term = searchAsset.toLowerCase().trim();
    if (term) {
      const matchesSearch =
        a.name?.toLowerCase().includes(term) ||
        a.assetTag?.toLowerCase().includes(term) ||
        a.brand?.toLowerCase().includes(term) ||
        a.model?.toLowerCase().includes(term) ||
        a.serialNumber?.toLowerCase().includes(term) ||
        a.assetType?.toLowerCase().includes(term) ||
        a.currentProject?.code?.toLowerCase().includes(term) ||
        a.currentProject?.name?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }
    if (filterAssetStatus !== 'ALL') {
      if (filterAssetStatus === 'OUT_OF_SERVICE') {
        if (a.status !== 'OUT_OF_SERVICE' && a.status !== 'DECOMMISSIONED') return false;
      } else if (a.status !== filterAssetStatus) {
        return false;
      }
    }
    if (filterAssetType !== 'ALL' && a.assetType !== filterAssetType) {
      return false;
    }
    if (filterAssetProject !== 'ALL') {
      if (filterAssetProject === 'CENTRAL') {
        if (a.currentProjectId) return false;
      } else if (a.currentProjectId !== filterAssetProject) {
        return false;
      }
    }
    return true;
  });

  const filteredOrders = orders.filter(o => {
    const term = searchOrder.toLowerCase().trim();
    if (term) {
      const matchesSearch =
        o.orderNumber?.toLowerCase().includes(term) ||
        o.asset?.name?.toLowerCase().includes(term) ||
        o.asset?.assetTag?.toLowerCase().includes(term) ||
        o.technician?.toLowerCase().includes(term) ||
        o.description?.toLowerCase().includes(term) ||
        o.priority?.toLowerCase().includes(term) ||
        o.type?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }
    if (filterOrderStatus !== 'ALL' && o.status !== filterOrderStatus) {
      return false;
    }
    if (filterOrderType !== 'ALL' && o.type !== filterOrderType) {
      return false;
    }
    if (filterOrderPriority !== 'ALL') {
      if (filterOrderPriority === 'CRITICAL') {
        if (o.priority !== 'CRITICAL' && o.priority !== 'CRITIQUE') return false;
      } else if (filterOrderPriority === 'REGULATORY') {
        if (o.priority !== 'REGLEMENTAIRE_VGP') return false;
      } else if (filterOrderPriority === 'HIGH') {
        if (o.priority !== 'HIGH' && o.priority !== 'HAUTE') return false;
      } else if (filterOrderPriority === 'NORMAL') {
        if (o.priority !== 'NORMAL') return false;
      }
    }
    return true;
  });

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

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#07164D] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#0B207D]" />
            Parc Matériel, Équipements & Maintenance Industrielle
          </h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Disponibilité opérationnelle des postes de soudure, centrales de froid, groupes électrogènes, engins de levage et véhicules chantiers SILEX SERVICES.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#0B207D] text-[#0B207D] rounded-md hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-[#0B207D]" />
            Émettre Ordre de Travail (OT)
          </button>
          <button
            onClick={() => setShowAssetModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-md hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvel Équipement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">
            Taux de Disponibilité Opérationnelle
          </div>
          <div className="text-xl font-extrabold text-[#0A7F7C] mt-1">
            {availabilityRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {operationalCount} sur {assets.length} équipements opérationnels
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">
            Équipements en Intervention
          </div>
          <div className="text-xl font-bold text-amber-700 mt-1">
            {assets.length - operationalCount} immobilisé(s)
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            En révision préventive ou réparation curative
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">
            Ordres de Travail Total
          </div>
          <div className="text-xl font-bold text-[#142B45] mt-1">
            {orders.length} interventions tracées
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Persistées et historisées dans PostgreSQL
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('assets')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'assets' ? 'border-[#0B207D] text-[#0B207D] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4 text-[#0B207D]" />
          Parc Équipements ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders' ? 'border-[#0B207D] text-[#0B207D] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 text-[#0B207D]" />
          Ordres de Travail & Maintenance ({orders.length})
        </button>
      </div>

      {/* TAB 1: Assets */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          {/* Quick Status Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setFilterAssetStatus('ALL')}
              className={`px-3 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                filterAssetStatus === 'ALL'
                  ? 'bg-[#0B207D] text-white border-[#0B207D] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tous ({assets.length})
            </button>
            <button
              onClick={() => setFilterAssetStatus('OPERATIONAL')}
              className={`px-3 py-1.5 rounded-full font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                filterAssetStatus === 'OPERATIONAL'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Opérationnels ({countOperational})
            </button>
            <button
              onClick={() => setFilterAssetStatus('MAINTENANCE')}
              className={`px-3 py-1.5 rounded-full font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                filterAssetStatus === 'MAINTENANCE'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              En Maintenance ({countMaintenance})
            </button>
            {countOutOfService > 0 && (
              <button
                onClick={() => setFilterAssetStatus('OUT_OF_SERVICE')}
                className={`px-3 py-1.5 rounded-full font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterAssetStatus === 'OUT_OF_SERVICE'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                    : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Hors Service ({countOutOfService})
              </button>
            )}
          </div>

          {/* Search and Dropdowns Bar */}
          <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px] flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par tag, nom, modèle, marque, N/S..."
                  value={searchAsset}
                  onChange={e => setSearchAsset(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
                />
                {searchAsset && (
                  <button
                    onClick={() => setSearchAsset('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Catégorie */}
              <select
                value={filterAssetType}
                onChange={e => setFilterAssetType(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#0B207D]"
              >
                <option value="ALL">Toutes Catégories</option>
                <option value="POSTE_SOUDURE">Postes de Soudure</option>
                <option value="GROUPE_ELECTROGENE">Groupes Électrogènes</option>
                <option value="ENGIN_LEVAGE">Engins de Levage / Grues</option>
                <option value="EQUIPEMENT_HVAC">Centrales HVAC & Froid</option>
                <option value="VEHICULE">Véhicules Chantiers / 4x4</option>
                <option value="MACHINE_OUTIL">Machines-Outils & Chanfreineuses</option>
              </select>

              {/* Chantier */}
              <select
                value={filterAssetProject}
                onChange={e => setFilterAssetProject(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#0B207D]"
              >
                <option value="ALL">Tous les Chantiers & Parcs</option>
                <option value="CENTRAL">Parc Central Arzew</option>
                {(Array.isArray(projects) ? projects : []).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>

              {(filterAssetStatus !== 'ALL' || filterAssetType !== 'ALL' || filterAssetProject !== 'ALL' || searchAsset) && (
                <button
                  onClick={() => {
                    setFilterAssetStatus('ALL');
                    setFilterAssetType('ALL');
                    setFilterAssetProject('ALL');
                    setSearchAsset('');
                  }}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Réinitialiser
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              <strong>{filteredAssets.length}</strong> sur {assets.length} équipement(s) affiché(s)
            </span>
          </div>

          {/* Cards Grid */}
          {filteredAssets.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#E1E6ED] p-12 text-center text-xs text-slate-500 space-y-2">
              <Truck className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-700">Aucun équipement ne correspond à vos critères de filtrage.</div>
              <div className="text-[11px] text-slate-400">Modifiez votre recherche ou réinitialisez les filtres ci-dessus.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(filteredAssets) ? filteredAssets : []).map(a => {
                const isOperational = a.status === 'OPERATIONAL';
                const assetOrders = orders.filter(o => o.assetId === a.id);
                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-lg border border-[#E1E6ED] p-4 shadow-2xs space-y-3 hover:border-[#0B207D] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div
                      className="space-y-2 cursor-pointer"
                      onClick={() => setSelectedAssetForDetail(a)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {a.assetTag}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                            isOperational
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOperational ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'
                            }`}
                          ></span>
                          {isOperational ? 'OPÉRATIONNEL' : 'EN MAINTENANCE'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 group-hover:text-[#0B207D] transition-colors leading-tight">
                        {a.name}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        {a.brand} {a.model} • N/S : <span className="font-mono">{a.serialNumber}</span>
                      </div>

                      <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between items-center">
                        <span>Catégorie : <strong>{a.assetType}</strong></span>
                        {a.currentProject?.code ? (
                          <Link
                            href={`/projects/${a.currentProject.code}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 font-semibold text-[#0B207D] hover:underline bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 transition-colors"
                          >
                            {a.currentProject.code}
                            <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
                          </Link>
                        ) : (
                          <span className="font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            Parc Central Arzew
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <History className="w-3 h-3 text-[#0A7F7C]" />
                          <strong>{assetOrders.length}</strong> intervention(s) historisée(s)
                        </span>
                        <span className="text-[#0B207D] font-semibold text-[10px] group-hover:underline flex items-center gap-0.5">
                          Fiche & Historique <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedAssetForDetail(a)}
                        className="px-2 py-1.5 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition-colors flex-1 flex items-center justify-center gap-1 cursor-pointer"
                        title="Consulter l'historique complet et la fiche technique"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        Fiche
                      </button>

                      <button
                        onClick={() => {
                          setOrderAssetId(a.id);
                          setShowOrderModal(true);
                        }}
                        className="px-2 py-1.5 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-[#0B207D] rounded border border-blue-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Émettre un ordre de travail pour cette machine"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        + OT
                      </button>

                      <button
                        onClick={() => handleToggleAssetStatus(a)}
                        className={`text-[11px] font-semibold px-2.5 py-1.5 rounded transition-colors flex-1 cursor-pointer ${
                          isOperational
                            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                        title="Basculer le statut d'intervention"
                      >
                        {isOperational ? (
                          <span className="inline-flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Maintenance
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Remettre
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEditAsset(a)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                        title="Modifier la fiche équipement"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Maintenance Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Quick Order Status Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setFilterOrderStatus('ALL')}
              className={`px-3 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                filterOrderStatus === 'ALL'
                  ? 'bg-[#0B207D] text-white border-[#0B207D] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tous ({orders.length})
            </button>
            <button
              onClick={() => setFilterOrderStatus('SCHEDULED')}
              className={`px-3 py-1.5 rounded-full font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                filterOrderStatus === 'SCHEDULED'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
              }`}
            >
              Planifiés ({countScheduled})
            </button>
            <button
              onClick={() => setFilterOrderStatus('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-full font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                filterOrderStatus === 'IN_PROGRESS'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
              }`}
            >
              En cours ({countInProgress})
            </button>
            <button
              onClick={() => setFilterOrderStatus('COMPLETED')}
              className={`px-3 py-1.5 rounded-full font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                filterOrderStatus === 'COMPLETED'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Clôturés Conformes ({countCompleted})
            </button>
            {countUrgent > 0 && (
              <button
                onClick={() => setFilterOrderPriority(filterOrderPriority === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
                className={`px-3 py-1.5 rounded-full font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterOrderPriority === 'CRITICAL'
                    ? 'bg-red-700 text-white border-red-700 shadow-xs'
                    : 'bg-white text-red-800 border-red-300 hover:bg-red-50'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                Arrêt Chantier ({countUrgent})
              </button>
            )}
            {countVGP > 0 && (
              <button
                onClick={() => setFilterOrderPriority(filterOrderPriority === 'REGULATORY' ? 'ALL' : 'REGULATORY')}
                className={`px-3 py-1.5 rounded-full font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterOrderPriority === 'REGULATORY'
                    ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                    : 'bg-white text-indigo-800 border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                VGP Réglementaire ({countVGP})
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2 flex-1 min-w-[260px] flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Rechercher par N° OT, matériel, technicien, mot-clé..."
                    value={searchOrder}
                    onChange={e => setSearchOrder(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
                  />
                  {searchOrder && (
                    <button
                      onClick={() => setSearchOrder('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={filterOrderType}
                  onChange={e => setFilterOrderType(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#0B207D]"
                >
                  <option value="ALL">Tous les Types</option>
                  <option value="PREVENTIVE">Préventif (PPM)</option>
                  <option value="CORRECTIVE">Correctif / Curatif (CM)</option>
                </select>

                <select
                  value={filterOrderPriority}
                  onChange={e => setFilterOrderPriority(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#0B207D]"
                >
                  <option value="ALL">Toutes Priorités</option>
                  <option value="CRITICAL">Arrêt Chantier (Critique)</option>
                  <option value="REGULATORY">Visite Réglementaire VGP</option>
                  <option value="HIGH">Urgence Haute</option>
                  <option value="NORMAL">Normal</option>
                </select>

                {(filterOrderStatus !== 'ALL' || filterOrderType !== 'ALL' || filterOrderPriority !== 'ALL' || searchOrder) && (
                  <button
                    onClick={() => {
                      setFilterOrderStatus('ALL');
                      setFilterOrderType('ALL');
                      setFilterOrderPriority('ALL');
                      setSearchOrder('');
                    }}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Réinitialiser
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-500 font-medium">
                <strong>{filteredOrders.length}</strong> sur {orders.length} intervention(s)
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                  <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="font-semibold text-slate-700">Aucun ordre de travail ne correspond à votre filtre.</div>
                </div>
              ) : (
                (Array.isArray(filteredOrders) ? filteredOrders : []).map(o => {
                  const isCompleted = o.status === 'COMPLETED';
                  const isInProgress = o.status === 'IN_PROGRESS';
                  return (
                    <div
                      key={o.id}
                      className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {o.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isInProgress
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {o.status}
                          </span>
                          {o.priority === 'CRITICAL' || o.priority === 'CRITIQUE' ? (
                            <span className="text-[10px] font-extrabold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded flex items-center gap-1">
                              <AlertOctagon className="w-3 h-3 text-red-600" />
                              ARRÊT CHANTIER
                            </span>
                          ) : o.priority === 'REGLEMENTAIRE_VGP' ? (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-indigo-600" />
                              VGP RÉGLEMENTAIRE
                            </span>
                          ) : o.priority === 'HIGH' || o.priority === 'HAUTE' ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              URGENCE HAUTE
                            </span>
                          ) : null}
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {o.type}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                          <span>Équipement :</span>
                          <button
                            onClick={() => {
                              const matchingAsset = (Array.isArray(assets) ? assets : []).find(a => a.id === o.assetId) || o.asset;
                              if (matchingAsset) setSelectedAssetForDetail(matchingAsset);
                            }}
                            className="text-[#0B207D] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {o.asset?.name} ({o.asset?.assetTag})
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-600 leading-relaxed">
                          <em>{o.description}</em>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center gap-3 flex-wrap">
                          <span>
                            Intervenant : <strong>{o.technician || 'Équipe interne SILEX'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Planifié le : <strong>{formatDateDZ(o.scheduledDate)}</strong>
                          </span>
                          {o.completedDate && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">
                                Réalisé le : {formatDateDZ(o.completedDate)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex md:flex-col items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-[#07164D]">{formatCurrencyDA(o.cost || 0, false)}</div>
                          <div className="text-[10px] text-slate-400">Coût estimé / engagé</div>
                        </div>

                        <div className="flex gap-1.5 flex-wrap justify-end">
                          <button
                            onClick={() => {
                              setSelectedOrderForAction(o);
                              setOrderActionType(isCompleted ? 'COMPLETE' : isInProgress ? 'COMPLETE' : 'START');
                              setActualFinalCost(Number(o.cost || 0));
                              setInterventionReport(o.description || '');
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-[#0B207D] text-[#0B207D] hover:bg-blue-50 rounded cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <FileText className="w-3 h-3" />
                            Traiter / Rapport OT
                          </button>

                          {!isCompleted && !isInProgress && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                            >
                              Démarrer
                            </button>
                          )}

                          {!isCompleted && (
                            <button
                              onClick={() => {
                                setSelectedOrderForAction(o);
                                setOrderActionType('COMPLETE');
                                setActualFinalCost(Number(o.cost || 0));
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer"
                            >
                              Clôturer Conforme
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1 : FICHE MATÉRIEL & HISTORIQUE DES INTERVENTIONS (DETAIL MODAL) */}
      {/* ========================================================================= */}
      {selectedAssetForDetail && (() => {
        const a = selectedAssetForDetail;
        const isOperational = a.status === 'OPERATIONAL';
        const assetOrders = orders.filter(o => o.assetId === a.id || o.asset?.id === a.id);
        const totalAssetExpense = assetOrders.reduce((acc, o) => acc + Number(o.cost || 0), 0);
        const activeProject = (Array.isArray(projects) ? projects : []).find(p => p.id === a.currentProjectId) || a.currentProject;

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-[#0B207D]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {a.assetTag}
                      </span>
                      <h3 className="text-base font-bold text-[#07164D]">{a.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${
                          isOperational
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOperational ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'
                          }`}
                        ></span>
                        {isOperational ? 'OPÉRATIONNEL' : 'EN MAINTENANCE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {a.brand} {a.model} • Numéro de Série / Châssis : <strong className="font-mono text-slate-800">{a.serialNumber}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAssetForDetail(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Technical & Project Spec Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Affectation / Chantier</div>
                  <div className="font-bold text-[#07164D] mt-0.5 truncate">
                    {activeProject?.code ? (
                      <Link
                        href={`/projects/${activeProject.code}`}
                        className="inline-flex items-center gap-1 text-[#0B207D] hover:underline"
                      >
                        {activeProject.code} — {activeProject.name}
                        <ExternalLink className="w-3 h-3 text-blue-500 shrink-0" />
                      </Link>
                    ) : (
                      'Parc Central Arzew'
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Catégorie Matériel</div>
                  <div className="font-bold text-slate-800 mt-0.5">{a.assetType}</div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Interventions OT</div>
                  <div className="font-bold text-[#0B207D] mt-0.5">
                    {assetOrders.length} enregistrée(s)
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Coûts de Maintenance</div>
                  <div className="font-bold text-emerald-800 mt-0.5">
                    {formatCurrencyDA(totalAssetExpense, false)}
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="flex items-center justify-between gap-2 p-3 bg-blue-50/40 rounded-lg border border-blue-100 flex-wrap">
                <div className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#0B207D]" />
                  <span>Actions Directes sur cet Équipement :</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleToggleAssetStatus(a)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                      isOperational
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                    }`}
                  >
                    {isOperational ? 'Basculer en Maintenance' : 'Remettre en Service Opérationnel'}
                  </button>

                  <button
                    onClick={() => {
                      setOrderAssetId(a.id);
                      setShowOrderModal(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#0B207D] text-white hover:bg-[#07164D] rounded transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Émettre un OT pour cet équipement
                  </button>

                  <button
                    onClick={() => handleOpenEditAsset(a)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    Modifier Fiche
                  </button>
                </div>
              </div>

              {/* Historique des Interventions OT */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[#0A7F7C]" />
                    Historique & Registre des Interventions ({assetOrders.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Traçabilité complète PostgreSQL (Sonatrach / HSE)
                  </span>
                </div>

                {assetOrders.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      Aucune intervention de maintenance n'a encore été enregistrée pour cet équipement.
                    </p>
                    <button
                      onClick={() => {
                        setOrderAssetId(a.id);
                        setShowOrderModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded hover:bg-[#07164D] cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Planifier la 1ère Intervention (Préventive ou VGP)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {(Array.isArray(assetOrders) ? assetOrders : []).map(o => {
                      const isCompleted = o.status === 'COMPLETED';
                      const isInProgress = o.status === 'IN_PROGRESS';
                      return (
                        <div
                          key={o.id}
                          className="p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors space-y-2"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {o.orderNumber}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  isCompleted
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : isInProgress
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {o.status}
                              </span>
                              {o.priority === 'CRITICAL' || o.priority === 'CRITIQUE' ? (
                                <span className="text-[10px] font-extrabold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded">
                                  ARRÊT CHANTIER
                                </span>
                              ) : o.priority === 'REGLEMENTAIRE_VGP' ? (
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                                  VGP RÉGLEMENTAIRE
                                </span>
                              ) : null}
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                {o.type}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-bold text-xs text-[#07164D]">
                                {formatCurrencyDA(o.cost || 0, false)}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedOrderForAction(o);
                                  setOrderActionType(isCompleted ? 'COMPLETE' : isInProgress ? 'COMPLETE' : 'START');
                                  setActualFinalCost(Number(o.cost || 0));
                                  setInterventionReport(o.description || '');
                                }}
                                className="px-2 py-1 text-[11px] font-semibold bg-white border border-[#0B207D] text-[#0B207D] hover:bg-blue-50 rounded cursor-pointer"
                              >
                                Traiter / Rapport
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-slate-800 leading-relaxed font-medium">
                            {o.description}
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5 flex-wrap gap-2">
                            <span>
                              Intervenant : <strong>{o.technician || 'Équipe interne'}</strong>
                            </span>
                            <span>
                              Date : <strong>{formatDateDZ(o.scheduledDate)}</strong>
                              {o.completedDate && ` (Clôturé le ${formatDateDZ(o.completedDate)})`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Close Button */}
              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  onClick={() => setSelectedAssetForDetail(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 2 : MODIFIER UN ÉQUIPEMENT EXISTANT (PATCH /fleet/assets/:id) */}
      {/* ========================================================================= */}
      {selectedAssetForEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0B207D]" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">
                    Modifier Fiche : {selectedAssetForEdit.assetTag}
                  </h3>
                  <p className="text-[11px] text-slate-500">Mise à jour des caractéristiques techniques et de l'affectation.</p>
                </div>
              </div>
              <button onClick={() => setSelectedAssetForEdit(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssetEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Désignation de l'Équipement *</label>
                <input
                  type="text"
                  value={editAssetName}
                  onChange={e => setEditAssetName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catégorie *</label>
                  <select
                    value={editAssetType}
                    onChange={e => setEditAssetType(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-medium"
                  >
                    <option value="POSTE_SOUDURE">Machine de Soudage Autonome</option>
                    <option value="GROUPE_ELECTROGENE">Groupe Électrogène</option>
                    <option value="ENGIN_LEVAGE">Engin Lourd / Grue Mobile</option>
                    <option value="EQUIPEMENT_HVAC">Centrale Froid / HVAC</option>
                    <option value="VEHICULE">Véhicule de Liaison / 4x4</option>
                    <option value="MACHINE_OUTIL">Machine-Outil / Chanfreineuse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Statut Opérationnel *</label>
                  <select
                    value={editAssetStatus}
                    onChange={e => setEditAssetStatus(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-semibold"
                  >
                    <option value="OPERATIONAL">Opérationnel</option>
                    <option value="MAINTENANCE">En Maintenance</option>
                    <option value="OUT_OF_SERVICE">Hors Service / Réforme</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Marque *</label>
                  <input
                    type="text"
                    value={editAssetBrand}
                    onChange={e => setEditAssetBrand(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Modèle</label>
                  <input
                    type="text"
                    value={editAssetModel}
                    onChange={e => setEditAssetModel(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Numéro de Série / Châssis *</label>
                  <input
                    type="text"
                    value={editAssetSerial}
                    onChange={e => setEditAssetSerial(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Affectation Chantier</label>
                  <select
                    value={editAssetProjectId}
                    onChange={e => setEditAssetProjectId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-medium"
                  >
                    <option value="">Parc Central Arzew (Non assigné)</option>
                    {(Array.isArray(projects) ? projects : []).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssetForEdit(null)}
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

      {/* MODALE CRÉATION ÉQUIPEMENT */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#142B45] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#0A7F7C]" />
                  Enregistrer un Nouvel Équipement Industriel
                </h3>
                <p className="text-[11px] text-slate-500">
                  Affectation au registre matériel et suivi des visites périodiques.
                </p>
              </div>
              <button onClick={() => setShowAssetModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Désignation de l'équipement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={e => setAssetName(e.target.value)}
                  placeholder="ex: Poste de Soudure Autonome Diesel 500A"
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Type d'Équipement <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assetType}
                    onChange={e => setAssetType(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                  >
                    <option value="ENGIN_LEVAGE">Engin Lourd / Grue Mobile</option>
                    <option value="POSTE_SOUDURE">Machine de Soudage Autonome</option>
                    <option value="GROUPE_ELECTROGENE">Groupe Électrogène de Chantier</option>
                    <option value="COMPRESSEUR">Compresseur Haute Pression</option>
                    <option value="VEHICULE">Véhicule de Liaison / 4x4</option>
                    <option value="MACHINE_OUTIL">Chanfreineuse / Machine Outil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Chantier Actuel
                  </label>
                  <select
                    value={assetProjectId}
                    onChange={e => setAssetProjectId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                  >
                    <option value="">Parc Central (Non assigné)</option>
                    {(Array.isArray(projects) ? projects : []).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Marque Constructeur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assetBrand}
                    onChange={e => setAssetBrand(e.target.value)}
                    placeholder="ex: Miller / Caterpillar"
                    className="w-full p-2 border border-slate-200 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Modèle
                  </label>
                  <input
                    type="text"
                    value={assetModel}
                    onChange={e => setAssetModel(e.target.value)}
                    placeholder="ex: Big Blue 500 Pro"
                    className="w-full p-2 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Numéro de Série / Châssis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={assetSerial}
                  onChange={e => setAssetSerial(e.target.value)}
                  placeholder="ex: CAT-DZ-49219"
                  className="w-full p-2 border border-slate-200 rounded font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Enregistrer l'Équipement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE CRÉATION ORDRE DE TRAVAIL (OT) — MULTI-MODES & ULTRA-DÉTAILLÉE */}
      {/* ========================================================================= */}
      {showOrderModal && (() => {
        const activeSelectedAsset = (Array.isArray(assets) ? assets : []).find(a => a.id === orderAssetId) || (assets.length > 0 ? assets[0] : null);
        const isAssetOperational = activeSelectedAsset?.status === 'OPERATIONAL';

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-xs">
            <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5 text-[#0B207D]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#07164D] flex items-center gap-2">
                      Déclenchement d'une Intervention Matériel (OT)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Cycle complet de maintenance chantiers : Préventif, Dépannage Curatif d'Urgence ou Visite Réglementaire & Sécurité (VGP Algérie).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
                {/* 1. Sélection Équipement & Carte d'État Live */}
                <div className="space-y-2 bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                  <label className="block text-slate-800 font-bold mb-1">
                    Équipement Concerne <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={orderAssetId || (assets[0]?.id ?? '')}
                    onChange={e => setOrderAssetId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    {(Array.isArray(assets) ? assets : []).map(a => (
                      <option key={a.id} value={a.id}>
                        {a.assetTag} — {a.name} ({a.brand} {a.model}) • {a.status === 'OPERATIONAL' ? 'OPÉRATIONNEL' : 'EN MAINTENANCE'}
                      </option>
                    ))}
                  </select>

                  {/* Fiche d'identité synthétique de l'actif */}
                  {activeSelectedAsset && (
                    <div className="bg-white p-2.5 rounded border border-slate-200 mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {activeSelectedAsset.assetTag}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">
                            {activeSelectedAsset.name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {activeSelectedAsset.brand} {activeSelectedAsset.model} • S/N : <span className="font-mono">{activeSelectedAsset.serialNumber}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">
                          Chantier :{' '}
                          {activeSelectedAsset.currentProject?.code ? (
                            <Link
                              href={`/projects/${activeSelectedAsset.currentProject.code}`}
                              className="inline-flex items-center gap-1 font-bold text-[#0B207D] hover:underline"
                            >
                              {activeSelectedAsset.currentProject.code}
                              <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
                            </Link>
                          ) : (
                            <strong className="text-slate-700">Parc Central SILEX</strong>
                          )}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isAssetOperational
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {isAssetOperational ? 'OPÉRATIONNEL' : 'EN MAINTENANCE'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Onglets Type d'Intervention */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Nature & Catégorie de l'Intervention <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOrderInterventionMode('PREVENTIVE');
                        applyPreventivePreset('250H');
                      }}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        orderInterventionMode === 'PREVENTIVE'
                          ? 'border-[#0B207D] bg-blue-50/60 shadow-xs ring-1 ring-[#0B207D]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <RotateCw className={`w-4 h-4 ${orderInterventionMode === 'PREVENTIVE' ? 'text-[#0B207D]' : 'text-slate-500'}`} />
                        <span className="font-bold text-slate-900">Préventif (PPM)</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Vidange cyclique 250h/500h & révision programmée</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOrderInterventionMode('CORRECTIVE');
                        applyCurativePreset('Fuite flexible hydraulique haute pression', 85000, 'Flexible HP 3/4" 400 bars & raccords JIC');
                      }}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        orderInterventionMode === 'CORRECTIVE'
                          ? 'border-red-500 bg-red-50/60 shadow-xs ring-1 ring-red-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertOctagon className={`w-4 h-4 ${orderInterventionMode === 'CORRECTIVE' ? 'text-red-600' : 'text-slate-500'}`} />
                        <span className="font-bold text-slate-900">Curatif / Urgence</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Panne, fuite ou casse avec arrêt possible</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOrderInterventionMode('REGULATORY');
                        applyRegulatoryPreset('APAVE Algérie', 'VGP_LEVAGE', 120000, 12);
                      }}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        orderInterventionMode === 'REGULATORY'
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className={`w-4 h-4 ${orderInterventionMode === 'REGULATORY' ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span className="font-bold text-slate-900">Visite VGP & Sécurité</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Contrôle APAVE, Veritas, épreuve hydro & CND</span>
                    </button>
                  </div>
                </div>

                {/* 3. Configuration spécifique selon le Mode */}
                {/* 3.A : MODE PRÉVENTIF */}
                {orderInterventionMode === 'PREVENTIVE' && (
                  <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <RotateCw className="w-3.5 h-3.5 text-emerald-700" />
                        Périodicité d'Entretien Préventif :
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800">
                        Cycle actuel : {preventiveCycle}
                      </span>
                    </div>

                    {/* Presets rapides de périodicité */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => applyPreventivePreset('250H')}
                        className={`p-1.5 rounded border text-center font-bold text-xs cursor-pointer transition-colors ${
                          preventiveCycle === '250H'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        250 Heures
                        <div className="text-[9px] font-normal opacity-90">Vidange + Filtres</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreventivePreset('500H')}
                        className={`p-1.5 rounded border text-center font-bold text-xs cursor-pointer transition-colors ${
                          preventiveCycle === '500H'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        500 Heures
                        <div className="text-[9px] font-normal opacity-90">Air + Courroies</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreventivePreset('1000H')}
                        className={`p-1.5 rounded border text-center font-bold text-xs cursor-pointer transition-colors ${
                          preventiveCycle === '1000H'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        1 000 Heures
                        <div className="text-[9px] font-normal opacity-90">Grande Révision</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreventivePreset('MISE_EN_SERVICE')}
                        className={`p-1.5 rounded border text-center font-bold text-xs cursor-pointer transition-colors ${
                          preventiveCycle === 'MISE_EN_SERVICE'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        Mise en Service
                        <div className="text-[9px] font-normal opacity-90">Accès Chantier</div>
                      </button>
                    </div>

                    {/* Checklist des opérations prévues */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-semibold text-slate-700">Checklist des Opérations Systématiques :</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                          <input
                            type="checkbox"
                            checked={checkVidange}
                            onChange={e => setCheckVidange(e.target.checked)}
                            className="rounded text-emerald-600"
                          />
                          <span>Vidange huile moteur 15W40 & filtres</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                          <input
                            type="checkbox"
                            checked={checkFiltres}
                            onChange={e => setCheckFiltres(e.target.checked)}
                            className="rounded text-emerald-600"
                          />
                          <span>Cartouche air primaire & séparateur gasoil</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                          <input
                            type="checkbox"
                            checked={checkGraissage}
                            onChange={e => setCheckGraissage(e.target.checked)}
                            className="rounded text-emerald-600"
                          />
                          <span>Graissage général paliers, axes & crémaillères</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                          <input
                            type="checkbox"
                            checked={checkElectrique}
                            onChange={e => setCheckElectrique(e.target.checked)}
                            className="rounded text-emerald-600"
                          />
                          <span>Contrôle batterie 24V, alternateur & câblage</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                          <input
                            type="checkbox"
                            checked={checkEtancheite}
                            onChange={e => setCheckEtancheite(e.target.checked)}
                            className="rounded text-emerald-600"
                          />
                          <span>Contrôle étanchéité circuit hydraulique & pression</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3.B : MODE CURATIF / PANNE */}
                {orderInterventionMode === 'CORRECTIVE' && (
                  <div className="p-3 bg-red-50/50 rounded-lg border border-red-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-950 flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                        Gravité & Sévérité de la Panne :
                      </span>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                        {curativeSeverity === 'CRITICAL' ? 'ARRÊT DE CHANTIER IMMÉDIAT' : curativeSeverity === 'HIGH' ? 'FONCTIONNEMENT DÉGRADÉ' : 'DYSFONCTIONNEMENT MINEUR'}
                      </span>
                    </div>

                    {/* Degré de sévérité */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurativeSeverity('CRITICAL');
                          setImmediateImmobilization(true);
                        }}
                        className={`p-2 rounded border text-center font-bold text-xs cursor-pointer transition-colors ${
                          curativeSeverity === 'CRITICAL'
                            ? 'bg-red-700 text-white border-red-800'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50'
                        }`}
                      >
                        CRITIQUE
                        <div className="text-[9px] font-normal opacity-90">Arrêt Chantier</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurativeSeverity('HIGH')}
                        className={`p-2 rounded border text-center font-bold text-xs cursor-pointer transition-colors ${
                          curativeSeverity === 'HIGH'
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                        }`}
                      >
                        ÉLEVÉE
                        <div className="text-[9px] font-normal opacity-90">Mode Dégradé</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurativeSeverity('MEDIUM');
                          setImmediateImmobilization(false);
                        }}
                        className={`p-2 rounded border text-center font-bold text-xs cursor-pointer transition-colors ${
                          curativeSeverity === 'MEDIUM'
                            ? 'bg-blue-600 text-white border-blue-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                        }`}
                      >
                        MOYENNE
                        <div className="text-[9px] font-normal opacity-90">Avarie Mineure</div>
                      </button>
                    </div>

                    {/* Presets rapides de panne */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-700 mb-1">
                        Symptômes & Pannes Fréquentes (Remplissage Rapide) :
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyCurativePreset('Fuite flexible hydraulique haute pression', 65000, 'Flexible HP 3/4" 400 bars & 2 raccords à sertir')}
                          className="px-2 py-1 bg-white hover:bg-red-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Droplet className="w-3 h-3 text-cyan-600" /> Fuite Flexible HP (210b)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyCurativePreset('Surchauffe moteur diesel (> 100°C) / Perte liquide', 85000, 'Pompe à eau, courroie et liquide refroidissement')}
                          className="px-2 py-1 bg-white hover:bg-red-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Flame className="w-3 h-3 text-red-600" /> Surchauffe Moteur Diesel
                        </button>
                        <button
                          type="button"
                          onClick={() => applyCurativePreset('Coupure régulateur alternateur / Absence tension 380V', 95000, 'Carte régulateur AVR & pont de diodes')}
                          className="px-2 py-1 bg-white hover:bg-red-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Zap className="w-3 h-3 text-amber-500" /> Défaut Alternateur / 380V
                        </button>
                        <button
                          type="button"
                          onClick={() => applyCurativePreset('Rupture câble de levage / Fin de course treuil', 140000, 'Câble anti-giratoire 16mm & accessoires')}
                          className="px-2 py-1 bg-white hover:bg-red-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Building2 className="w-3 h-3 text-slate-600" /> Câble Levage / Treuil
                        </button>
                        <button
                          type="button"
                          onClick={() => applyCurativePreset('Défaut amorçage arc / Dérèglement ampérage poste de soudure', 50000, 'Potentiomètre commande & contacteurs')}
                          className="px-2 py-1 bg-white hover:bg-red-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Wrench className="w-3 h-3 text-slate-700" /> Dérèglement Soudure 500A
                        </button>
                      </div>
                    </div>

                    {/* Immobilisation immédiate & Pièces requises */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-red-200">
                        <input
                          type="checkbox"
                          checked={immediateImmobilization}
                          onChange={e => setImmediateImmobilization(e.target.checked)}
                          className="rounded text-red-600"
                        />
                        <div>
                          <div className="font-bold text-red-900 text-[11px]">Immobilisation immédiate</div>
                          <div className="text-[10px] text-slate-500">Bascule en "EN MAINTENANCE" dans PostgreSQL</div>
                        </div>
                      </label>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-0.5 text-[11px]">
                          Pièces / Flexibles d'Urgence Requis
                        </label>
                        <input
                          type="text"
                          value={sparePartsNeeded}
                          onChange={e => setSparePartsNeeded(e.target.value)}
                          placeholder="Ex: Flexible HP 3/4, Cartouche filtre..."
                          className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3.C : MODE RÉGLEMENTAIRE / VGP */}
                {orderInterventionMode === 'REGULATORY' && (
                  <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        Conformité Réglementaire & Sécurité Industrielle :
                      </span>
                      <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                        RÉGLEMENTATION ALGÉRIENNE & SONATRACH DP
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">
                          Organisme d'Inspection Agréé *
                        </label>
                        <select
                          value={regulatoryOrganism}
                          onChange={e => setRegulatoryOrganism(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                        >
                          <option value="APAVE Algérie">APAVE Algérie (Agrément Interministériel)</option>
                          <option value="Bureau Veritas Algérie">Bureau Veritas Algérie</option>
                          <option value="CTC (Contrôle Technique Construction)">CTC — Contrôle Technique de la Construction</option>
                          <option value="SGS Algérie">SGS Algérie (Inspection & CND)</option>
                          <option value="Sonatrach DP / HSE Client">Sonatrach DP / Inspection HSE Client</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">
                          Nature de l'Épreuve Réglementaire *
                        </label>
                        <select
                          value={regulatoryType}
                          onChange={e => setRegulatoryType(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                        >
                          <option value="VGP_LEVAGE">VGP Annuelle / Semestrielle Levage & Grue</option>
                          <option value="EPREUVE_HYDRO">Épreuve Hydrostatique & Tarage Soupapes HP</option>
                          <option value="CND_MAGNETO">Contrôle Non Destructif (CND) Magnétoscopie / Ressuage</option>
                          <option value="CONFORMITE_ELEC_ATEX">Conformité Électrique & Terre ATEX</option>
                        </select>
                      </div>
                    </div>

                    {/* Presets rapides VGP */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyRegulatoryPreset('APAVE Algérie', 'VGP_LEVAGE', 120000, 12)}
                        className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Scale className="w-3 h-3 text-indigo-600" /> VGP Levage APAVE (1 an)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyRegulatoryPreset('Bureau Veritas Algérie', 'EPREUVE_HYDRO', 160000, 12)}
                        className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Gauge className="w-3 h-3 text-blue-600" /> Épreuve Hydro Veritas
                      </button>
                      <button
                        type="button"
                        onClick={() => applyRegulatoryPreset('SGS Algérie', 'CND_MAGNETO', 140000, 12)}
                        className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Search className="w-3 h-3 text-slate-600" /> CND Magnétoscopie Châssis
                      </button>
                      <button
                        type="button"
                        onClick={() => applyRegulatoryPreset('CTC (Contrôle Technique Construction)', 'CONFORMITE_ELEC_ATEX', 90000, 6)}
                        className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Zap className="w-3 h-3 text-amber-500" /> Contrôle Terre & ATEX (6 mois)
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-0.5 text-[11px]">
                          N° PV Précédent / Référence
                        </label>
                        <input
                          type="text"
                          value={previousCertNumber}
                          onChange={e => setPreviousCertNumber(e.target.value)}
                          placeholder="ex: PV-APAVE-2025-0842"
                          className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-0.5 text-[11px]">
                          Validité de l'Attestation
                        </label>
                        <select
                          value={validityMonths}
                          onChange={e => setValidityMonths(Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-semibold"
                        >
                          <option value={12}>12 Mois (Visite Annuelle)</option>
                          <option value={6}>6 Mois (Visite Semestrielle)</option>
                          <option value={3}>3 Mois (Chantier Temporaire)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Description détaillée & diagnostic technique */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-800 font-bold">
                      Description Technique & Spécifications des Travaux <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Éditable librement</span>
                  </div>
                  <textarea
                    value={orderDescription}
                    onChange={e => setOrderDescription(e.target.value)}
                    rows={3}
                    placeholder="Détailler l'intervention, pièces requises, consignes..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-[#0B207D] text-xs leading-relaxed"
                    required
                  />
                </div>

                {/* 5. Prérequis Sécurité & HSE Chantier */}
                <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200 space-y-2">
                  <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    Exigences Sécurité HSE Chantiers (Réglementation Sonatrach / Sites Industriels) :
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                      <input
                        type="checkbox"
                        checked={hseLoto}
                        onChange={e => setHseLoto(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Consignation LOTO (Cadenassage mécanique/électrique)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                      <input
                        type="checkbox"
                        checked={hseHotWork}
                        onChange={e => setHseHotWork(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Permis de travail à chaud / Permis à feu</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                      <input
                        type="checkbox"
                        checked={hsePpe}
                        onChange={e => setHsePpe(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>EPI spécifiques chantiers pétroliers</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                      <input
                        type="checkbox"
                        checked={hseAreaSafety}
                        onChange={e => setHseAreaSafety(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Balisage & périmètre de sécurité autour de l'engin</span>
                    </label>
                  </div>
                </div>

                {/* 6. Pièces de Rechange Requises & Déstockage Magasin Central SILEX */}
                <div className="space-y-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-slate-800 font-bold">
                        Pièces de Rechange & Déstockage Magasin ({otSpareParts.length})
                      </label>
                      <span className="text-[10px] text-slate-500">
                        Affectation directe des consommables et pièces pour cette intervention
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addOTSparePart}
                      className="px-2.5 py-1 bg-[#0B207D] hover:bg-[#07164D] text-white rounded text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter une pièce
                    </button>
                  </div>

                  {/* Liste des pièces */}
                  <div className="space-y-2">
                    {(Array.isArray(otSpareParts) ? otSpareParts : []).map((part, idx) => {
                      const stockItem = (Array.isArray(inventoryItems) ? inventoryItems : []).find(i => i.id === part.itemId);
                      const partSubtotal = Number(part.quantity || 0) * Number(part.unitCost || 0);

                      return (
                        <div
                          key={part.id}
                          className="p-2.5 bg-white rounded border border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-[#0B207D]" />
                              Pièce #{idx + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const itm = inventoryItems[0];
                                    updateOTSparePart(part.id, {
                                      mode: 'STOCK',
                                      itemId: itm?.id || '',
                                      name: itm?.name || 'Pièce Magasin',
                                      unitCost: Number(itm?.unitCost || 5000),
                                    });
                                  }}
                                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                                    part.mode === 'STOCK' ? 'bg-[#0B207D] text-white' : 'text-slate-600'
                                  }`}
                                >
                                  Stock Magasin
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateOTSparePart(part.id, { mode: 'CUSTOM' })}
                                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                                    part.mode === 'CUSTOM' ? 'bg-[#0B207D] text-white' : 'text-slate-600'
                                  }`}
                                >
                                  Hors-Stock
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeOTSparePart(part.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 cursor-pointer"
                                title="Supprimer la pièce"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {part.mode === 'STOCK' ? (
                            <div>
                              <select
                                value={part.itemId || (inventoryItems[0]?.id ?? '')}
                                onChange={e => updateOTSparePart(part.id, { itemId: e.target.value })}
                                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-semibold text-slate-900"
                              >
                                {(Array.isArray(inventoryItems) ? inventoryItems : []).map(i => (
                                  <option key={i.id} value={i.id}>
                                    {i.code} — {i.name} (PMP: {formatCurrencyDA(i.unitCost, false)} • Stock: {Number(i.currentStock || 0)} {i.unit || 'U'})
                                  </option>
                                ))}
                              </select>
                              {stockItem && (
                                <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                                  <span>Réf : <strong className="font-mono text-slate-700">{stockItem.code}</strong></span>
                                  <span>Stock Central Arzew : <strong className={Number(stockItem.currentStock || 0) > 0 ? 'text-emerald-700' : 'text-amber-700'}>{Number(stockItem.currentStock || 0)} {stockItem.unit || 'U'}</strong></span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={part.name}
                              onChange={e => updateOTSparePart(part.id, { name: e.target.value })}
                              placeholder="Désignation de la pièce ou consommable..."
                              className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-semibold"
                            />
                          )}

                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 items-end">
                            <div>
                              <label className="block text-[10px] text-slate-600 mb-0.5">Quantité</label>
                              <input
                                type="number"
                                value={part.quantity}
                                onChange={e => updateOTSparePart(part.id, { quantity: Math.max(1, Number(e.target.value)) })}
                                min={1}
                                className="w-full p-1 border border-slate-300 rounded text-xs font-bold text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-600 mb-0.5">Prix Unit. (DA HT)</label>
                              <input
                                type="number"
                                value={part.unitCost}
                                onChange={e => updateOTSparePart(part.id, { unitCost: Math.max(0, Number(e.target.value)) })}
                                className="w-full p-1 border border-slate-300 rounded text-xs font-bold text-slate-900"
                              />
                            </div>
                            <div className="text-right">
                              <span className="block text-[10px] text-slate-400">Total Pièce</span>
                              <span className="font-bold text-slate-900 text-xs">{formatCurrencyDA(partSubtotal, false)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 7. Ventilation Analytique du Coût d'Intervention (DA HT) */}
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#07164D] uppercase text-[11px] flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#0B207D]" />
                      Chiffrage Analytique de l'Intervention (Micro-Détaillé)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Calcul en temps réel
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="p-2 bg-white rounded border border-blue-100 space-y-1">
                      <div className="text-[10px] text-slate-500 font-semibold">1. Main d'Œuvre Interne</div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={laborHours}
                          onChange={e => setLaborHours(Math.max(1, Number(e.target.value)))}
                          min={1}
                          className="w-12 p-1 border border-slate-300 rounded text-xs font-bold text-center"
                        />
                        <span className="text-[11px] text-slate-600">h à</span>
                        <input
                          type="number"
                          value={hourlyRate}
                          onChange={e => setHourlyRate(Math.max(0, Number(e.target.value)))}
                          className="w-16 p-1 border border-slate-300 rounded text-xs font-bold text-center"
                        />
                        <span className="text-[10px] text-slate-400">DA/h</span>
                      </div>
                      <div className="text-right font-bold text-slate-800 text-xs">
                        = {formatCurrencyDA(calculatedLaborCost, false)}
                      </div>
                    </div>

                    <div className="p-2 bg-white rounded border border-blue-100 space-y-1">
                      <div className="text-[10px] text-slate-500 font-semibold">2. Pièces du Magasin</div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {otSpareParts.length} référence(s) déstockée(s)
                      </div>
                      <div className="text-right font-bold text-slate-800 text-xs mt-2">
                        = {formatCurrencyDA(calculatedPartsCost, false)}
                      </div>
                    </div>

                    <div className="p-2 bg-white rounded border border-blue-100 space-y-1">
                      <div className="text-[10px] text-slate-500 font-semibold">3. Expertise / Sous-traitance</div>
                      <input
                        type="number"
                        value={externalSubcontractCost}
                        onChange={e => setExternalSubcontractCost(Math.max(0, Number(e.target.value)))}
                        placeholder="0 DA"
                        className="w-full p-1 border border-slate-300 rounded text-xs font-bold text-slate-900"
                      />
                      <div className="text-right font-bold text-slate-800 text-xs">
                        = {formatCurrencyDA(externalSubcontractCost, false)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-200 flex items-center justify-between font-bold text-slate-900">
                    <span className="text-xs">Coût Prévisionnel Total HT de l'OT :</span>
                    <span className="text-[#0B207D] text-sm font-extrabold">{formatCurrencyDA(calculatedTotalOTCost, false)}</span>
                  </div>
                </div>

                {/* 8. Intervenant & Date Planifiée */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Date Planifiée de Réalisation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={orderScheduledDate}
                      onChange={e => setOrderScheduledDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Technicien Responsable / Prestataire <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={orderTechnician}
                      onChange={e => setOrderTechnician(e.target.value)}
                      placeholder="ex: Équipe Mécanique SILEX Chantiers"
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Persistance immédiate dans PostgreSQL
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOrderModal(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#0B207D] hover:bg-[#07164D] text-white font-bold rounded shadow-xs transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Émettre l'Ordre de Travail (OT)
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 3 : TRAITEMENT & RAPPORT TECHNIQUE D'INTERVENTION OT */}
      {/* ========================================================================= */}
      {selectedOrderForAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#0B207D]" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Traiter l'Ordre de Travail</h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedOrderForAction.orderNumber} — Équipement : {selectedOrderForAction.asset?.name} ({selectedOrderForAction.asset?.assetTag})
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedOrderForAction(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderAction} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Action à Appliquer sur l'OT & sur l'Équipement *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    onClick={() => setOrderActionType('START')}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                      orderActionType === 'START'
                        ? 'border-blue-500 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="otAction"
                      checked={orderActionType === 'START'}
                      onChange={() => setOrderActionType('START')}
                      className="text-[#0B207D]"
                    />
                    <div>
                      <div>Démarrer les Travaux</div>
                      <div className="text-[10px] text-slate-500 font-normal">Passe en cours, engin immobilisé</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setOrderActionType('COMPLETE')}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                      orderActionType === 'COMPLETE'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="otAction"
                      checked={orderActionType === 'COMPLETE'}
                      onChange={() => setOrderActionType('COMPLETE')}
                      className="text-emerald-600"
                    />
                    <div>
                      <div>Clôturer & Remettre en Service</div>
                      <div className="text-[10px] text-slate-500 font-normal">Passe conforme, engin opérationnel</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setOrderActionType('HOLD')}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                      orderActionType === 'HOLD'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="otAction"
                      checked={orderActionType === 'HOLD'}
                      onChange={() => setOrderActionType('HOLD')}
                      className="text-amber-600"
                    />
                    <div>
                      <div>Suspendre (Attente Pièces)</div>
                      <div className="text-[10px] text-slate-500 font-normal">En attente approvisionnement DA</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setOrderActionType('CANCEL')}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                      orderActionType === 'CANCEL'
                        ? 'border-red-500 bg-red-50 text-red-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="otAction"
                      checked={orderActionType === 'CANCEL'}
                      onChange={() => setOrderActionType('CANCEL')}
                      className="text-red-600"
                    />
                    <div>
                      <div>Annuler l'Ordre</div>
                      <div className="text-[10px] text-slate-500 font-normal">Intervention annulée</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Rapport Technique d'Intervention & Constats Mécaniques
                </label>
                <textarea
                  rows={3}
                  value={interventionReport}
                  onChange={e => setInterventionReport(e.target.value)}
                  placeholder="Ex: Remplacement des filtres hydrauliques et remise à niveau huile ISO VG 46 effectuée. Pression de service nominale vérifiée (210 bars)..."
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Coût Réel Final Imputé (DA)
                </label>
                <input
                  type="number"
                  value={actualFinalCost}
                  onChange={e => setActualFinalCost(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForAction(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Valider l'Action & Mettre à Jour le Parc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
