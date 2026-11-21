'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';

interface PrintCostSheetProps {
  sheet: any;
  onClose: () => void;
}

export function PrintCostSheet({ sheet, onClose }: PrintCostSheetProps) {
  if (!sheet) return null;

  const totalDirect = Number(sheet.totalDirectCost || 0);
  const totalIndirect = Number(sheet.totalIndirectCost || 0);
  const totalEstimated = Number(sheet.totalEstimatedCost || (totalDirect + totalIndirect));
  const sellingPrice = Number(sheet.proposedSellingPrice || totalEstimated * 1.3);
  const marginValue = Number(sheet.estimatedMarginValue || (sellingPrice - totalEstimated));
  const marginPct = Number(sheet.targetMarginPercent || (totalEstimated > 0 ? (marginValue / sellingPrice) * 100 : 25)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 print:p-0 print:shadow-none print:w-full print:max-w-none text-slate-800">
        {/* Barre d'actions écran (Masquée à l'impression) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Aperçu Avant Impression • Fiche de Coût A4</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-[#0B207D] font-mono font-bold">
              {sheet.reference}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B207D] hover:bg-[#07164D] text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Exporter PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENU OFFICIEL A4 (SARL SILEX SERVICES) */}
        <div className="print-document font-sans text-xs space-y-5">
          {/* En-tête officiel */}
          <div className="flex items-start justify-between border-b-2 border-[#0B207D] pb-4">
            <div>
              <div className="text-xl font-black text-[#0B207D] tracking-wide">SARL SILEX SERVICES</div>
              <div className="text-[11px] font-semibold text-slate-600">Maintenance, Tuyauterie & Construction Industrielle</div>
              <div className="text-[10px] text-slate-500 mt-1">
                Zone Industrielle Voie C, Rouiba, Alger • NIF: 001516099123456 • RC: 16/00-0987654B15
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">Fiche de Chiffrage Collaboratif</div>
              <div className="text-xs font-mono font-bold text-[#0B207D]">Réf : {sheet.reference} (v{sheet.version || 1}.0)</div>
              <div className="text-[10px] text-slate-500">Date d&apos;émission : {new Date().toLocaleDateString('fr-DZ')}</div>
            </div>
          </div>

          {/* Cartouche Client & Projet */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Client Contractuel :</div>
              <div className="text-sm font-bold text-slate-900">{sheet.clientName || 'Sonatrach / Sonelgaz'}</div>
              <div className="text-xs text-slate-600 mt-0.5">Site : {sheet.siteLocation || 'Zone Industrielle Skikda RA1K'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Intitulé de l&apos;Affaire :</div>
              <div className="text-sm font-bold text-slate-900">{sheet.title}</div>
              <div className="text-xs text-slate-600 mt-0.5">Secteur : {sheet.sector || 'OIL_AND_GAS'} • Devise : DZD (DA)</div>
            </div>
          </div>

          {/* Décomposition analytique des Postes de Coûts */}
          <div>
            <div className="font-bold text-slate-800 text-xs mb-1.5 uppercase tracking-wide border-b border-slate-200 pb-1">
              1. Décomposition des Coûts Directs & Débours Chantiers
            </div>
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2 border border-slate-300">Poste de Dépense</th>
                  <th className="p-2 border border-slate-300">Département Contributeur</th>
                  <th className="p-2 border border-slate-300">Détails / Spécifications</th>
                  <th className="p-2 border border-slate-300 text-right">Montant Débours (DA HT)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Fournitures & Matières Premières</td>
                  <td className="p-2 border border-slate-300 text-slate-600">Achats & Approvisionnements</td>
                  <td className="p-2 border border-slate-300 text-slate-600">Tubes Inox 316L, brides, coudes, électrodes</td>
                  <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                    {formatCurrencyDA(totalDirect * 0.45, false)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Main-d&apos;Œuvre Spécialisée Chantier</td>
                  <td className="p-2 border border-slate-300 text-slate-600">Ressources Humaines & Pointage</td>
                  <td className="p-2 border border-slate-300 text-slate-600">Soudeurs qualifiés 6G, tuyauteurs, monteurs</td>
                  <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                    {formatCurrencyDA(totalDirect * 0.35, false)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Location Matériel & Engins de Levage</td>
                  <td className="p-2 border border-slate-300 text-slate-600">Opérations & Projets</td>
                  <td className="p-2 border border-slate-300 text-slate-600">Grue 50T, compresseurs, échafaudages ATEX</td>
                  <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                    {formatCurrencyDA(totalDirect * 0.20, false)}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="p-2 border border-slate-300 text-right uppercase">Sous-Total Coûts Directs :</td>
                  <td className="p-2 border border-slate-300 text-right font-mono text-[#0B207D]">
                    {formatCurrencyDA(totalDirect, false)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Frais Généraux de Chantier & Base-Vie (Indirects)</td>
                  <td className="p-2 border border-slate-300 text-slate-600">Contrôle de Gestion / Direction</td>
                  <td className="p-2 border border-slate-300 text-slate-600">Encadrement HSE, transport, assurances et hébergement</td>
                  <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                    {formatCurrencyDA(totalIndirect, false)}
                  </td>
                </tr>
                <tr className="bg-blue-50/50 font-black text-sm">
                  <td colSpan={3} className="p-2.5 border border-slate-300 text-right uppercase text-slate-900">
                    COÛT TOTAL ESTIMÉ (BASE DÉBOURS) :
                  </td>
                  <td className="p-2.5 border border-slate-300 text-right font-mono text-[#0B207D]">
                    {formatCurrencyDA(totalEstimated, false)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Synthèse Financière & Marges Validées */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-300 rounded text-center">
            <div className="border-r border-slate-300 pr-2">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Prix de Vente Proposé HT</div>
              <div className="text-base font-black text-slate-900 font-mono mt-0.5">{formatCurrencyDA(sellingPrice, false)}</div>
            </div>
            <div className="border-r border-slate-300 pr-2">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Marge Brute DZD</div>
              <div className="text-base font-black text-emerald-700 font-mono mt-0.5">+{formatCurrencyDA(marginValue, false)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Taux de Marque Cible</div>
              <div className="text-base font-black text-[#0B207D] font-mono mt-0.5">{marginPct}%</div>
            </div>
          </div>

          {/* Visas et Signatures officielles */}
          <div className="pt-4 border-t-2 border-slate-200">
            <div className="text-[10px] font-bold text-slate-600 uppercase mb-2">Visas Hiérarchiques & Validations Réglementaires :</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-slate-300 rounded p-3 h-28 flex flex-col justify-between bg-white">
                <div className="text-[10px] font-bold text-slate-700 uppercase">Visa Responsable Chiffrage</div>
                <div className="text-center font-script text-xs text-slate-500 italic">Signature certifiée</div>
                <div className="text-[9px] text-slate-400 border-t border-slate-100 pt-1">Karim Mansouri • Projets</div>
              </div>
              <div className="border border-slate-300 rounded p-3 h-28 flex flex-col justify-between bg-white">
                <div className="text-[10px] font-bold text-slate-700 uppercase">Visa Faisabilité Financière</div>
                <div className="text-center text-[10px] text-emerald-800 font-bold bg-emerald-50 py-1 rounded">
                  Avis Favorable : Risque Maîtrisé
                </div>
                <div className="text-[9px] text-slate-400 border-t border-slate-100 pt-1">Réda Bouzid • Direction Financière</div>
              </div>
              <div className="border-2 border-[#0B207D] rounded p-3 h-28 flex flex-col justify-between bg-blue-50/30">
                <div className="text-[10px] font-bold text-[#0B207D] uppercase">Visa & Décision Direction Générale</div>
                <div className="text-center font-bold text-xs text-[#0B207D] uppercase">
                  {sheet.status === 'VALIDEE' ? 'Offre Validée & Approuvée' : 'En attente arbitrage DG'}
                </div>
                <div className="text-[9px] text-slate-500 border-t border-blue-200 pt-1">Amine Benali • Directeur Général</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
