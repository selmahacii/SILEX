'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDateDZ } from '@silex/shared';
import {
  FileCheck,
  AlertTriangle,
  ShieldCheck,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  X,
  Search,
  Filter,
  Check,
  Sparkles,
  Flame,
  FileSpreadsheet,
  Layers,
  Award,
  UserCheck,
  ExternalLink,
} from 'lucide-react';

export default function QualityPage() {
  const { activeRole } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [nonConformities, setNonConformities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Search
  const [searchDoc, setSearchDoc] = useState('');
  const [searchNC, setSearchNC] = useState('');

  // Modal Nouveau Document
  const [showDocModal, setShowDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docCategory, setDocCategory] = useState('PROCEDURE');
  const [docAuthor, setDocAuthor] = useState('Direction Technique & Qualité SILEX');
  const [docVersion, setDocVersion] = useState('1.0');

  // Modal Nouvelle Non-Conformité
  const [showNcModal, setShowNcModal] = useState(false);
  const [ncTitle, setNcTitle] = useState('');
  const [ncNumber, setNcNumber] = useState('');
  const [ncDescription, setNcDescription] = useState('Défaut d’inclusion de laitier et caniveau détecté sur le joint soudé J-04.');
  const [ncSeverity, setNcSeverity] = useState('MAJEURE');
  const [ncDetectedBy, setNcDetectedBy] = useState('Inspecteur Contrôle CND SILEX (COFREND II)');
  const [ncProjectId, setNcProjectId] = useState('');

  // Modal Action Corrective
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedNcForAction, setSelectedNcForAction] = useState<any | null>(null);
  const [actionDesc, setActionDesc] = useState('Gougeage complet du cordon défectueux et reprise de passe sous contrôle direct');
  const [actionResp, setActionResp] = useState('Chef d’équipe Soudage & Responsable CND');

  // Modale Clôture & Arbitrage FNC
  const [selectedNcForClosure, setSelectedNcForClosure] = useState<any | null>(null);
  const [ncClosureType, setNcClosureType] = useState<'VISA_CND' | 'DEROGATION_CLIENT' | 'SCRAP_REBUT' | 'INVESTIGATION'>('VISA_CND');
  const [ncClosureNotes, setNcClosureNotes] = useState('Réfection du cordon effectuée avec succès et contrôlée par ressuage (PT) et radiographie (RT) conforme ASME IX.');

  // Weld Book & Soudures Industrielles
  const [activeTab, setActiveTab] = useState<'ged_fnc' | 'weld_book'>('ged_fnc');
  const [showWeldModal, setShowWeldModal] = useState(false);
  const [searchWeld, setSearchWeld] = useState('');
  const [weldJointNumber, setWeldJointNumber] = useState('J-05-VAPEUR-HP');
  const [weldLineIso, setWeldLineIso] = useState('ISO-316L-DN150-SCH80');
  const [weldMaterial, setWeldMaterial] = useState('Inox 316L (Nuance Z2CND17-12)');
  const [weldWelderName, setWeldWelderName] = useState('Amar Bouzid (CQS-BV-2026-088)');
  const [weldDmos, setWeldDmos] = useState('DMOS-01 (TIG 141 racine + SMAW 111 remplissage)');
  const [weldCndType, setWeldCndType] = useState('100% Ressuage PT + 100% Radio RT');
  const [weldInspector, setWeldInspector] = useState('Bureau Veritas Algérie (COFREND II)');
  const [weldStatus, setWeldStatus] = useState<'CONFORME' | 'REPARE_CONFORME' | 'EN_ATTENTE_CND'>('CONFORME');
  const [weldRecords, setWeldRecords] = useState<any[]>([]);

  const loadQualityData = async () => {
    try {
      setLoading(true);
      const [docs, ncs, prjs] = await Promise.all([
        api.get<any[]>('/quality/documents'),
        api.get<any[]>('/quality/non-conformities'),
        api.get<any[]>('/projects'),
      ]);
      setDocuments(Array.isArray(docs) ? docs : []);
      setNonConformities(Array.isArray(ncs) ? ncs : []);
      setProjects(Array.isArray(prjs) ? prjs : []);

      if (prjs.length > 0 && !ncProjectId) setNcProjectId(prjs[0].id);
    } catch (err) {
      console.error('Erreur qualité:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQualityData();
  }, [activeRole]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.post<any>('/quality/documents', {
        docNumber: docNumber || `DOC-2026-${String(documents.length + 1).padStart(3, '0')}`,
        title: docTitle,
        category: docCategory,
        author: docAuthor || 'Direction Technique SILEX',
        version: docVersion || '1.0',
        status: 'VALIDE',
      });
      setShowDocModal(false);
      setDocTitle('');
      setDocNumber('');
      await loadQualityData();
      setNotification(`Document qualité "${created.title}" (${created.docNumber}) enregistré dans la GED !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur création document');
    }
  };

  const handleCreateNC = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.post<any>('/quality/non-conformities', {
        ncNumber: ncNumber || `FNC-2026-${String(nonConformities.length + 1).padStart(3, '0')}`,
        title: ncTitle,
        description: ncDescription,
        severity: ncSeverity,
        detectedBy: ncDetectedBy || 'Inspecteur Qualité SILEX',
        projectId: ncProjectId || undefined,
      });
      setShowNcModal(false);
      setNcTitle('');
      setNcNumber('');
      await loadQualityData();
      setNotification(`Fiche de Non-Conformité ${created.ncNumber} émise avec gravité ${created.severity} !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur signalement non-conformité');
    }
  };

  const handleToggleNCStatus = async (ncId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'CLOSED' ? 'OPEN' : 'CLOSED';
      // Mise à jour visuelle immédiate
      setNonConformities(prev => prev.map(nc => (nc.id === ncId ? { ...nc, status: nextStatus } : nc)));
      setNotification(`Statut de la non-conformité mis à jour : ${nextStatus}.`);
      setTimeout(() => setNotification(null), 5000);

      await api.patch(`/quality/non-conformities/${ncId}/status`, { status: nextStatus });
      await loadQualityData();
    } catch (err: any) {
      alert(err.message || 'Erreur mise à jour statut NC');
      await loadQualityData();
    }
  };

  const handleSaveNcClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNcForClosure) return;
    try {
      let statusToSet = 'CLOSED';
      let closeLabel = 'Visa Contrôle Qualité';
      if (ncClosureType === 'VISA_CND') {
        closeLabel = 'Visa CND Conforme';
        statusToSet = 'CLOSED';
      } else if (ncClosureType === 'DEROGATION_CLIENT') {
        closeLabel = 'Dérogation Client';
        statusToSet = 'CLOSED';
      } else if (ncClosureType === 'SCRAP_REBUT') {
        closeLabel = 'Mise au Rebut';
        statusToSet = 'CLOSED';
      } else if (ncClosureType === 'INVESTIGATION') {
        closeLabel = 'Contre-expertise demandée';
        statusToSet = 'UNDER_INVESTIGATION';
      }

      const closingNcId = selectedNcForClosure.id;
      // Mise à jour visuelle immédiate
      setNonConformities(prev =>
        prev.map(nc =>
          nc.id === closingNcId ? { ...nc, status: statusToSet, resolutionNotes: ncClosureNotes } : nc
        )
      );

      setSelectedNcForClosure(null);
      setNcClosureNotes('');
      setNotification(`FNC arbitrée : statut ${statusToSet} (${closeLabel}) !`);
      setTimeout(() => setNotification(null), 5000);

      await api.patch(`/quality/non-conformities/${closingNcId}/status`, {
        status: statusToSet,
        closeType: closeLabel,
        resolutionNotes: ncClosureNotes,
      });
      await loadQualityData();
    } catch (err: any) {
      alert(err.message || 'Erreur arbitrage FNC');
      await loadQualityData();
    }
  };

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNcForAction) return;
    try {
      const ncId = selectedNcForAction.id;
      // Mise à jour visuelle immédiate
      setNonConformities(prev =>
        prev.map(nc =>
          nc.id === ncId
            ? {
                ...nc,
                status: 'UNDER_INVESTIGATION',
                actions: [
                  ...(nc.actions || []),
                  { id: `act-${Date.now()}`, description: actionDesc, responsible: actionResp, targetDate: new Date().toISOString() },
                ],
              }
            : nc
        )
      );

      setShowActionModal(false);
      setNotification(`Action corrective enregistrée pour ${selectedNcForAction.ncNumber} !`);
      setTimeout(() => setNotification(null), 5000);

      await api.post(`/quality/non-conformities/${ncId}/actions`, {
        description: actionDesc,
        responsible: actionResp,
        targetDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      });
      await loadQualityData();
    } catch (err: any) {
      alert(err.message);
      await loadQualityData();
    }
  };

  const filteredDocs = documents.filter(d =>
    d.title?.toLowerCase().includes(searchDoc.toLowerCase()) ||
    d.docNumber?.toLowerCase().includes(searchDoc.toLowerCase()) ||
    d.category?.toLowerCase().includes(searchDoc.toLowerCase())
  );

  const filteredNCs = nonConformities.filter(nc =>
    nc.title?.toLowerCase().includes(searchNC.toLowerCase()) ||
    nc.ncNumber?.toLowerCase().includes(searchNC.toLowerCase()) ||
    nc.description?.toLowerCase().includes(searchNC.toLowerCase())
  );

  const handleCreateWeldJoint = (e: React.FormEvent) => {
    e.preventDefault();
    const newWeld = {
      id: `weld-${Date.now()}`,
      jointNumber: weldJointNumber,
      lineIso: weldLineIso,
      material: weldMaterial,
      welder: weldWelderName,
      dmos: weldDmos,
      cnd: weldCndType,
      inspector: weldInspector,
      date: new Date().toISOString().split('T')[0],
      status: weldStatus,
    };
    setWeldRecords(prev => [newWeld, ...prev]);
    setShowWeldModal(false);
    setNotification(`Soudure ${weldJointNumber} consignée avec succès au Weld Book ! Traçabilité CND active.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredWelds = weldRecords.filter(w =>
    w.jointNumber?.toLowerCase().includes(searchWeld.toLowerCase()) ||
    w.lineIso?.toLowerCase().includes(searchWeld.toLowerCase()) ||
    w.welder?.toLowerCase().includes(searchWeld.toLowerCase()) ||
    w.material?.toLowerCase().includes(searchWeld.toLowerCase())
  );

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
            <ShieldCheck className="w-5 h-5 text-[#0B207D]" />
            Documents & Traçabilité Qualité (ISO 9001 / QHSE)
          </h1>
          <p className="text-xs text-[#697789] mt-0.5">
            GED, procédures de soudage ASME IX / ISO 9606, cahiers de tuyauterie et fiches de non-conformité SILEX SERVICES.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowDocModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-lg hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau Document Qualité
          </button>
          <button
            onClick={() => setShowNcModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#E51A1A] text-white rounded-lg hover:bg-[#c81414] transition-colors shadow-xs cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Signaler Non-Conformité (FNC)
          </button>
          <button
            onClick={() => setShowWeldModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-orange-500 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-orange-600" />
            Consigner Soudure (Weld Book)
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ged_fnc')}
          className={`py-2 px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ged_fnc'
              ? 'border-[#0B207D] text-[#0B207D] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Bibliothèque GED & FNC Chantiers ({filteredDocs.length + filteredNCs.length})
        </button>
        <button
          onClick={() => setActiveTab('weld_book')}
          className={`py-2 px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'weld_book'
              ? 'border-orange-600 text-orange-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-600" />
          Weld Book & Registre des Soudures CND ({weldRecords.length})
        </button>
      </div>

      {/* Grid: GED on left, NonConformities on right */}
      {activeTab === 'ged_fnc' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GED Documentation */}
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#0A7F7C]" />
              Bibliothèque Documentaire Qualité ({filteredDocs.length})
            </h2>
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="Filtrer doc..."
                value={searchDoc}
                onChange={e => setSearchDoc(e.target.value)}
                className="pl-7 pr-2 py-0.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0A7F7C]"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 p-2 max-h-[550px] overflow-y-auto flex-1">
            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Aucun document trouvé.</div>
            ) : (
              (Array.isArray(filteredDocs) ? filteredDocs : []).map(doc => (
                <div key={doc.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#142B45]">{doc.docNumber}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                        v{doc.version}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                        {doc.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 mt-1">{doc.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Catégorie : <strong>{doc.category}</strong> • Auteur : {doc.author}
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Téléchargement certifié de la procédure ${doc.docNumber}`)}
                    className="p-1.5 text-slate-500 hover:text-[#0A7F7C] hover:bg-teal-50 rounded"
                    title="Télécharger Document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Non-Conformités & Actions Correctives */}
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Fiches de Non-Conformité ({filteredNCs.length})
            </h2>
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="Filtrer FNC..."
                value={searchNC}
                onChange={e => setSearchNC(e.target.value)}
                className="pl-7 pr-2 py-0.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0A7F7C]"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 p-2 max-h-[550px] overflow-y-auto flex-1">
            {filteredNCs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Aucune non-conformité enregistrée.</div>
            ) : (
              (Array.isArray(filteredNCs) ? filteredNCs : []).map(nc => {
                const isClosed = nc.status === 'CLOSED';
                return (
                  <div key={nc.id} className="p-3 hover:bg-slate-50 transition-colors space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#142B45]">{nc.ncNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          nc.severity === 'CRITIQUE'
                            ? 'bg-red-100 text-red-900 border-red-300'
                            : nc.severity === 'MAJEURE'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          Gravité {nc.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedNcForAction(nc);
                            setShowActionModal(true);
                          }}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                        >
                          + Action Corrective
                        </button>
                        <button
                          onClick={() => {
                            setSelectedNcForClosure(nc);
                            setNcClosureType(isClosed ? 'INVESTIGATION' : 'VISA_CND');
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#0B207D] bg-blue-50 text-[#0B207D] hover:bg-blue-100 cursor-pointer"
                        >
                          Arbitrer / Visa Clôture
                        </button>
                        <button
                          onClick={() => handleToggleNCStatus(nc.id, nc.status)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer transition-colors inline-flex items-center gap-1 ${
                            isClosed
                              ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          {isClosed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-slate-500" />
                              <span>Clôturée</span>
                            </>
                          ) : (
                            'Clôture Directe'
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="font-semibold text-slate-800">{nc.title}</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{nc.description}</p>

                    <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-slate-100">
                      <span>Détecté par : <strong>{nc.detectedBy}</strong></span>
                      <span>Date : <strong>{formatDateDZ(nc.detectedDate)}</strong></span>
                      {nc.project && (
                        <span className="inline-flex items-center gap-1">
                          Chantier :{' '}
                          <Link
                            href={`/projects/${nc.project.code}`}
                            className="inline-flex items-center gap-0.5 text-[#0B207D] font-bold hover:underline"
                          >
                            {nc.project.code}
                            <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
                          </Link>
                        </span>
                      )}
                    </div>

                    {nc.rootCause && (
                      <div className="mt-1 p-2 bg-emerald-50/70 border border-emerald-200 rounded text-[11px] text-emerald-950">
                        <div className="font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Résolution & Visa Qualité :
                        </div>
                        <div className="mt-0.5">{nc.rootCause}</div>
                      </div>
                    )}

                    {nc.actions && nc.actions.length > 0 && (
                      <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
                        <div className="font-bold text-slate-700">Actions correctives engagées :</div>
                        {(Array.isArray(nc?.actions) ? nc.actions : []).map((act: any) => (
                          <div key={act.id} className="text-slate-600 flex justify-between">
                            <span>• {act.description} ({act.responsible})</span>
                            <span className="font-semibold text-teal-700">{act.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      )}

      {/* WELD BOOK TAB */}
      {activeTab === 'weld_book' && (
        <div className="bg-white rounded-xl border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-600" />
                Weld Book / Registre Unitaire des Soudures Industrielles (ASME IX / ISO 9606-1)
              </h2>
              <p className="text-[11px] text-slate-500">
                Traçabilité unitaire des cordons : repère joint, ligne ISO, nuance d'acier, qualification soudeur (CQS), DMOS et contrôles non-destructifs (CND).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Rechercher joint, ISO, soudeur..."
                  value={searchWeld}
                  onChange={e => setSearchWeld(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
                />
              </div>
              <button
                onClick={() => setShowWeldModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded-lg hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Consigner Soudure
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-orange-50/60 rounded-lg border border-orange-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Soudures Enregistrées</div>
              <div className="text-base font-extrabold text-[#07164D] mt-0.5">{weldRecords.length} joints tracés</div>
              <div className="text-[10px] text-orange-700 mt-1">Conformité ASME Section IX</div>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Taux d'Acceptation CND</div>
              <div className="text-base font-extrabold text-emerald-700 mt-0.5">100% Conforme</div>
              <div className="text-[10px] text-emerald-600 mt-1">Ressuage (PT) & Radiographie (RT)</div>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Organismes d'Inspection</div>
              <div className="text-xs font-bold text-[#0B207D] mt-1">Bureau Veritas • COFREND II • Sonatrach</div>
              <div className="text-[10px] text-slate-500 mt-1">Contrôles contradictoires certifiés</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600 border-b">
                <tr>
                  <th className="p-2.5">Repère Joint</th>
                  <th className="p-2.5">Ligne ISO / Isométrique</th>
                  <th className="p-2.5">Nuance Matière</th>
                  <th className="p-2.5">Soudeur & N° CQS</th>
                  <th className="p-2.5">DMOS Utilisé</th>
                  <th className="p-2.5">Contrôle CND & Organisme</th>
                  <th className="p-2.5 text-center">Date</th>
                  <th className="p-2.5 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredWelds.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                      Aucun joint de soudure consigné pour l’instant. Cliquez sur « Consigner un Joint de Soudure » pour enrichir le Weld Book.
                    </td>
                  </tr>
                ) : (
                  filteredWelds.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-[#0B207D]">{w.jointNumber}</td>
                      <td className="p-2.5 font-mono text-slate-700">{w.lineIso}</td>
                      <td className="p-2.5 text-slate-800 font-semibold">{w.material}</td>
                      <td className="p-2.5 text-slate-700">{w.welder}</td>
                      <td className="p-2.5 text-slate-600 text-[11px]">{w.dmos}</td>
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-800">{w.cnd}</div>
                        <div className="text-[10px] text-slate-500">{w.inspector}</div>
                      </td>
                      <td className="p-2.5 text-center text-slate-500">{formatDateDZ(w.date)}</td>
                      <td className="p-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>{w.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Nouveau Document */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#142B45] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#0A7F7C]" />
                Enregistrer un Document Qualité (GED)
              </h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Numéro de Document / Réf. <span className="text-[10px] font-normal text-slate-400">(auto si vide)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: MOS-WPS-2026-614"
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Titre de la Procédure / Norme <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Descriptif de Mode Opératoire de Soudage DMOS / ASME IX"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catégorie</label>
                  <select
                    value={docCategory}
                    onChange={e => setDocCategory(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs font-medium"
                  >
                    <option value="PROCEDURE">Procédure Technique</option>
                    <option value="DMOS">DMOS (Soudage)</option>
                    <option value="QMOS">QMOS (Qualification)</option>
                    <option value="PAQ">PAQ (Assurance Qualité)</option>
                    <option value="CND">Procédure Contrôle CND</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Version / Rév</label>
                  <input
                    type="text"
                    value={docVersion}
                    onChange={e => setDocVersion(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Auteur / Émetteur</label>
                <input
                  type="text"
                  value={docAuthor}
                  onChange={e => setDocAuthor(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Enregistrer Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nouvelle Non-Conformité */}
      {showNcModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#C44747] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Signaler une Non-Conformité Chantier (FNC)
              </h3>
              <button onClick={() => setShowNcModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNC} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Chantier / Projet Concerne <span className="text-red-500">*</span>
                </label>
                <select
                  value={ncProjectId}
                  onChange={e => setNcProjectId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                  required
                >
                  {(Array.isArray(projects) ? projects : []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Intitulé du Défaut / Non-Conformité <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Inclusion de laitier et porosité joint J-04 ligne Inox"
                  value={ncTitle}
                  onChange={e => setNcTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Degré de Gravité <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ncSeverity}
                    onChange={e => setNcSeverity(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs font-medium"
                  >
                    <option value="MINEURE">Mineure (Reprise sans arrêt)</option>
                    <option value="MAJEURE">Majeure (Contrôle CND obligatoire)</option>
                    <option value="CRITIQUE">Critique (Arrêt immédiat de la ligne)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Inspecteur / Détecteur
                  </label>
                  <input
                    type="text"
                    value={ncDetectedBy}
                    onChange={e => setNcDetectedBy(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Description Métallurgique & Circonstances <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={ncDescription}
                  onChange={e => setNcDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNcModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C44747] text-white font-semibold rounded hover:bg-[#a33838] transition-colors shadow-xs"
                >
                  Émettre la Fiche de Non-Conformité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nouvelle Action Corrective */}
      {showActionModal && selectedNcForAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#142B45] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0A7F7C]" />
                Action Corrective pour {selectedNcForAction.ncNumber}
              </h3>
              <button onClick={() => setShowActionModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAction} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Plan d'Action Corrective / Éradication <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={actionDesc}
                  onChange={e => setActionDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Responsable d'Exécution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={actionResp}
                  onChange={e => setActionResp(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Engager l'Action Corrective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4 : ARBITRAGE & CLÔTURE FORMELLE FNC (VISA CND / DÉROGATION / REBUT) */}
      {/* ========================================================================= */}
      {selectedNcForClosure && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0A7F7C]" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Arbitrage & Visa Qualité FNC</h3>
                  <p className="text-[11px] text-slate-500">{selectedNcForClosure.ncNumber} — Gravité {selectedNcForClosure.severity}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNcForClosure(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNcClosure} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Décision d'Arbitrage & Clôture de la FNC *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    onClick={() => setNcClosureType('VISA_CND')}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                      ncClosureType === 'VISA_CND'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ncType"
                      checked={ncClosureType === 'VISA_CND'}
                      onChange={() => setNcClosureType('VISA_CND')}
                      className="text-emerald-600"
                    />
                    <div>
                      <div>Visa CND Conforme</div>
                      <div className="text-[10px] text-slate-500 font-normal">Réfection contrôlée et conforme</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setNcClosureType('DEROGATION_CLIENT')}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                      ncClosureType === 'DEROGATION_CLIENT'
                        ? 'border-blue-500 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ncType"
                      checked={ncClosureType === 'DEROGATION_CLIENT'}
                      onChange={() => setNcClosureType('DEROGATION_CLIENT')}
                      className="text-[#0B207D]"
                    />
                    <div>
                      <div>Dérogation Client</div>
                      <div className="text-[10px] text-slate-500 font-normal">Accord écrit maître d'œuvre</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setNcClosureType('SCRAP_REBUT')}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                      ncClosureType === 'SCRAP_REBUT'
                        ? 'border-red-500 bg-red-50 text-red-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ncType"
                      checked={ncClosureType === 'SCRAP_REBUT'}
                      onChange={() => setNcClosureType('SCRAP_REBUT')}
                      className="text-red-600"
                    />
                    <div>
                      <div>Mise au Rebut</div>
                      <div className="text-[10px] text-slate-500 font-normal">Pièce irrécupérable / ferraillage</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setNcClosureType('INVESTIGATION')}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                      ncClosureType === 'INVESTIGATION'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ncType"
                      checked={ncClosureType === 'INVESTIGATION'}
                      onChange={() => setNcClosureType('INVESTIGATION')}
                      className="text-amber-600"
                    />
                    <div>
                      <div>Contre-expertise</div>
                      <div className="text-[10px] text-slate-500 font-normal">Recontrôle contradictoire requis</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Rapport de Clôture & Attestation Technique *
                </label>
                <textarea
                  required
                  rows={3}
                  value={ncClosureNotes}
                  onChange={e => setNcClosureNotes(e.target.value)}
                  placeholder="Ex: Cordon J-04 meulé, ressoudé par soudeur qualifié ASME IX (licence WQT-042) et contrôlé 100% ressuage et ultrasons sans aucun défaut..."
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-[#0A7F7C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedNcForClosure(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Enregistrer la Décision Qualité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : CONSIGNER UNE NOUVELLE SOUDURE (WELD BOOK) */}
      {/* ========================================================================= */}
      {showWeldModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Consigner Soudure au Weld Book</h3>
                  <p className="text-[11px] text-slate-500">Enregistrement unitaire d'un joint soudé sous code ASME IX</p>
                </div>
              </div>
              <button
                onClick={() => setShowWeldModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWeldJoint} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Repère / N° Joint *
                  </label>
                  <input
                    type="text"
                    required
                    value={weldJointNumber}
                    onChange={e => setWeldJointNumber(e.target.value)}
                    placeholder="Ex: J-05-VAPEUR-HP"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ligne ISO / Isométrique *
                  </label>
                  <input
                    type="text"
                    required
                    value={weldLineIso}
                    onChange={e => setWeldLineIso(e.target.value)}
                    placeholder="Ex: ISO-316L-DN150-SCH80"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nuance Matière *
                  </label>
                  <select
                    value={weldMaterial}
                    onChange={e => setWeldMaterial(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                  >
                    <option value="Inox 316L (Nuance Z2CND17-12)">Inox 316L (Nuance Z2CND17-12)</option>
                    <option value="Acier Carbone A106 Gr.B">Acier Carbone A106 Gr.B</option>
                    <option value="Acier Allié P91 (Haute Température)">Acier Allié P91 (Haute Température)</option>
                    <option value="Inox 304L Tuyauterie Agro/Chimie">Inox 304L Tuyauterie Agro/Chimie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Procédé & DMOS Rattaché *
                  </label>
                  <input
                    type="text"
                    required
                    value={weldDmos}
                    onChange={e => setWeldDmos(e.target.value)}
                    placeholder="Ex: DMOS-01 (TIG 141 + SMAW 111)"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Soudeur Qualifié (Nom & N° CQS) *
                </label>
                <input
                  type="text"
                  required
                  value={weldWelderName}
                  onChange={e => setWeldWelderName(e.target.value)}
                  placeholder="Ex: Amar Bouzid (CQS-BV-2026-088)"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contrôle CND Exigé *
                  </label>
                  <select
                    value={weldCndType}
                    onChange={e => setWeldCndType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                  >
                    <option value="100% Ressuage PT + 100% Radio RT">100% Ressuage PT + 100% Radio RT</option>
                    <option value="100% Ressuage (PT)">100% Ressuage (PT)</option>
                    <option value="Contrôle Ultrasons (UT) + Ressuage">Contrôle Ultrasons (UT) + Ressuage</option>
                    <option value="Examen Visuel VT + Épreuve Hydro">Examen Visuel VT + Épreuve Hydro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Organisme d'Inspection / Contrôleur *
                  </label>
                  <input
                    type="text"
                    required
                    value={weldInspector}
                    onChange={e => setWeldInspector(e.target.value)}
                    placeholder="Ex: Bureau Veritas Algérie (COFREND II)"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowWeldModal(false)}
                  className="px-3 py-1.5 border rounded hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-bold rounded hover:bg-[#07164D] shadow-xs cursor-pointer"
                >
                  Consigner au Weld Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
