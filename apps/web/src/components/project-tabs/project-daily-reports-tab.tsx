'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDateDZ } from '@silex/shared';
import {
  FileText,
  Calendar,
  Users,
  HardHat,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Plus,
  CloudSun,
  ShieldAlert,
  Clock,
  Eye,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface DailyReportItem {
  id: string;
  reportNumber: string;
  date: string;
  weatherCondition?: string;
  temperature?: number;
  workforceCount?: number;
  workforceDetails?: { trade: string; count: number; hours: number }[];
  workDoneSummary: string;
  activitiesExecuted?: { code?: string; description: string; quantity: number; unit: string }[];
  equipmentUsed?: { equipmentName: string; hoursRun: number; status: string }[];
  materialsConsumed?: { itemCode: string; description: string; quantity: number; unit: string }[];
  hseIncidentsCount: number;
  hseNotes?: string;
  clientRepresentative?: string;
  supervisorName?: string;
  status: 'BROUILLON' | 'SOUMIS' | 'VALIDE';
  validatedBy?: string;
  validatedAt?: string;
  createdAt: string;
}

interface ProjectDailyReportsTabProps {
  projectCode: string;
  projectName?: string;
  clientName?: string;
  siteLocation?: string;
  reports?: DailyReportItem[];
  canEdit: boolean;
  canValidate: boolean;
  onRefresh: () => Promise<void>;
}

export function ProjectDailyReportsTab({
  projectCode,
  projectName = 'Chantier Industriel SILEX',
  clientName = 'Client Contractuel',
  siteLocation = 'Site d’intervention',
  reports = [],
  canEdit,
  canValidate,
  onRefresh,
}: ProjectDailyReportsTabProps) {
  const [selectedReport, setSelectedReport] = useState<DailyReportItem | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  // Formulaire nouveau rapport
  const todayStr = new Date().toISOString().split('T')[0];
  const [reportDate, setReportDate] = useState(todayStr);
  const [weatherCondition, setWeatherCondition] = useState('Ensoleillé / Bonnes conditions');
  const [temperature, setTemperature] = useState<number>(24);
  const [workDoneSummary, setWorkDoneSummary] = useState('');
  const [supervisorName, setSupervisorName] = useState('Conducteur de Travaux SILEX');
  const [clientRepresentative, setClientRepresentative] = useState('Superviseur Client');
  const [hseIncidentsCount, setHseIncidentsCount] = useState<number>(0);
  const [hseNotes, setHseNotes] = useState('Quart d\'heure de sécurité réalisé. RAS.');

  // Effectifs par corps d'état
  const [workforce, setWorkforce] = useState([
    { trade: 'Tuyauterie & Préfabrication', count: 6, hours: 8 },
    { trade: 'Soudage qualifié 6G (ASME IX)', count: 4, hours: 8 },
    { trade: 'Montage mécanique & Manutention', count: 5, hours: 8 },
    { trade: 'Contrôleurs CND & Métrologie', count: 2, hours: 8 },
    { trade: 'Supervision & HSE', count: 2, hours: 9 },
  ]);

  // Activités métrées
  const [activities, setActivities] = useState([
    { description: 'Soudage tuyauterie acier carbone DN150 (Spool S-04)', quantity: 18, unit: 'ml' },
    { description: 'Pose de supports pendulaires et colliers à bride', quantity: 6, unit: 'U' },
  ]);

  // Équipements
  const [equipments, setEquipments] = useState([
    { equipmentName: 'Grue mobile 50T Liebherr', hoursRun: 7, status: 'Opérationnel' },
    { equipmentName: 'Groupe autonome de soudage Miller 400A', hoursRun: 8, status: 'Opérationnel' },
  ]);

  // Matériaux
  const [materials, setMaterials] = useState([
    { itemCode: 'ELEC-7018', description: 'Électrodes basiques E7018 diam 3.2mm', quantity: 35, unit: 'kg' },
    { itemCode: 'GAZ-ARGON', description: 'Bouteilles Argon pur soudage TIG', quantity: 3, unit: 'Bouteilles' },
  ]);

  const [submitting, setSubmitting] = useState(false);

  // Statistiques
  const totalReports = reports.length;
  const validatedReports = reports.filter(r => r.status === 'VALIDE').length;
  const totalHseIncidents = reports.reduce((acc, r) => acc + (r.hseIncidentsCount || 0), 0);
  const totalManHours = reports.reduce((acc, r) => {
    if (r.workforceDetails && r.workforceDetails.length > 0) {
      return acc + r.workforceDetails.reduce((s, w) => s + (w.count * w.hours), 0);
    }
    return acc + ((r.workforceCount || 10) * 8);
  }, 0);

  const handleValidateReport = async (reportId: string) => {
    try {
      setValidatingId(reportId);
      await api.post(`/projects/${projectCode}/daily-reports/${reportId}/validate`, {
        validatorRole: 'DIRECTEUR_GENERAL',
      });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la validation du rapport');
    } finally {
      setValidatingId(null);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDoneSummary.trim()) {
      alert('Veuillez renseigner le résumé des travaux réalisés.');
      return;
    }
    try {
      setSubmitting(true);
      const totalCount = workforce.reduce((acc, w) => acc + Number(w.count || 0), 0);

      await api.post(`/projects/${projectCode}/daily-reports`, {
        date: reportDate,
        weatherCondition,
        temperature: Number(temperature),
        workforceCount: totalCount,
        workforceDetails: workforce,
        workDoneSummary,
        activitiesExecuted: activities.filter(a => a.description.trim()),
        equipmentUsed: equipments.filter(eq => eq.equipmentName.trim()),
        materialsConsumed: materials.filter(m => m.description.trim()),
        hseIncidentsCount: Number(hseIncidentsCount),
        hseNotes,
        supervisorName,
        clientRepresentative,
        status: 'SOUMIS',
      });

      setShowCreateModal(false);
      setWorkDoneSummary('');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’émission du rapport');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (report: DailyReportItem) => {
    setSelectedReport(report);
    setShowPrintModal(true);
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Rapports Journaliers</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalReports}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Émis sur ce chantier</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase">Rapports Validés</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{validatedReports} / {totalReports}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {totalReports > 0 ? Math.round((validatedReports / totalReports) * 100) : 0}% visés DG / Client
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase">Heures Travaillées Cumulées</div>
          <div className="text-xl font-bold text-blue-700 mt-1">{totalManHours.toLocaleString('fr-DZ')} h</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Productivité chantier</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            Sécurité HSE
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{totalHseIncidents} incident</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zéro accident avec arrêt</div>
        </div>
      </div>

      {/* Header bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#0B207D]" />
            Registres & Rapports Journaliers de Chantier (Daily Site Reports - RJC)
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Traçabilité contradictoire quotidienne : effectifs mobilisés, métrés réalisés, engins engagés et visas.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white rounded-md text-xs font-semibold hover:bg-[#07164D] transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Rapport Journalier</span>
          </button>
        )}
      </div>

      {/* List of reports */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-400 text-xs">
            Aucun rapport journalier enregistré pour ce chantier.
          </div>
        ) : (
          reports.map(rep => {
            const isValidated = rep.status === 'VALIDE';
            const totalHeadcount = rep.workforceDetails
              ? rep.workforceDetails.reduce((a, b) => a + b.count, 0)
              : rep.workforceCount || 0;

            return (
              <div
                key={rep.id}
                className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs hover:border-slate-300 transition-all p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {rep.reportNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateDZ(rep.date)}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 ml-2">
                      <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                      {rep.weatherCondition || 'Météo normale'} ({rep.temperature || 22}°C)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isValidated
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : rep.status === 'SOUMIS'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isValidated ? '✓ VALIDÉ & VISÉ' : rep.status === 'SOUMIS' ? 'SOUMIS / EN ATTENTE VISA' : 'BROUILLON'}
                    </span>

                    <button
                      onClick={() => handlePrint(rep)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 cursor-pointer"
                      title="Imprimer le rapport officiel A4"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Fiche A4</span>
                    </button>

                    {canValidate && !isValidated && (
                      <button
                        onClick={() => handleValidateReport(rep.id)}
                        disabled={validatingId === rep.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{validatingId === rep.id ? 'Validation...' : 'Viser le Rapport'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Résumé des travaux */}
                <div className="text-xs text-slate-800">
                  <div className="font-semibold text-slate-900 mb-0.5">Travaux & Opérations réalisés :</div>
                  <p className="text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded border border-slate-100">
                    {rep.workDoneSummary}
                  </p>
                </div>

                {/* Grille détails métrés & effectifs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Effectifs */}
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1 mb-1.5">
                      <Users className="w-3.5 h-3.5 text-[#0B207D]" />
                      Effectifs mobilisés ({totalHeadcount} pers.)
                    </div>
                    {rep.workforceDetails && rep.workforceDetails.length > 0 ? (
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {rep.workforceDetails.map((w, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{w.trade}</span>
                            <span className="font-semibold text-slate-800">{w.count} pers. ({w.hours}h)</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[11px] text-slate-500">Effectif total : {totalHeadcount} pers.</span>
                    )}
                  </div>

                  {/* Activités métrées */}
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1 mb-1.5">
                      <HardHat className="w-3.5 h-3.5 text-[#0B207D]" />
                      Métrés contradictoires du jour
                    </div>
                    {rep.activitiesExecuted && rep.activitiesExecuted.length > 0 ? (
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {rep.activitiesExecuted.map((a, idx) => (
                          <li key={idx} className="flex justify-between gap-2">
                            <span className="truncate">{a.description}</span>
                            <span className="font-bold text-[#0B207D] shrink-0">{a.quantity} {a.unit}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[11px] text-slate-400">Aucun métré détaillé spécifié</span>
                    )}
                  </div>

                  {/* Équipements & HSE */}
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1 mb-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#0B207D]" />
                      Engins & HSE
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      {rep.equipmentUsed && rep.equipmentUsed.length > 0 ? (
                        rep.equipmentUsed.map((eq, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{eq.equipmentName}</span>
                            <span className="font-semibold">{eq.hoursRun}h</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400">Aucun engin lourd consigné</div>
                      )}
                      <div className="pt-1.5 border-t border-slate-200 mt-1 flex justify-between font-semibold">
                        <span className="text-emerald-700">Incidents HSE :</span>
                        <span className={rep.hseIncidentsCount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                          {rep.hseIncidentsCount} ({rep.hseIncidentsCount === 0 ? 'Conforme' : 'À traiter'})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bas de carte : Signatures / Visas */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                  <div>
                    Conducteur de Travaux : <strong className="text-slate-700">{rep.supervisorName || 'SILEX Services'}</strong>
                  </div>
                  <div>
                    Visa Client : <strong className="text-slate-700">{rep.clientRepresentative || 'Maître d’ouvrage'}</strong>
                  </div>
                  {isValidated && rep.validatedAt && (
                    <div className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Visé le {formatDateDZ(rep.validatedAt)} par {rep.validatedBy || 'DG'}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Fiche Imprimable A4 */}
      {showPrintModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-6 text-slate-900 border border-slate-300 print:border-none print:shadow-none print:p-0 my-8">
            {/* Header actions (hidden in print) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 print:hidden">
              <div className="text-xs font-bold text-slate-700 uppercase">
                Aperçu officiel pour impression / archivage (Format A4)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#0B207D] text-white rounded text-xs font-semibold hover:bg-[#07164D] flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer la Fiche</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* Document A4 Content */}
            <div className="space-y-4 font-sans text-xs print:text-[11px]">
              {/* En-tête officiel entreprise */}
              <div className="border-2 border-slate-800 p-3 rounded flex items-center justify-between">
                <div>
                  <div className="text-base font-extrabold text-[#0B207D] tracking-wider">SARL SILEX SERVICES</div>
                  <div className="text-[10px] text-slate-600">Tuyauterie industrielle • Soudage • Montage mécanique • HVAC</div>
                  <div className="text-[9px] text-slate-400 font-mono">NIF: 001916010896745 • RC: 16/00-1012345B19</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900 uppercase">RAPPORT JOURNALIER DE CHANTIER</div>
                  <div className="font-mono text-xs font-bold text-[#0B207D]">{selectedReport.reportNumber}</div>
                  <div className="text-[10px] text-slate-600">Date : {formatDateDZ(selectedReport.date)}</div>
                </div>
              </div>

              {/* Métadonnées projet */}
              <div className="grid grid-cols-2 gap-2 border border-slate-300 p-2.5 rounded bg-slate-50 text-[11px]">
                <div>
                  <span className="font-bold text-slate-700">Chantier / Projet : </span>
                  <span className="font-semibold text-[#0B207D]">{projectCode} - {projectName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Client Contractuel : </span>
                  <span>{clientName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Localisation Site : </span>
                  <span>{siteLocation}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Conditions Météo : </span>
                  <span>{selectedReport.weatherCondition || 'Normales'} ({selectedReport.temperature || 22}°C)</span>
                </div>
              </div>

              {/* Effectifs */}
              <div>
                <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 bg-slate-200 px-2 py-0.5">
                  1. EFFECTIFS MOBILISÉS SUR CHANTIER
                </div>
                <table className="w-full border border-slate-300 text-left text-[10px]">
                  <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="p-1.5">Corps d&apos;état / Qualification</th>
                      <th className="p-1.5 text-center w-24">Effectif (Pers.)</th>
                      <th className="p-1.5 text-center w-24">Heures / Pers.</th>
                      <th className="p-1.5 text-right w-24">Total Heures</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(selectedReport.workforceDetails || []).map((w, idx) => (
                      <tr key={idx}>
                        <td className="p-1.5">{w.trade}</td>
                        <td className="p-1.5 text-center font-bold">{w.count}</td>
                        <td className="p-1.5 text-center">{w.hours} h</td>
                        <td className="p-1.5 text-right font-mono">{w.count * w.hours} h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Travaux Exécutés & Métrés */}
              <div>
                <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 bg-slate-200 px-2 py-0.5">
                  2. TRAVAUX RÉALISÉS & MÉTRÉS CONTRADICTOIRES DU JOUR
                </div>
                <div className="p-2 border border-slate-300 rounded text-[11px] mb-2 leading-relaxed">
                  {selectedReport.workDoneSummary}
                </div>
                {selectedReport.activitiesExecuted && selectedReport.activitiesExecuted.length > 0 && (
                  <table className="w-full border border-slate-300 text-left text-[10px]">
                    <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                      <tr>
                        <th className="p-1.5">Désignation des Prestations Exécutées</th>
                        <th className="p-1.5 text-right w-28">Quantité du jour</th>
                        <th className="p-1.5 text-center w-20">Unité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedReport.activitiesExecuted.map((a, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5 font-medium">{a.description}</td>
                          <td className="p-1.5 text-right font-bold text-[#0B207D] font-mono">{a.quantity}</td>
                          <td className="p-1.5 text-center font-bold text-slate-600">{a.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Matériaux & Engins */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 bg-slate-200 px-2 py-0.5">
                    3. ENGINS & MATÉRIEL LOURD
                  </div>
                  <table className="w-full border border-slate-300 text-left text-[10px]">
                    <tbody className="divide-y divide-slate-200">
                      {(selectedReport.equipmentUsed || []).map((eq, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5">{eq.equipmentName}</td>
                          <td className="p-1.5 text-right font-bold font-mono">{eq.hoursRun} h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 bg-slate-200 px-2 py-0.5">
                    4. MATÉRIAUX CONSOMMÉS DU JOUR
                  </div>
                  <table className="w-full border border-slate-300 text-left text-[10px]">
                    <tbody className="divide-y divide-slate-200">
                      {(selectedReport.materialsConsumed || []).map((m, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5">{m.description}</td>
                          <td className="p-1.5 text-right font-bold font-mono">{m.quantity} {m.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sécurité HSE */}
              <div>
                <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 bg-slate-200 px-2 py-0.5">
                  5. SÉCURITÉ & HSE CHANTIER
                </div>
                <div className="p-2 border border-slate-300 rounded text-[10px] flex items-center justify-between">
                  <span>{selectedReport.hseNotes || 'Quart d’heure de sécurité réalisé. Respect strict des EPI et consignes.'}</span>
                  <span className="font-bold text-emerald-700 shrink-0 ml-2">
                    Incidents signalés : {selectedReport.hseIncidentsCount}
                  </span>
                </div>
              </div>

              {/* Signatures officielles */}
              <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="border border-slate-300 p-3 rounded min-h-[90px] flex flex-col justify-between">
                  <div className="font-bold text-[10px] uppercase text-slate-700">
                    POUR SARL SILEX SERVICES
                    <div className="text-[9px] font-normal text-slate-500">Conducteur de Travaux / Superviseur</div>
                  </div>
                  <div className="text-center font-bold text-[#0B207D] text-[11px] pt-4">
                    {selectedReport.supervisorName || 'M. le Conducteur de Travaux'}
                    <div className="text-[9px] text-slate-400 font-normal">Signature & Cachet Électronique Silex</div>
                  </div>
                </div>

                <div className="border border-slate-300 p-3 rounded min-h-[90px] flex flex-col justify-between">
                  <div className="font-bold text-[10px] uppercase text-slate-700">
                    POUR LE MAÎTRE D&apos;OUVRAGE / CLIENT
                    <div className="text-[9px] font-normal text-slate-500">Superviseur Chantier / Bureau de Contrôle</div>
                  </div>
                  <div className="text-center font-bold text-slate-800 text-[11px] pt-4">
                    {selectedReport.clientRepresentative || 'Représentant Client'}
                    <div className="text-[9px] text-slate-400 font-normal">Visa contradictoire</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création Rapport */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#0B207D] text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Nouveau Rapport Journalier de Chantier (RJC)</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Date du Rapport *
                  </label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={e => setReportDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Météo
                  </label>
                  <input
                    type="text"
                    value={weatherCondition}
                    onChange={e => setWeatherCondition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Température (°C)
                  </label>
                  <input
                    type="number"
                    value={temperature}
                    onChange={e => setTemperature(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Résumé des Travaux & Activités Réalisés *
                </label>
                <textarea
                  rows={3}
                  required
                  value={workDoneSummary}
                  onChange={e => setWorkDoneSummary(e.target.value)}
                  placeholder="Décrire en détail les avancées de la journée, les spools préfabriqués, les joints soudés, les lignes éprouvées..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              {/* HSE */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Incidents HSE
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={hseIncidentsCount}
                    onChange={e => setHseIncidentsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Notes HSE & Toolbox Meeting
                  </label>
                  <input
                    type="text"
                    value={hseNotes}
                    onChange={e => setHseNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              {/* Signataires */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Conducteur de Travaux SILEX
                  </label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={e => setSupervisorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Représentant Client
                  </label>
                  <input
                    type="text"
                    value={clientRepresentative}
                    onChange={e => setClientRepresentative(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#0B207D] text-white font-semibold rounded-md hover:bg-[#07164D] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Émission en cours...' : 'Émettre le Rapport Journalier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
