'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';

interface PrintInvoiceProps {
  invoice: any;
  onClose: () => void;
}

export function PrintInvoice({ invoice, onClose }: PrintInvoiceProps) {
  if (!invoice) return null;

  const amountHT = Number(invoice.amountHT || invoice.amount || 18500000);
  const warrantyDeduction = Number(invoice.warrantyDeduction || amountHT * 0.05); // 5% Retenue de Garantie
  const netHT = amountHT - warrantyDeduction;
  const vatRate = 19;
  const vatAmount = Number(invoice.vatAmount || (netHT * (vatRate / 100)));
  const totalTTC = netHT + vatAmount;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 print:p-0 print:shadow-none print:w-full print:max-w-none text-slate-800">
        {/* Top actions bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Aperçu Avant Impression • Facture Client / Décompte A4</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-[#0B207D] font-mono font-bold">
              {invoice.reference || invoice.invoiceNumber || 'FAC-2026-001'}
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

        {/* FACTURE OFFICIELLE A4 */}
        <div className="print-document font-sans text-xs space-y-5">
          {/* En-tête officiel */}
          <div className="flex items-start justify-between border-b-2 border-[#0B207D] pb-4">
            <div>
              <div className="text-xl font-black text-[#0B207D] tracking-wide">SARL SILEX SERVICES</div>
              <div className="text-[11px] font-semibold text-slate-600">Maintenance & Construction Industrielle</div>
              <div className="text-[10px] text-slate-500 mt-1">
                Siège Social : Zone Industrielle Voie C, Rouiba, Alger<br />
                NIF : 001516099123456 • RC : 16/00-0987654B15 • NIS : 0015160900123<br />
                RIB BNA Rouiba : 001 00624 0300 000123 45
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black text-slate-900 uppercase">
                {invoice.type === 'ATTACHEMENT' ? 'Attachement Contradictoire' : 'Facture Définitive de Travaux'}
              </div>
              <div className="text-xs font-mono font-bold text-[#0B207D] mt-0.5">
                N° : {invoice.reference || invoice.invoiceNumber || 'FAC-2026-001'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Date d&apos;émission : {new Date().toLocaleDateString('fr-DZ')}</div>
              <div className="text-[10px] text-slate-500">Échéance de paiement : 30 jours fin de mois</div>
            </div>
          </div>

          {/* Cartouche Client Destinataire */}
          <div className="flex justify-between items-start p-3 bg-slate-50 border border-slate-200 rounded">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Projet & Marché de Travaux :</div>
              <div className="text-sm font-bold text-slate-900">{invoice.projectName || 'Maintenance Arrêt Unité Raffinage'}</div>
              <div className="text-xs text-slate-600">Réf. Contrat de Marché : CTR-2026-SKIKDA-01</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">Client / Maître d&apos;Ouvrage :</div>
              <div className="text-sm font-bold text-slate-900">{invoice.clientName || 'Sonatrach Activité Aval — Raffinerie'}</div>
              <div className="text-xs text-slate-600">Direction Exploitation, Zone Industrielle Skikda</div>
            </div>
          </div>

          {/* Tableau des prestations réalisées */}
          <div>
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2 border border-slate-300">Désignation des Travaux Exécutés</th>
                  <th className="p-2 border border-slate-300 text-center">Unité</th>
                  <th className="p-2 border border-slate-300 text-right">Quantité</th>
                  <th className="p-2 border border-slate-300 text-right">Prix Unitaire (DA)</th>
                  <th className="p-2 border border-slate-300 text-right">Total HT (DA)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2.5 border border-slate-300">
                    <div className="font-bold text-slate-900">Situation Mensuelle de Travaux N°01</div>
                    <div className="text-[10px] text-slate-500">
                      Dépose tuyauteries usagées, épreuves hydrostatiques 120 bar, préfabrication atelier et montage sur site.
                    </div>
                  </td>
                  <td className="p-2.5 border border-slate-300 text-center font-mono">Forfait</td>
                  <td className="p-2.5 border border-slate-300 text-right font-mono">1.00</td>
                  <td className="p-2.5 border border-slate-300 text-right font-mono">{formatCurrencyDA(amountHT, false)}</td>
                  <td className="p-2.5 border border-slate-300 text-right font-mono font-bold">{formatCurrencyDA(amountHT, false)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Décompte fiscal & financier officiel */}
          <div className="flex justify-end pt-2">
            <div className="w-80 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Montant Brut des Travaux HT :</span>
                <span className="font-mono font-bold">{formatCurrencyDA(amountHT, false)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 text-amber-900">
                <span>Retenue de Garantie (5%) :</span>
                <span className="font-mono font-bold">-{formatCurrencyDA(warrantyDeduction, false)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-bold text-slate-800">Montant Net HT :</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrencyDA(netHT, false)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">TVA Légale ({vatRate}%) :</span>
                <span className="font-mono font-bold">{formatCurrencyDA(vatAmount, false)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-[#0B207D] text-sm font-black text-[#0B207D] bg-blue-50/50 px-2 rounded">
                <span>NET À PAYER TTC :</span>
                <span className="font-mono">{formatCurrencyDA(totalTTC, false)}</span>
              </div>
            </div>
          </div>

          {/* Mentions légales */}
          <div className="text-[10px] text-slate-500 italic border-t border-slate-200 pt-3">
            Arrêtée la présente facture à la somme de : <strong>{totalTTC.toLocaleString('fr-DZ')} Dinars Algériens TTC</strong>.
            En cas de retard de paiement, des pénalités légales seront appliquées conformément au Code de Commerce algérien.
          </div>

          {/* Visas */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div className="border border-slate-300 rounded p-3 h-28 flex flex-col justify-between">
              <div className="text-[10px] font-bold text-slate-700 uppercase">Pour le Maître d&apos;Ouvrage (Client)</div>
              <div className="text-[9px] text-slate-400">Date, Nom, Visa et Cachet</div>
            </div>
            <div className="border-2 border-[#0B207D] rounded p-3 h-28 flex flex-col justify-between bg-blue-50/20">
              <div className="text-[10px] font-bold text-[#0B207D] uppercase">Pour SARL SILEX SERVICES</div>
              <div className="text-center font-bold text-xs text-[#0B207D]">Direction Financière & Comptable</div>
              <div className="text-[9px] text-slate-500 border-t border-blue-200 pt-1">Réda Bouzid • Bon à Facturer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
