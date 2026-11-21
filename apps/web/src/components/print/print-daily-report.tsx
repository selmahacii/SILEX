'use client';

import React from 'react';
import { Printer, X, ShieldAlert, CheckCircle } from 'lucide-react';

interface PrintDailyReportProps {
  report: any;
  project: any;
  onClose: () => void;
}

export function PrintDailyReport({ report, project, onClose }: PrintDailyReportProps) {
  if (!report && !project) return null;

  const rep = report || {
    date: new Date().toLocaleDateString('fr-DZ'),
    weather: 'Ensoleillé, Vent faible (12 km/h), Température 22°C',
    workersCount: 24,
    hoursWorked: 192,
    progressDelta: '+1.5%',
    tasksDone: 'Préfabrication de 4 tronçons DN150 en atelier de site, épreuve hydrostatique éprouvée à 120 bar sur collecteur C-01, montage échafaudages zone ATEX 1.',
    equipmentUsed: '1 Grue mobile Liebherr 50T, 2 Postes TIG Miller Big Blue, 1 Compresseur Atlas Copco 12 bar.',
    hseNotes: 'Zéro accident (0 AT / 0 Premier Soin). Causerie sécurité matinale animée sur le thème : "Travaux en espace confiné et port obligatoire du harnais". Permis de feu N°2026-PF-41 validé par le client.',
    constraints: 'Attente mise à disposition de la vanne V-102 par les équipes d’exploitation Sonatrach (impact mineur résolu à 14h30).',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 print:p-0 print:shadow-none print:w-full print:max-w-none text-slate-800">
        {/* Top actions bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Aperçu Avant Impression • Rapport Journalier de Chantier (RJC) A4</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-[#0B207D] font-mono font-bold">
              {project?.code || 'PRJ-2026-001'}
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

        {/* RAPPORT JOURNALIER OFFICIEL A4 */}
        <div className="print-document font-sans text-xs space-y-4">
          {/* En-tête */}
          <div className="flex items-start justify-between border-b-2 border-[#0B207D] pb-3">
            <div>
              <div className="text-xl font-black text-[#0B207D] tracking-wide">SARL SILEX SERVICES</div>
              <div className="text-[11px] font-semibold text-slate-600">Direction des Opérations & Projets Industriels</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Zone Industrielle Voie C, Rouiba, Alger • Tél: +213 23 85 41 20
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black text-slate-900 uppercase">Rapport Journalier de Chantier (RJC)</div>
              <div className="text-xs font-bold text-[#0B207D]">Chantier : {project?.name || 'Maintenance Arrêt Unité'}</div>
              <div className="text-[10px] text-slate-600">Date : <strong>{rep.date}</strong></div>
            </div>
          </div>

          {/* Synthèse Chantier & Conditions */}
          <div className="grid grid-cols-4 gap-2.5 p-2.5 bg-slate-50 border border-slate-300 rounded text-center">
            <div>
              <div className="text-[9.5px] uppercase font-bold text-slate-500">Client / Site :</div>
              <div className="text-xs font-bold text-slate-900 truncate">{project?.clientName || 'Sonatrach'}</div>
            </div>
            <div>
              <div className="text-[9.5px] uppercase font-bold text-slate-500">Météo / Vent :</div>
              <div className="text-xs font-bold text-slate-900">{rep.weather}</div>
            </div>
            <div>
              <div className="text-[9.5px] uppercase font-bold text-slate-500">Effectif Mobilisé :</div>
              <div className="text-xs font-bold text-emerald-800">{rep.workersCount} Salariés ({rep.hoursWorked} h)</div>
            </div>
            <div>
              <div className="text-[9.5px] uppercase font-bold text-slate-500">Avancement Jour :</div>
              <div className="text-xs font-black text-[#0B207D]">{rep.progressDelta}</div>
            </div>
          </div>

          {/* Travaux Exécutés */}
          <div className="border border-slate-300 rounded p-3 bg-white">
            <div className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Travaux & Tâches Réalisés dans la Journée :</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px] whitespace-pre-line mt-1">
              {rep.tasksDone}
            </p>
          </div>

          {/* Matériels & Engins Mobilisés */}
          <div className="border border-slate-300 rounded p-3 bg-white">
            <div className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wide border-b border-slate-200 pb-1">
              2. Matériels, Véhicules & Outillages Spécifiques Utilisés :
            </div>
            <p className="text-slate-700 text-[11px] mt-1">
              {rep.equipmentUsed}
            </p>
          </div>

          {/* Sécurité & HSE */}
          <div className="border border-amber-300 bg-amber-50/40 rounded p-3">
            <div className="font-bold text-amber-900 text-xs mb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-amber-200 pb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>3. Rapport Hygiène, Sécurité & Environnement (HSE) :</span>
            </div>
            <p className="text-amber-950 text-[11px] leading-relaxed mt-1">
              {rep.hseNotes}
            </p>
          </div>

          {/* Contraintes & Aléas Chantier */}
          <div className="border border-slate-300 rounded p-3 bg-white">
            <div className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wide border-b border-slate-200 pb-1">
              4. Contraintes Rencontrées, Blocages & Actions Correctives :
            </div>
            <p className="text-slate-700 text-[11px] mt-1">
              {rep.constraints}
            </p>
          </div>

          {/* Signatures officielles */}
          <div className="grid grid-cols-2 gap-6 pt-3 border-t-2 border-slate-200">
            <div className="border border-slate-300 rounded p-3 h-24 flex flex-col justify-between">
              <div className="text-[10px] font-bold text-slate-700 uppercase">Le Chef de Chantier / Conducteur de Travaux</div>
              <div className="text-[9px] text-slate-500">Karim Mansouri • Visa & Date</div>
            </div>
            <div className="border border-slate-300 rounded p-3 h-24 flex flex-col justify-between">
              <div className="text-[10px] font-bold text-slate-700 uppercase">Le Superviseur Client / Maître d&apos;Ouvrage</div>
              <div className="text-[9px] text-slate-500">Représentant Sonatrach • Visa pour Prise d&apos;Acte</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
