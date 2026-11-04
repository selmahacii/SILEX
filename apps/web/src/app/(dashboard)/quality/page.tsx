'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDateDZ } from '@silex/shared';
import { FileCheck, AlertTriangle, ShieldCheck, Download, Plus } from 'lucide-react';

export default function QualityPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [nonConformities, setNonConformities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQualityData() {
      try {
        setLoading(true);
        const [docs, ncs] = await Promise.all([
          api.get<any[]>('/quality/documents'),
          api.get<any[]>('/quality/non-conformities'),
        ]);
        setDocuments(docs);
        setNonConformities(ncs);
      } catch (err) {
        console.error('Erreur qualité:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQualityData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[#182433]">Documents & Traçabilité Qualité (ISO 9001 / QHSE)</h1>
        <p className="text-xs text-[#697789] mt-0.5">
          Système documentaire, procédures de soudage (DMOS/QMOS), rapports de contrôles non destructifs et non-conformités.
        </p>
      </div>

      {/* Grid: GED on left, NonConformities on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GED Documentation */}
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#0A7F7C]" />
              Bibliothèque Documentaire Qualité
            </h2>
            <span className="text-[11px] text-slate-500">Classée par catégorie</span>
          </div>

          <div className="divide-y divide-slate-100 p-2">
            {[
              { num: 'PROC-SOU-01', title: 'Procédure Générale de Soudage GTAW/SMAW selon ASME IX', cat: 'PROCEDURE', ver: '2.1' },
              { num: 'DMOS-HP-004', title: 'Descriptif de Mode Opératoire de Soudage Lignes HP 4" PN40', cat: 'DOSSIER_TECHNIQUE', ver: '1.0' },
              { num: 'CND-RAD-02', title: 'Instruction de Contrôle Radiographique 100% Soudures Bout à Bout', cat: 'INSTRUCTION', ver: '3.0' },
              { num: 'PAQ-PRJ-01', title: 'Plan d’Assurance Qualité Chantier Arrêt Raffinerie HMD', cat: 'DOCUMENT_PROJET', ver: '1.2' },
            ].map(doc => (
              <div key={doc.num} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#142B45]">{doc.num}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                      v{doc.ver}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 mt-1">{doc.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Catégorie : {doc.cat}</div>
                </div>
                <button
                  onClick={() => alert(`Téléchargement de la procédure ${doc.num} v${doc.ver}`)}
                  className="p-2 text-slate-500 hover:text-[#0A7F7C] hover:bg-teal-50 rounded"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Non-Conformités & Actions Correctives */}
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Fiches de Non-Conformité & Actions Correctives
            </h2>
          </div>

          <div className="divide-y divide-slate-100 p-2">
            {[
              { num: 'NC-2026-003', title: 'Défaut d’alignement chanfrein tube 4" Ligne HP Bloc 4', sev: 'MINEURE', status: 'ACTION_ENGAGEE' },
              { num: 'NC-2026-002', title: 'Certificat de conformité matière manquant lot brides WNRF', sev: 'MAJEURE', status: 'CLOTUREE' },
            ].map(nc => (
              <div key={nc.num} className="p-3 hover:bg-slate-50 transition-colors space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#142B45]">{nc.num}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    nc.sev === 'MAJEURE' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    Gravité {nc.sev}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{nc.title}</div>
                <div className="text-[11px] text-slate-500">
                  Statut action : <strong className="text-emerald-700">{nc.status}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
