'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDateDZ } from '@silex/shared';
import { Users, Award, Clock, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';

export default function HrPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'employees' | 'certs' | 'attendance' | 'payroll'>('employees');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHrData() {
      try {
        setLoading(true);
        const [emps, certs, atts] = await Promise.all([
          api.get<any[]>('/hr/employees'),
          api.get<any[]>('/hr/certifications'),
          api.get<any[]>('/hr/attendances'),
        ]);
        setEmployees(emps);
        setCertifications(certs);
        setAttendances(atts);
      } catch (err) {
        console.error('Erreur RH:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHrData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#182433]">Ressources Humaines & Habilitations Techniques</h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Suivi des effectifs, qualifications de soudage ASME IX / ISO 9606, pointages et affectations sur site.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('employees')}
          className={`py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'employees' ? 'border-[#0A7F7C] text-[#0A7F7C]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Personnel Qualifié ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('certs')}
          className={`py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'certs' ? 'border-[#0A7F7C] text-[#0A7F7C]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Habilitations & Homologations Soudage
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'payroll' ? 'border-[#0A7F7C] text-[#0A7F7C]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Aperçu Paie Démo (Indicatif)
        </button>
      </div>

      {/* Tab: Employees */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
              Répertoire des Collaborateurs Industriels
            </h2>
            <span className="text-[11px] text-slate-500">{employees.length} collaborateurs actifs</span>
          </div>

          <div className="divide-y divide-slate-100">
            {employees.map(emp => (
              <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#142B45] text-white flex items-center justify-center font-bold text-xs">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {emp.firstName} {emp.lastName}
                      <span className="ml-2 font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {emp.registrationNumber}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-[#0A7F7C]">{emp.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{emp.email} • {emp.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                    {emp.status}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">Contrat : {emp.contractType}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Certifications */}
      {activeTab === 'certs' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
              Certificats de Qualification des Soudeurs (CQS) & Normes Pétrolières
            </h2>
            <p className="text-[11px] text-slate-500">Traçabilité des homologations délivrées par organismes notifiés (Bureau Veritas / CND)</p>
          </div>

          <div className="space-y-3">
            {certifications.map(c => (
              <div key={c.id} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#0A7F7C]" />
                    <span className="text-xs font-bold text-slate-900">{c.certName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      {c.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1">
                    Titulaire : <strong>{c.employee?.firstName} {c.employee?.lastName}</strong> ({c.employee?.title})
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Délivré par : {c.issuingBody} • Échéance : <strong>{formatDateDZ(c.expiryDate)}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                    Conforme chantier
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Payroll Demo */}
      {activeTab === 'payroll' && (
        <div className="bg-white p-6 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Avertissement Prototype de Démonstration :</strong> Cet aperçu présente une simulation opérationnelle d’indemnités et primes de grand déplacement chantier. Il ne constitue en aucun cas une paie réglementaire certifiée conforme aux barèmes fiscaux et sociaux algériens.
            </div>
          </div>

          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Matricule</th>
                  <th className="py-2.5 px-3">Collaborateur</th>
                  <th className="py-2.5 px-3">Fonction</th>
                  <th className="py-2.5 px-3 text-right">Heures Normales</th>
                  <th className="py-2.5 px-3 text-right">Heures Sup.</th>
                  <th className="py-2.5 px-3 text-right">Panier / Déplacement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.slice(0, 8).map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{emp.registrationNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{emp.firstName} {emp.lastName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{emp.title}</td>
                    <td className="py-2.5 px-3 text-right font-medium">176 h</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">24 h</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#0A7F7C]">35 000 DA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
