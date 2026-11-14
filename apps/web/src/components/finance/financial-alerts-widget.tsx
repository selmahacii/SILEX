'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';

export interface FinancialAlertItem {
  id: string;
  type: 'MATCHING_DISCREPANCY' | 'OVERDUE_INVOICE' | 'DG_APPROVAL_REQUIRED' | 'CASH_BUFFER_WARNING';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  amount?: number;
  reference?: string;
  dueDate?: string;
}

interface FinancialAlertsWidgetProps {
  alerts: FinancialAlertItem[];
  onNavigateAction?: (alert: FinancialAlertItem) => void;
}

export function FinancialAlertsWidget({
  alerts = [],
  onNavigateAction,
}: FinancialAlertsWidgetProps) {
  const getSeverityBadge = (sev: 'CRITICAL' | 'WARNING' | 'INFO') => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'WARNING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'INFO':
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  const getAlertIcon = (type: FinancialAlertItem['type']) => {
    switch (type) {
      case 'MATCHING_DISCREPANCY':
        return <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />;
      case 'OVERDUE_INVOICE':
        return <Clock className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />;
      case 'DG_APPROVAL_REQUIRED':
        return <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />;
      case 'CASH_BUFFER_WARNING':
        return <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#07164D]">
            Alertes & Risques Financiers Immédiats ({alerts.length})
          </h2>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">Contrôle interne SoD</span>
      </div>

      {/* Alert List */}
      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-slate-700">Aucune anomalie ou blocage détecté</span>
            <span className="text-[11px] text-slate-400">Trésorerie équilibrée, factures rapprochées et échues à zéro.</span>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onNavigateAction && onNavigateAction(alert)}
              className="p-3 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-start gap-2.5">
                {getAlertIcon(alert.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#0B207D] transition-colors">
                      {alert.title}
                    </span>
                    <span className={`rounded px-1.5 py-0.2 text-[9px] font-semibold border ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {alert.description}
                  </p>
                  {alert.reference && (
                    <span className="mt-1 inline-block font-mono text-[10px] text-slate-400 bg-slate-50 px-1 rounded border border-slate-200">
                      Réf: {alert.reference}
                    </span>
                  )}
                </div>
              </div>

              {alert.amount !== undefined && (
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono text-slate-900">
                    {formatCurrencyDA(alert.amount, false)}
                  </div>
                  {alert.dueDate && (
                    <div className="text-[10px] text-rose-600 font-medium">
                      Échéance: {alert.dueDate}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
