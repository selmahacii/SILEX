'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  DollarSign,
  Scale,
  CheckCircle2,
  Calendar,
  Layers,
  Edit,
  ExternalLink,
  Save,
  X,
} from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';
import { api } from '@/lib/api-client';

interface Props {
  project: any;
  onRefresh: () => Promise<void>;
  isDG: boolean;
  isProjectManager: boolean;
}

export function ProjectContractTab({ project, onRefresh, isDG, isProjectManager }: Props) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [realizedQty, setRealizedQty] = useState<number>(0);
  const [validatedQty, setValidatedQty] = useState<number>(0);
  const [itemNotes, setItemNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const contractItems = project.contractItems || [];
  const tvaRate = project.tvaRate || 19;
  const contractHT = Number(project.contractAmount) || 0;
  const tvaAmount = Math.round(contractHT * (tvaRate / 100));
  const contractTTC = contractHT + tvaAmount;
  const retentionRate = project.retentionRate || 5;
  const retentionAmount = Math.round(contractHT * (retentionRate / 100));

  const handleOpenEditItem = (item: any) => {
    setEditingItemId(item.id);
    setRealizedQty(item.realizedQty || 0);
    setValidatedQty(item.validatedQty || 0);
    setItemNotes(item.notes || '');
  };

  const handleSaveItem = async (itemId: string) => {
    try {
      setSaving(true);
      await api.patch(`/projects/${project.code}/contract-items/${itemId}`, {
        realizedQty,
        validatedQty,
        notes: itemNotes,
      });
      setEditingItemId(null);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour du métré');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Cadre Contractuel Global */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0B207D]" />
            <div>
              <h2 className="text-sm font-bold text-[#07164D] uppercase tracking-wider">
                Cadre Contractuel & Engagements Juridiques
              </h2>
              <p className="text-[11px] text-slate-500">
                Références du marché, conditions financières et fiscales officielles.
              </p>
            </div>
          </div>
          {project.costSheetRef && (
            <Link
              href="/commercial?tab=sheets"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-50 text-[#0B207D] rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <span>Fiche de Coût Origine ({project.costSheetRef})</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Réf. Contrat de Marché</span>
            <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
              {project.contractReference || `CTR-${project.code}`}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Contrat d&apos;exécution signé</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Bon de Commande Client</span>
            <span className="font-mono font-bold text-[#0B207D] text-sm mt-0.5 block">
              {project.clientPoNumber || `BC-${project.clientName?.slice(0, 4).toUpperCase()}-2026`}
            </span>
            <span className="text-[10px] text-slate-500">Document commercial confirmé</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Régime de Taxation TVA</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              TVA {tvaRate}% {tvaRate === 0 ? '(Exonéré ANDI)' : '(Prestation standard)'}
            </span>
            <span className="text-[10px] text-slate-500">Montant TVA : {formatCurrencyDA(tvaAmount, false)}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Retenue de Garantie</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {retentionRate}% ({formatCurrencyDA(retentionAmount, false)})
            </span>
            <span className="text-[10px] text-slate-500">Restituée à la réception définitive (12 mois)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded border border-blue-100">
            <span className="text-slate-600 font-semibold">Montant Contrat HT :</span>
            <span className="font-extrabold text-[#07164D] text-sm">{formatCurrencyDA(contractHT, false)}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded border border-emerald-100">
            <span className="text-slate-600 font-semibold">Montant Contrat TTC :</span>
            <span className="font-extrabold text-emerald-800 text-sm">{formatCurrencyDA(contractTTC, false)}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded border border-amber-100">
            <span className="text-slate-600 font-semibold">Budget Prévisionnel Alloué :</span>
            <span className="font-extrabold text-amber-800 text-sm">{formatCurrencyDA(project.budgetAmount, false)}</span>
          </div>
        </div>
      </div>

      {/* 2. Suivi de l'Avancement Physique Pondéré des Prestations */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#0B207D]" />
              Bordereau des Prestations & Métrés Contradictoires ({contractItems.length} lots)
            </h2>
            <p className="text-[11px] text-slate-500">
              L&apos;avancement physique global est calculé par la somme pondérée des quantités validées par lot.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">Avancement physique pondéré :</span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-sm rounded-lg border border-emerald-300">
              {project.physicalProgress}%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                <th className="p-3">Réf Lot</th>
                <th className="p-3">Désignation des Prestations</th>
                <th className="p-3 text-center">Unité</th>
                <th className="p-3 text-right">Qté Contractuelle</th>
                <th className="p-3 text-right">Qté Réalisée</th>
                <th className="p-3 text-right">Qté Validée</th>
                <th className="p-3 text-center">Pondération</th>
                <th className="p-3 text-center">Progression</th>
                <th className="p-3">Dernier Métré</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contractItems.map((it: any) => {
                const isEditing = editingItemId === it.id;
                const isComplete = it.progress >= 100;
                return (
                  <tr key={it.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0B207D]">{it.itemCode}</td>
                    <td className="p-3 font-semibold text-slate-900 max-w-xs">
                      <div>{it.designation}</div>
                      {it.notes && <div className="text-[10px] text-slate-500 font-normal italic mt-0.5">{it.notes}</div>}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-600">{it.unit}</td>
                    <td className="p-3 text-right font-bold text-slate-800">{it.contractQty?.toLocaleString('fr-DZ')}</td>
                    <td className="p-3 text-right font-medium text-slate-700">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={realizedQty}
                          onChange={e => setRealizedQty(Number(e.target.value))}
                          className="w-20 p-1 border border-slate-300 rounded text-right text-xs"
                        />
                      ) : (
                        it.realizedQty?.toLocaleString('fr-DZ')
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={validatedQty}
                          onChange={e => setValidatedQty(Number(e.target.value))}
                          className="w-20 p-1 border border-emerald-400 bg-emerald-50/50 rounded text-right text-xs font-bold"
                        />
                      ) : (
                        it.validatedQty?.toLocaleString('fr-DZ')
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-bold text-[10px]">
                        {it.weightPercentage}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="w-24 mx-auto">
                        <div className="flex justify-between text-[10px] font-bold text-slate-700 mb-0.5">
                          <span>{it.progress}%</span>
                          {isComplete && <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />}
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isComplete ? 'bg-emerald-600' : 'bg-[#0B207D]'}`}
                            style={{ width: `${Math.min(100, it.progress || 0)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {it.dateMeasured ? `${it.dateMeasured} (${it.measuredBy || 'Inspecteur'})` : 'En attente'}
                    </td>
                    <td className="p-3 text-center">
                      {(isDG || isProjectManager) && (
                        isEditing ? (
                          <div className="flex items-center gap-1 justify-center">
                            <button
                              onClick={() => handleSaveItem(it.id)}
                              disabled={saving}
                              className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                              title="Enregistrer le métré"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 cursor-pointer"
                              title="Annuler"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenEditItem(it)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-[#0B207D] bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Métrer</span>
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
