'use client';

import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';

interface PrintTcoProps {
  purchaseRequest: any;
  quotes: any[];
  onClose: () => void;
}

export function PrintTco({ purchaseRequest, quotes, onClose }: PrintTcoProps) {
  if (!purchaseRequest) return null;

  const validQuotes = quotes && quotes.length > 0 ? quotes : [
    {
      id: 'q1',
      supplierName: 'Sarl Algérie Vannes & Robinetterie',
      totalAmountHT: 1850000,
      deliveryLeadTimeDays: 7,
      rating: 4.8,
      isRecommended: true,
      warrantyMonths: 24,
      notes: 'Matériel certifié ISO 9001 / ATEX, certificat 3.1 inclus.',
    },
    {
      id: 'q2',
      supplierName: 'Eurl Comptoir Sidérurgique & Métallurgique',
      totalAmountHT: 2100000,
      deliveryLeadTimeDays: 14,
      rating: 4.5,
      isRecommended: false,
      warrantyMonths: 12,
      notes: 'Délai plus long, certificats matière sous 10 jours.',
    },
    {
      id: 'q3',
      supplierName: 'Sarl Gaz & Soudure Industrielle DZ',
      totalAmountHT: 1980000,
      deliveryLeadTimeDays: 10,
      rating: 4.6,
      isRecommended: false,
      warrantyMonths: 12,
      notes: 'Offre standard conforme au cahier des charges.',
    },
  ];

  const selectedQuote = validQuotes.find((q: any) => q.isRecommended || q.isSelected) || validQuotes[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full p-8 print:p-0 print:shadow-none print:w-full print:max-w-none text-slate-800">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Aperçu Avant Impression • Tableau Comparatif des Offres (TCO)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
              DA : {purchaseRequest.reference}
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

        {/* CONTENU A4 OFFICIAL */}
        <div className="print-document font-sans text-xs space-y-5">
          {/* En-tête */}
          <div className="flex items-start justify-between border-b-2 border-[#0B207D] pb-4">
            <div>
              <div className="text-xl font-black text-[#0B207D] tracking-wide">SARL SILEX SERVICES</div>
              <div className="text-[11px] font-semibold text-slate-600">Direction des Achats & Approvisionnements Chantiers</div>
              <div className="text-[10px] text-slate-500 mt-1">
                Zone Industrielle Voie C, Rouiba, Alger • Tél: +213 (0) 23 85 41 20
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tableau Comparatif des Offres (TCO)</div>
              <div className="text-xs font-mono font-bold text-[#0B207D]">Réf DA : {purchaseRequest.reference}</div>
              <div className="text-[10px] text-slate-500">Date d&apos;évaluation : {new Date().toLocaleDateString('fr-DZ')}</div>
            </div>
          </div>

          {/* Synthèse du besoin chantier */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Projet Imputé :</div>
              <div className="text-xs font-bold text-slate-900">{purchaseRequest.projectName || purchaseRequest.projectCode || 'Chantier Principal'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Demandeur / Émetteur :</div>
              <div className="text-xs font-bold text-slate-900">{purchaseRequest.requesterName || 'Farouk Brahimi (Achats)'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Délai Souhaité Chantier :</div>
              <div className="text-xs font-bold text-slate-900">Sous 10 Jours (Impératif arrêt technique)</div>
            </div>
          </div>

          {/* Grille comparative des 3 Fournisseurs */}
          <div>
            <div className="font-bold text-slate-800 text-xs mb-1.5 uppercase tracking-wide border-b border-slate-200 pb-1">
              Analyse Multi-Critères des Devis Reçus (Prix, Délais, Notations & Conformité)
            </div>
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2 border border-slate-300">Critère d&apos;Évaluation</th>
                  {validQuotes.map((q: any, i: number) => (
                    <th key={q.id || i} className={`p-2 border border-slate-300 text-center ${q.isRecommended ? 'bg-emerald-50 text-emerald-900 border-b-2 border-b-emerald-600' : ''}`}>
                      <div className="font-bold">{q.supplierName}</div>
                      {q.isRecommended && (
                        <span className="text-[9.5px] px-2 py-0.2 rounded bg-emerald-600 text-white font-bold uppercase tracking-wider inline-block mt-0.5">
                          Fournisseur Retenu
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Montant Total Proposé (HT)</td>
                  {validQuotes.map((q: any, i: number) => (
                    <td key={i} className={`p-2 border border-slate-300 text-center font-mono font-bold ${q.isRecommended ? 'text-emerald-800 bg-emerald-50/40 text-sm' : 'text-slate-800'}`}>
                      {formatCurrencyDA(Number(q.totalAmountHT || 0), false)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">TVA Contractuelle (19%)</td>
                  {validQuotes.map((q: any, i: number) => (
                    <td key={i} className="p-2 border border-slate-300 text-center font-mono text-slate-600">
                      {formatCurrencyDA(Number(q.totalAmountHT || 0) * 0.19, false)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="p-2 border border-slate-300 font-semibold">Total TTC en DA</td>
                  {validQuotes.map((q: any, i: number) => (
                    <td key={i} className={`p-2 border border-slate-300 text-center font-mono ${q.isRecommended ? 'text-emerald-900 font-black' : ''}`}>
                      {formatCurrencyDA(Number(q.totalAmountHT || 0) * 1.19, false)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Délai de Livraison Garanti</td>
                  {validQuotes.map((q: any, i: number) => (
                    <td key={i} className="p-2 border border-slate-300 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold ${q.deliveryLeadTimeDays <= 7 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {q.deliveryLeadTimeDays} Jours ouvrés
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Garantie & Certificats</td>
                  {validQuotes.map((q: any, i: number) => (
                    <td key={i} className="p-2 border border-slate-300 text-center text-slate-700">
                      {q.warrantyMonths || 12} Mois • CCPU 3.1
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Note Qualité Fournisseur</td>
                  {validQuotes.map((q: any, i: number) => (
                    <td key={i} className="p-2 border border-slate-300 text-center font-bold">
                      ⭐ {q.rating || '4.5'}/5.0
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Observations & Conclusifs</td>
                  {validQuotes.map((q: any, i: number) => (
                    <td key={i} className="p-2 border border-slate-300 text-[10px] text-slate-600">
                      {q.notes || 'Offre conforme aux spécifications.'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Décision et motivation du choix */}
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900">
            <div className="font-bold uppercase text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Attribution du Marché & Justification du Fournisseur Retenu :</span>
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              Le fournisseur <strong>{selectedQuote.supplierName}</strong> est retenu pour un montant de{' '}
              <strong>{formatCurrencyDA(Number(selectedQuote.totalAmountHT || 0), false)} HT</strong>. Offre la mieux-disante 
              combinant le coût unitaire le plus avantageux, un délai d&apos;acheminement compatible ({selectedQuote.deliveryLeadTimeDays} jours) et 
              la délivrance systématique des certificats matière CCPU 3.1.
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t-2 border-slate-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-slate-300 rounded p-3 h-24 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-700 uppercase">Visa Acheteur Responsable</div>
                <div className="text-[9px] text-slate-400">Farouk Brahimi • Achats & Logistique</div>
              </div>
              <div className="border border-slate-300 rounded p-3 h-24 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-700 uppercase">Visa Chef de Projet Chantier</div>
                <div className="text-[9px] text-slate-400">Karim Mansouri • Projets Industriels</div>
              </div>
              <div className="border-2 border-[#0B207D] rounded p-3 h-24 flex flex-col justify-between bg-blue-50/30">
                <div className="text-[10px] font-bold text-[#0B207D] uppercase">Visa Direction Générale</div>
                <div className="text-[9px] text-slate-500 font-semibold">Amine Benali • Bon pour Commande</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
