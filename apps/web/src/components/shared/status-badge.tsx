import React from 'react';
import {
  ProjectStatus,
  PurchaseRequestStatus,
  PurchaseOrderStatus,
  ProjectRiskLevel,
  WorkSituationStatus,
  ServiceOrderStatus,
  NonConformityStatus,
} from '@silex/shared';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck, Wrench, FileCheck, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'project' | 'procurement' | 'po' | 'risk' | 'situation' | 'ods' | 'nc' | 'maintenance' | 'milestone' | 'general';
  className?: string;
}

export function StatusBadge({ status, type = 'general', className = '' }: StatusBadgeProps) {
  let label = status;
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon: React.ReactNode = null;

  const normalizedStatus = (status || '').toUpperCase();

  // 1. Projets
  if (type === 'project' || normalizedStatus in ProjectStatus) {
    switch (normalizedStatus) {
      case 'IN_PROGRESS':
        label = 'En cours';
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
        icon = <Clock className="w-3 h-3 text-emerald-600 mr-1" />;
        break;
      case 'PLANNING':
        label = 'Planification';
        colorClasses = 'bg-sky-50 text-sky-800 border-sky-300 font-semibold';
        break;
      case 'COMPLETED':
        label = 'Clôturé';
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-300 font-semibold';
        icon = <CheckCircle2 className="w-3 h-3 text-slate-600 mr-1" />;
        break;
      case 'ON_HOLD':
        label = 'En attente';
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
        icon = <AlertTriangle className="w-3 h-3 text-amber-600 mr-1" />;
        break;
      case 'CANCELLED':
        label = 'Annulé';
        colorClasses = 'bg-red-50 text-red-800 border-red-300 font-semibold';
        icon = <XCircle className="w-3 h-3 text-red-600 mr-1" />;
        break;
    }
  }
  // 2. Achats & DA
  else if (type === 'procurement' || normalizedStatus in PurchaseRequestStatus) {
    switch (normalizedStatus) {
      case 'DRAFT':
        label = 'Brouillon';
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
      case 'SUBMITTED':
        label = 'Soumis (Revue Achats)';
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
        icon = <Clock className="w-3 h-3 text-blue-600 mr-1" />;
        break;
      case 'PROCUREMENT_REVIEW':
        label = 'Revue Achats';
        colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
        break;
      case 'QUOTATION_IN_PROGRESS':
        label = 'Consultation Fournisseurs';
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
        break;
      case 'PENDING_APPROVAL':
        label = 'En attente Approbation DG';
        colorClasses = 'bg-amber-100 text-amber-900 border-amber-300 font-bold animate-pulse';
        icon = <ShieldCheck className="w-3 h-3 text-amber-700 mr-1" />;
        break;
      case 'APPROVED':
        label = 'Approuvé par DG';
        colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
        icon = <CheckCircle2 className="w-3 h-3 text-emerald-700 mr-1" />;
        break;
      case 'PURCHASE_ORDER':
        label = 'Bon de Commande Émis';
        colorClasses = 'bg-teal-100 text-teal-900 border-teal-400 font-bold';
        icon = <FileCheck className="w-3 h-3 text-teal-700 mr-1" />;
        break;
      case 'PARTIALLY_RECEIVED':
        label = 'Partiellement Réceptionné';
        colorClasses = 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
        break;
      case 'RECEIVED':
        label = 'Réceptionné Magasin Conforme';
        colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
        icon = <CheckCircle2 className="w-3 h-3 text-emerald-700 mr-1" />;
        break;
      case 'REJECTED':
        label = 'Rejeté par la DG';
        colorClasses = 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
        icon = <XCircle className="w-3 h-3 text-rose-700 mr-1" />;
        break;
    }
  }
  // 3. Situations de travaux
  else if (type === 'situation' || normalizedStatus in WorkSituationStatus || ['REVISION_REQUESTED'].includes(normalizedStatus)) {
    switch (normalizedStatus) {
      case 'DRAFT':
        label = 'Brouillon';
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
        break;
      case 'SUBMITTED':
        label = 'Transmise (En Revue)';
        colorClasses = 'bg-blue-50 text-blue-800 border-blue-300 font-semibold';
        break;
      case 'VERIFIED':
        label = 'Métrés Vérifiés';
        colorClasses = 'bg-indigo-50 text-indigo-800 border-indigo-300 font-semibold';
        break;
      case 'APPROVED':
        label = 'Approuvée (BAP Validé)';
        colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
        icon = <CheckCircle2 className="w-3 h-3 text-emerald-700 mr-1" />;
        break;
      case 'REVISION_REQUESTED':
        label = 'Révision Demandée';
        colorClasses = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
        icon = <AlertTriangle className="w-3 h-3 text-amber-700 mr-1" />;
        break;
      case 'REJECTED':
        label = 'Rejetée';
        colorClasses = 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
        icon = <XCircle className="w-3 h-3 text-rose-700 mr-1" />;
        break;
      case 'INVOICED':
        label = 'Facturée';
        colorClasses = 'bg-teal-50 text-teal-800 border-teal-300 font-semibold';
        break;
    }
  }
  // 4. Ordres de Service (ODS)
  else if (type === 'ods' || normalizedStatus in ServiceOrderStatus) {
    switch (normalizedStatus) {
      case 'DRAFT':
        label = 'Brouillon';
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
      case 'ISSUED':
        label = 'Émis (En attente visa client)';
        colorClasses = 'bg-amber-50 text-amber-900 border-amber-300 font-bold animate-pulse';
        icon = <Clock className="w-3 h-3 text-amber-700 mr-1" />;
        break;
      case 'ACCEPTED':
        label = 'Visé & Accepté par le Client';
        colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
        icon = <CheckCircle2 className="w-3 h-3 text-emerald-700 mr-1" />;
        break;
      case 'REJECTED':
        label = 'Contesté par le Client';
        colorClasses = 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
        icon = <XCircle className="w-3 h-3 text-rose-700 mr-1" />;
        break;
    }
  }
  // 5. Non-Conformités QHSE
  else if (type === 'nc' || normalizedStatus in NonConformityStatus) {
    switch (normalizedStatus) {
      case 'OPEN':
        label = 'Ouverte (En attente action)';
        colorClasses = 'bg-rose-100 text-rose-900 border-rose-300 font-bold animate-pulse';
        icon = <AlertCircle className="w-3 h-3 text-rose-700 mr-1" />;
        break;
      case 'UNDER_INVESTIGATION':
        label = 'Investigation / Action en cours';
        colorClasses = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
        icon = <Clock className="w-3 h-3 text-amber-700 mr-1" />;
        break;
      case 'CORRECTIVE_ACTION_PENDING':
        label = 'Vérification Clôture';
        colorClasses = 'bg-purple-50 text-purple-800 border-purple-300 font-semibold';
        break;
      case 'CLOSED':
        label = 'Clôturée & Soldée Conforme';
        colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
        icon = <CheckCircle2 className="w-3 h-3 text-emerald-700 mr-1" />;
        break;
    }
  }
  // 6. Jalons (Milestones)
  else if (type === 'milestone' || ['PENDING', 'WITH_RESERVATIONS', 'INSPECTION_PENDING'].includes(normalizedStatus)) {
    switch (normalizedStatus) {
      case 'PENDING':
        label = 'En attente épreuve';
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
        break;
      case 'IN_PROGRESS':
        label = 'En cours d’épreuve';
        colorClasses = 'bg-blue-50 text-blue-800 border-blue-300 font-semibold';
        break;
      case 'COMPLETED':
        label = 'Validé / PV Conforme';
        colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
        icon = <CheckCircle2 className="w-3 h-3 text-emerald-700 mr-1" />;
        break;
      case 'WITH_RESERVATIONS':
        label = 'Validé avec réserves';
        colorClasses = 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
        icon = <AlertTriangle className="w-3 h-3 text-amber-700 mr-1" />;
        break;
      case 'INSPECTION_PENDING':
        label = 'Contre-visite requise';
        colorClasses = 'bg-purple-50 text-purple-900 border-purple-300 font-semibold';
        break;
      case 'REJECTED':
        label = 'Non-conforme / Refusé';
        colorClasses = 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
        icon = <XCircle className="w-3 h-3 text-rose-700 mr-1" />;
        break;
    }
  }
  // 7. Maintenance & Engins
  else if (type === 'maintenance' || ['OPERATIONAL', 'UNDER_MAINTENANCE', 'DECOMMISSIONED', 'SCHEDULED'].includes(normalizedStatus)) {
    switch (normalizedStatus) {
      case 'OPERATIONAL':
        label = 'Opérationnel (En Service)';
        colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
        icon = <CheckCircle2 className="w-3 h-3 text-emerald-700 mr-1" />;
        break;
      case 'UNDER_MAINTENANCE':
        label = 'Immobilisé (En Maintenance)';
        colorClasses = 'bg-amber-100 text-amber-900 border-amber-400 font-bold animate-pulse';
        icon = <Wrench className="w-3 h-3 text-amber-700 mr-1" />;
        break;
      case 'DECOMMISSIONED':
        label = 'Hors Service / Réforme';
        colorClasses = 'bg-slate-200 text-slate-800 border-slate-400 font-semibold';
        break;
      case 'SCHEDULED':
        label = 'Planifié';
        colorClasses = 'bg-sky-50 text-sky-800 border-sky-300 font-semibold';
        break;
    }
  }
  // 8. Niveaux de Risque
  else if (type === 'risk' || normalizedStatus in ProjectRiskLevel) {
    switch (normalizedStatus) {
      case 'LOW':
        label = 'Faible';
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
        break;
      case 'MEDIUM':
        label = 'Moyen';
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
        break;
      case 'HIGH':
        label = 'Élevé';
        colorClasses = 'bg-orange-50 text-orange-900 border-orange-300 font-bold';
        break;
      case 'CRITICAL':
        label = 'Critique';
        colorClasses = 'bg-rose-100 text-rose-900 border-rose-400 font-bold animate-pulse';
        icon = <AlertTriangle className="w-3 h-3 text-rose-700 mr-1" />;
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border leading-normal tracking-wide transition-all duration-200 ${colorClasses} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
