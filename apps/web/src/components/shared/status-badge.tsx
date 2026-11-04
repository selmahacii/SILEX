import React from 'react';
import { ProjectStatus, PurchaseRequestStatus, PurchaseOrderStatus, ProjectRiskLevel } from '@silex/shared';

interface StatusBadgeProps {
  status: string;
  type?: 'project' | 'procurement' | 'po' | 'risk' | 'general';
}

export function StatusBadge({ status, type = 'general' }: StatusBadgeProps) {
  let label = status;
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'project' || status in ProjectStatus) {
    switch (status) {
      case 'IN_PROGRESS':
        label = 'En cours';
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
      case 'PLANNING':
        label = 'Planification';
        colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
        break;
      case 'COMPLETED':
        label = 'Clôturé';
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
        break;
      case 'ON_HOLD':
        label = 'En attente';
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case 'CANCELLED':
        label = 'Annulé';
        colorClasses = 'bg-red-50 text-red-800 border-red-200';
        break;
    }
  } else if (type === 'procurement' || status in PurchaseRequestStatus) {
    switch (status) {
      case 'DRAFT':
        label = 'Brouillon';
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
      case 'SUBMITTED':
        label = 'Soumis';
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'PROCUREMENT_REVIEW':
        label = 'Revue Achats';
        colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'QUOTATION_IN_PROGRESS':
        label = 'Consultation Fournisseurs';
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'PENDING_APPROVAL':
        label = 'En attente Approbation DG';
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
        break;
      case 'APPROVED':
        label = 'Approuvé';
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
        break;
      case 'PURCHASE_ORDER':
        label = 'Bon de Commande Émis';
        colorClasses = 'bg-teal-50 text-teal-800 border-teal-300 font-semibold';
        break;
      case 'RECEIVED':
        label = 'Réceptionné Magasin';
        colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
        break;
      case 'REJECTED':
        label = 'Rejeté';
        colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
        break;
    }
  } else if (type === 'risk' || status in ProjectRiskLevel) {
    switch (status) {
      case 'LOW':
        label = 'Faible';
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'MEDIUM':
        label = 'Moyen';
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'HIGH':
        label = 'Élevé';
        colorClasses = 'bg-orange-50 text-orange-800 border-orange-200 font-semibold';
        break;
      case 'CRITICAL':
        label = 'Critique';
        colorClasses = 'bg-rose-50 text-rose-800 border-rose-300 font-bold';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border leading-normal ${colorClasses}`}
    >
      {label}
    </span>
  );
}
