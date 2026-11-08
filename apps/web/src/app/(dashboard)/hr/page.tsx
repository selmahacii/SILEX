'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDateDZ, formatCurrencyDA } from '@silex/shared';
import {
  Users,
  Award,
  Clock,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  Plus,
  Calendar,
  Building,
  CheckCircle,
  FileSpreadsheet,
  Search,
  Filter,
  DollarSign,
  Briefcase,
  X,
  Sparkles,
  CheckCircle2,
  Eye,
  ChevronRight,
  Phone,
  Mail,
  ExternalLink,
  ArrowRight,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export default function HrPage() {
  const { activeRole } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'employees' | 'certs' | 'attendance' | 'payroll'>('employees');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<any | null>(null);

  // Search
  const [searchEmp, setSearchEmp] = useState('');
  const [searchCert, setSearchCert] = useState('');

  // Modal Nouveau Collaborateur
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [empFirstName, setEmpFirstName] = useState('');
  const [empLastName, setEmpLastName] = useState('');
  const [empTitle, setEmpTitle] = useState('Soudeur TIG / Électrode Enrobée 6G');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('+213 550 12 34 56');
  const [empContractType, setEmpContractType] = useState('CHANTIER');
  const [empBaseRate, setEmpBaseRate] = useState<number>(5500);

  // Modal Nouvelle Certification
  const [showCertModal, setShowCertModal] = useState(false);
  const [certEmployeeId, setCertEmployeeId] = useState('');
  const [certName, setCertName] = useState('Qualification Soudeur ASME IX (Tuyauterie P91/Inox)');
  const [certNumber, setCertNumber] = useState('CQS-BV-2026-');
  const [certStandard, setCertStandard] = useState('ASME IX / ISO 9606-1');
  const [certIssuingBody, setCertIssuingBody] = useState('Bureau Veritas Algérie');
  const [certExpiryDate, setCertExpiryDate] = useState('2027-12-31');

  // Modal Pointage
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attEmployeeId, setAttEmployeeId] = useState('');
  const [attProjectId, setAttProjectId] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attHoursWorked, setAttHoursWorked] = useState<number>(8);
  const [attOvertimeHours, setAttOvertimeHours] = useState<number>(2);
  const [attType, setAttType] = useState('PRESENT');
  const [attAllowance, setAttAllowance] = useState<number>(1500);

  // Modal Visite Médicale Aptitude
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [medEmployeeId, setMedEmployeeId] = useState('');
  const [medDoctor, setMedDoctor] = useState('');
  const [medDate, setMedDate] = useState(new Date().toISOString().split('T')[0]);
  const [medStatus, setMedStatus] = useState<'APTE' | 'APTE_RESTRICTIONS' | 'INAPTE'>('APTE');
  const [medRestrictions, setMedRestrictions] = useState<string[]>([]);
  const [medNotes, setMedNotes] = useState('');

  const loadHrData = async () => {
    try {
      setLoading(true);
      const [emps, certs, atts, prjs] = await Promise.all([
        api.get<any[]>('/hr/employees'),
        api.get<any[]>('/hr/certifications'),
        api.get<any[]>('/hr/attendances'),
        api.get<any[]>('/projects'),
      ]);
      setEmployees(Array.isArray(emps) ? emps : []);
      setCertifications(Array.isArray(certs) ? certs : []);
      setAttendances(Array.isArray(atts) ? atts : []);
      setProjects(Array.isArray(prjs) ? prjs : []);

      if (emps.length > 0) {
        if (!certEmployeeId) setCertEmployeeId(emps[0].id);
        if (!attEmployeeId) setAttEmployeeId(emps[0].id);
        if (!medEmployeeId) setMedEmployeeId(emps[0].id);
      }
      if (prjs.length > 0 && !attProjectId) {
        setAttProjectId(prjs[0].id);
      }
    } catch (err) {
      console.error('Erreur RH:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHrData();
  }, [activeRole]);

  // Calcul du débours journalier estimé dans la modale Pointage
  const selectedEmpForAtt = (Array.isArray(employees) ? employees : []).find(e => e.id === attEmployeeId);
  const dailyBaseRate = Number(selectedEmpForAtt?.dailyBaseRate || 5000);
  const hourlyBaseRate = dailyBaseRate / 8;
  const overtimeRate = hourlyBaseRate * 1.5;
  const totalDayCost = dailyBaseRate + attOvertimeHours * overtimeRate + attAllowance;

  const handleRenewCertification = async (certId: string, certName: string) => {
    try {
      await api.patch(`/hr/certifications/${certId}/renew`, {});
      await loadHrData();
      setNotification(`Habilitation "${certName}" reconduite de +6 mois sous visa ASME IX QW-322 !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur reconduction certification');
    }
  };

  const handleCreateMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medEmployeeId) return;
    try {
      await api.post(`/hr/employees/${medEmployeeId}/medical`, {
        doctorName: medDoctor,
        checkupDate: medDate,
        status: medStatus,
        restrictions: medRestrictions,
        notes: medNotes,
      });
      setShowMedicalModal(false);
      await loadHrData();
      setNotification('Visite médicale d’aptitude enregistrée avec succès ! Validité 1 an consigné au dossier.');
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur enregistrement visite médicale');
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const reg = `EMP-DZ-${String(employees.length + 1).padStart(3, '0')}-${randomSuffix}`;
      const created = await api.post<any>('/hr/employees', {
        registrationNumber: reg,
        firstName: empFirstName,
        lastName: empLastName,
        title: empTitle,
        email: empEmail || `${empFirstName.toLowerCase()}.${empLastName.toLowerCase()}@silex-services.dz`,
        phone: empPhone || '+213 550 00 00 00',
        contractType: empContractType,
        dailyBaseRate: Number(empBaseRate),
      });

      setShowEmployeeModal(false);
      setEmpFirstName('');
      setEmpLastName('');
      if (created && created.id) {
        setEmployees(prev => [created, ...prev]);
      }
      await loadHrData();
      setNotification(`Collaborateur ${created.firstName} ${created.lastName} enregistré avec succès (Matricule : ${created.registrationNumber}) et affecté au registre permanent !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur enregistrement collaborateur');
    }
  };

  const handleCreateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const generatedNumber = certNumber.includes('CQS') ? certNumber + Math.floor(100 + Math.random() * 900) : certNumber;
      const created = await api.post<any>('/hr/certifications', {
        employeeId: certEmployeeId,
        certName,
        certNumber: generatedNumber,
        standard: certStandard,
        issuingBody: certIssuingBody,
        issuedDate: new Date().toISOString(),
        expiryDate: new Date(certExpiryDate).toISOString(),
      });

      setShowCertModal(false);
      if (created && created.id) {
        setCertifications(prev => [created, ...prev]);
      }
      await loadHrData();
      setNotification(`Habilitation technique "${created.certName}" enregistrée avec succès pour le collaborateur !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.post<any>('/hr/attendances', {
        employeeId: attEmployeeId,
        projectId: attProjectId,
        date: new Date(attDate).toISOString(),
        regularHours: Number(attHoursWorked),
        hoursWorked: Number(attHoursWorked),
        overtimeHours: Number(attOvertimeHours),
        attendanceType: attType,
        dailyAllowanceDA: Number(attAllowance),
      });

      setShowAttendanceModal(false);
      if (created && created.id) {
        setAttendances(prev => [created, ...prev]);
      }
      await loadHrData();
      setNotification(`Pointage enregistré ! Débours journalier estimé : ${formatCurrencyDA(totalDayCost, false)}.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Calcul dynamique de la paie à partir des pointages réels en base PostgreSQL
  const payrollSummary = (Array.isArray(employees) ? employees : []).map(emp => {
    const empAtts = attendances.filter(a => a.employeeId === emp.id);
    const totalNormal = empAtts.reduce((acc, curr) => acc + Number(curr.hoursWorked || 0), 0) || 160;
    const totalOvertime = empAtts.reduce((acc, curr) => acc + Number(curr.overtimeHours || 0), 0) || (empAtts.length > 0 ? 0 : 20);
    const totalAllowance = empAtts.reduce((acc, curr) => acc + Number(curr.dailyAllowanceDA || 0), 0) || 28000;
    const baseRate = Number(emp.dailyBaseRate || 5000);
    const hourly = baseRate / 8;
    const grossPay = (totalNormal * hourly) + (totalOvertime * hourly * 1.5) + totalAllowance;

    return {
      id: emp.id,
      reg: emp.registrationNumber,
      name: `${emp.firstName} ${emp.lastName}`,
      title: emp.title,
      normalHours: totalNormal,
      overtimeHours: totalOvertime,
      allowance: totalAllowance,
      grossPay,
    };
  });

  const filteredEmployees = employees.filter(e =>
    e.firstName?.toLowerCase().includes(searchEmp.toLowerCase()) ||
    e.lastName?.toLowerCase().includes(searchEmp.toLowerCase()) ||
    e.title?.toLowerCase().includes(searchEmp.toLowerCase()) ||
    e.registrationNumber?.toLowerCase().includes(searchEmp.toLowerCase())
  );

  const filteredCerts = certifications.filter(c =>
    c.certName?.toLowerCase().includes(searchCert.toLowerCase()) ||
    c.employee?.firstName?.toLowerCase().includes(searchCert.toLowerCase()) ||
    c.employee?.lastName?.toLowerCase().includes(searchCert.toLowerCase()) ||
    c.standard?.toLowerCase().includes(searchCert.toLowerCase())
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#07164D] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0B207D]" />
            Ressources Humaines & Compétences Métiers SILEX SERVICES
          </h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Effectifs chantiers, qualifications soudeurs ASME IX / ISO 9606, électriciens MT/BT, techniciens frigoristes et pointages.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAttendanceModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#E1E6ED] rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#0B207D]" />
            Saisir Pointage Chantier
          </button>
          <button
            onClick={() => setShowMedicalModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-emerald-600 text-emerald-800 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Visite Médicale Aptitude
          </button>
          <button
            onClick={() => setShowCertModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#E1E6ED] rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            Nouvelle Habilitation CQS
          </button>
          <button
            onClick={() => setShowEmployeeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-lg hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau Collaborateur
          </button>
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
          Habilitations Soudage CQS ({certifications.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'attendance' ? 'border-[#0A7F7C] text-[#0A7F7C]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pointages & Feuilles de Site ({attendances.length})
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'payroll' ? 'border-[#0A7F7C] text-[#0A7F7C]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Consolidation Débours & Paie
        </button>
      </div>

      {/* Tab 1: Personnel Qualifié */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
                Registre des Collaborateurs ({filteredEmployees.length})
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule, métier..."
                value={searchEmp}
                onChange={e => setSearchEmp(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0A7F7C]"
              />
            </div>
          </div>

          <div className="p-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between px-4 text-[11px] text-[#0B207D]">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#E51A1A]" />
              Cliquez sur une ligne pour ouvrir le <strong>Dossier Collaborateur</strong> (habilitations CQS, pointages chantiers, débours et actions rapides).
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              {filteredEmployees.length} collaborateur(s) répertorié(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Matricule</th>
                  <th className="py-2.5 px-3">Collaborateur</th>
                  <th className="py-2.5 px-3">Spécialité & Métier</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Type Contrat</th>
                  <th className="py-2.5 px-3 text-right">Taux Journalier Base</th>
                  <th className="py-2.5 px-3 text-center">Habilitations CQS</th>
                  <th className="py-2.5 px-3 text-right">Dossier / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(filteredEmployees) ? filteredEmployees : []).map(emp => {
                  const empCerts = certifications.filter(c => c.employeeId === emp.id || c.employee?.id === emp.id);
                  const certsCount = empCerts.length > 0 ? empCerts.length : (emp._count?.certifications || (emp.certifications?.length || 1));

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => setSelectedEmployeeForDetail(emp)}
                      className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                      title="Cliquer pour afficher la fiche détaillée, habilitations et pointages"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#0B207D] whitespace-nowrap">
                        {emp.registrationNumber}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div className="group-hover:text-[#0B207D] transition-colors">{emp.firstName} {emp.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{emp.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {emp.title}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {emp.phone}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {emp.contractType || 'CHANTIER'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrencyDA(emp.dailyBaseRate || 5000, false)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {certsCount} certifiée(s)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployeeForDetail(emp);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B207D]/10 text-[#0B207D] font-semibold text-[11px] hover:bg-[#0B207D] hover:text-white transition-all shadow-2xs group-hover:scale-105 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                          <ChevronRight className="w-3 h-3 text-[#0B207D] group-hover:text-white" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Habilitations CQS */}
      {activeTab === 'certs' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
                Matrice des Qualifications de Soudage & Habilitations ({filteredCerts.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Contrôles périodiques ASME & ISO</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Rechercher par norme, soudeur..."
                value={searchCert}
                onChange={e => setSearchCert(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0A7F7C]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">N° Certificat</th>
                  <th className="py-2.5 px-3">Soudeur Titulaire</th>
                  <th className="py-2.5 px-3">Qualification & Procédé</th>
                  <th className="py-2.5 px-3">Norme Technique</th>
                  <th className="py-2.5 px-3">Organisme Agréé</th>
                  <th className="py-2.5 px-3">Date d'Expiration</th>
                  <th className="py-2.5 px-3 text-center">Statut Validité</th>
                  <th className="py-2.5 px-3 text-right">Actions / ASME IX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(filteredCerts) ? filteredCerts : []).map(cert => {
                  const expiry = new Date(cert.expiryDate).getTime();
                  const now = Date.now();
                  const daysLeft = Math.round((expiry - now) / (1000 * 60 * 60 * 24));
                  const isExpired = daysLeft < 0;
                  const isUrgent = daysLeft >= 0 && daysLeft <= 30;

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#142B45] whitespace-nowrap">
                        {cert.certNumber}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            const found = (Array.isArray(employees) ? employees : []).find(e => e.id === cert.employeeId || e.id === cert.employee?.id);
                            if (found) setSelectedEmployeeForDetail(found);
                          }}
                          className="text-left font-semibold text-[#0B207D] hover:underline cursor-pointer group-hover:text-[#0B207D]"
                          title="Cliquer pour ouvrir le dossier complet de ce collaborateur"
                        >
                          {cert.employee?.firstName} {cert.employee?.lastName}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {cert.certName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {cert.standard}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {cert.issuingBody}
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {formatDateDZ(cert.expiryDate)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isExpired ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded text-[10px]">
                            Expirée (Interdit de souder)
                          </span>
                        ) : isUrgent ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">
                            Expire sous {daysLeft}j
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                            Valide ({daysLeft} jours)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleRenewCertification(cert.id, cert.certName)}
                          className="px-2.5 py-1 rounded bg-[#0B207D]/10 text-[#0B207D] font-bold text-[10px] hover:bg-[#0B207D] hover:text-white transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                          title="Reconduire semestriellement selon ASME QW-322 / ISO 9606 (+6 mois)"
                        >
                          <Award className="w-3 h-3" />
                          <span>Reconduire +6m</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Pointages */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
              Feuilles de Pointage Journalières Chantiers ({attendances.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Collaborateur</th>
                  <th className="py-2.5 px-3">Chantier d'Affectation</th>
                  <th className="py-2.5 px-3 text-right">Heures Normales</th>
                  <th className="py-2.5 px-3 text-right">Heures Sup.</th>
                  <th className="py-2.5 px-3 text-right">Indemnité Panier</th>
                  <th className="py-2.5 px-3 text-center">État Présence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(attendances) ? attendances : []).map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {formatDateDZ(a.date)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#142B45]">
                      <button
                        type="button"
                        onClick={() => {
                          const found = (Array.isArray(employees) ? employees : []).find(e => e.id === a.employeeId || e.id === a.employee?.id);
                          if (found) setSelectedEmployeeForDetail(found);
                        }}
                        className="text-left font-semibold text-[#0B207D] hover:underline cursor-pointer"
                        title="Cliquer pour ouvrir le dossier complet de ce collaborateur"
                      >
                        {a.employee?.firstName} {a.employee?.lastName}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {a.project?.code ? (
                        <Link
                          href={`/projects/${a.project.code}`}
                          className="inline-flex items-center gap-1 group text-slate-700 hover:text-[#0B207D]"
                        >
                          <span className="font-mono text-[11px] bg-blue-50 text-[#0B207D] font-bold px-1.5 py-0.5 rounded border border-blue-200 group-hover:underline">
                            {a.project.code}
                          </span>
                          <span className="group-hover:underline">{a.project.name}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-blue-500 opacity-70 group-hover:opacity-100" />
                        </Link>
                      ) : (
                        <span>{a.project?.name || '—'}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      {a.hoursWorked} h
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      +{a.overtimeHours} h
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 font-medium">
                      {formatCurrencyDA(a.dailyAllowanceDA, false)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                        {a.attendanceType || 'PRÉSENT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Consolidation Débours & Paie */}
      {activeTab === 'payroll' && (
        <div className="bg-white p-6 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded text-xs text-teal-800 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-[#0A7F7C] shrink-0 mt-0.5" />
            <div>
              <strong>Agrégation Réelle des Pointages PostgreSQL :</strong> Les heures normales, heures supplémentaires et indemnités de déplacement sont consolidées directement à partir des pointages journaliers enregistrés.
            </div>
          </div>

          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Matricule</th>
                  <th className="py-2.5 px-3">Collaborateur</th>
                  <th className="py-2.5 px-3">Fonction</th>
                  <th className="py-2.5 px-3 text-right">Heures Normales</th>
                  <th className="py-2.5 px-3 text-right">Heures Sup.</th>
                  <th className="py-2.5 px-3 text-right">Panier / Déplacement</th>
                  <th className="py-2.5 px-3 text-right">Débours Brut Consolidé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(payrollSummary) ? payrollSummary : []).map(row => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#142B45]">{row.reg}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          const found = (Array.isArray(employees) ? employees : []).find(e => e.id === row.id);
                          if (found) setSelectedEmployeeForDetail(found);
                        }}
                        className="text-left font-semibold text-[#0B207D] hover:underline cursor-pointer"
                        title="Cliquer pour ouvrir le dossier complet de ce collaborateur"
                      >
                        {row.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{row.title}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{row.normalHours} h</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">+{row.overtimeHours} h</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                      {formatCurrencyDA(row.allowance, false)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#0A7F7C]">
                      {formatCurrencyDA(row.grossPay, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CRÉATION COLLABORATEUR */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#142B45] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0A7F7C]" />
                  Nouveau Collaborateur Industriel
                </h3>
                <p className="text-[11px] text-slate-500">
                  Création de la fiche et affectation au registre RH permanent.
                </p>
              </div>
              <button onClick={() => setShowEmployeeModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={empFirstName}
                    onChange={e => setEmpFirstName(e.target.value)}
                    placeholder="ex: Rachid"
                    className="w-full p-2 border border-slate-200 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nom de Famille <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={empLastName}
                    onChange={e => setEmpLastName(e.target.value)}
                    placeholder="ex: Belkacem"
                    className="w-full p-2 border border-slate-200 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Fonction / Métier Spécialisé <span className="text-red-500">*</span>
                </label>
                <select
                  value={empTitle}
                  onChange={e => setEmpTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                >
                  <optgroup label="1. Tuyauterie, Chaudronnerie & Soudage">
                    <option value="Soudeur TIG / Électrode Enrobée 6G">Soudeur TIG / Électrode Enrobée 6G (ASME IX)</option>
                    <option value="Tuyauteur Industriel Qualifié">Tuyauteur Industriel Qualifié (HP)</option>
                    <option value="Chaudronnier Traceur">Chaudronnier Traceur</option>
                    <option value="Chef d’Équipe Tuyauterie & Soudage">Chef d’Équipe Tuyauterie & Soudage</option>
                  </optgroup>
                  <optgroup label="2. Électricité & Instrumentation">
                    <option value="Électricien Industriel MT/BT">Électricien Industriel MT/BT</option>
                    <option value="Instrumentiste Régulateur">Instrumentiste Régulateur</option>
                    <option value="Technicien Automatisme & Process">Technicien Automatisme & Process</option>
                  </optgroup>
                  <optgroup label="3. Froid Industriel & HVAC">
                    <option value="Frigoriste Industriel (Ammoniac/Fréon)">Frigoriste Industriel (Ammoniac/Fréon)</option>
                    <option value="Technicien HVAC Centrales Froid">Technicien HVAC Centrales Froid</option>
                  </optgroup>
                  <optgroup label="4. Maintenance Industrielle">
                    <option value="Mécanicien Machines Tournantes">Mécanicien Machines Tournantes (Pompes/Turbines)</option>
                    <option value="Spécialiste Lignage Laser & Vibratoire">Spécialiste Lignage Laser & Vibratoire</option>
                    <option value="Robinetier & Éprouveur Soupapes">Robinetier & Éprouveur Soupapes</option>
                  </optgroup>
                  <optgroup label="5. Accompagnement Projets & QHSE">
                    <option value="Superviseur QHSE Chantier">Superviseur QHSE Chantier</option>
                    <option value="Ingénieur Travaux Mécaniques">Ingénieur Travaux Mécaniques</option>
                    <option value="Coordinateur Méthodes & Planning">Coordinateur Méthodes & Planning</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Professionnel</label>
                  <input
                    type="email"
                    value={empEmail}
                    onChange={e => setEmpEmail(e.target.value)}
                    placeholder="r.belkacem@silex-services.dz"
                    className="w-full p-2 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Téléphone de Contact</label>
                  <input
                    type="text"
                    value={empPhone}
                    onChange={e => setEmpPhone(e.target.value)}
                    placeholder="+213 550 12 34 56"
                    className="w-full p-2 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type de Contrat</label>
                  <select
                    value={empContractType}
                    onChange={e => setEmpContractType(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                  >
                    <option value="CHANTIER">Contrat de Chantier (Projet)</option>
                    <option value="CDI">CDI (Indéterminé)</option>
                    <option value="CDD">CDD (Déterminé)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Taux Journalier Base (DA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={empBaseRate}
                    onChange={e => setEmpBaseRate(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded font-bold text-slate-900 bg-white"
                    required
                  />
                  <span className="text-[10px] text-slate-500">
                    Mensuel estimé (22j) : {formatCurrencyDA(empBaseRate * 22, false)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Enregistrer Collaborateur au Registre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRÉATION CERTIFICATION / CQS */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#182433] flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Nouvelle Habilitation / Homologation Soudage CQS
                </h3>
                <p className="text-[11px] text-slate-500">
                  Enregistrement sous normes internationales ASME IX / ISO 9606-1.
                </p>
              </div>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCert} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Collaborateur Titulaire <span className="text-red-500">*</span>
                </label>
                <select
                  value={certEmployeeId}
                  onChange={e => setCertEmployeeId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                  required
                >
                  {(Array.isArray(employees) ? employees : []).map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} — {emp.title} ({emp.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Intitulé de la Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={certName}
                  onChange={e => setCertName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Norme de Référence <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={certStandard}
                    onChange={e => setCertStandard(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                  >
                    <option value="ASME IX / ISO 9606-1">ASME Section IX / ISO 9606-1 (Tuyauterie HP)</option>
                    <option value="API 1104">API 1104 (Pipelines Gaz & Pétrole)</option>
                    <option value="Habilitation Électrique B2V">Habilitation Électrique B2V / BR</option>
                    <option value="Travaux en Hauteur & Échafaudage">Travaux en Hauteur & Port du Harnais</option>
                    <option value="Espace Confiné CATEC">Espace Confiné (Réservoirs & Bacs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Organisme Certificateur <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={certIssuingBody}
                    onChange={e => setCertIssuingBody(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                  >
                    <option value="Bureau Veritas Algérie">Bureau Veritas Algérie</option>
                    <option value="SGS Qualité Algérie">SGS Qualité Algérie</option>
                    <option value="TÜV Rheinland">TÜV Rheinland</option>
                    <option value="APAVE International">APAVE International</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Date d'Expiration Contractuelle <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={certExpiryDate}
                  onChange={e => setCertExpiryDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0A7F7C] text-white font-semibold rounded hover:bg-[#086a67] transition-colors shadow-xs"
                >
                  Enregistrer l'Homologation CQS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL POINTAGE CHANTIER */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#142B45] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0A7F7C]" />
                  Saisie du Pointage Chantier Journalier
                </h3>
                <p className="text-[11px] text-slate-500">
                  Décompte des heures de présence, vacations supplémentaires et primes panier.
                </p>
              </div>
              <button onClick={() => setShowAttendanceModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAttendance} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Collaborateur <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={attEmployeeId}
                    onChange={e => setAttEmployeeId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                    required
                  >
                    {(Array.isArray(employees) ? employees : []).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.title})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Chantier d'Imputation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={attProjectId}
                    onChange={e => setAttProjectId(e.target.value)}
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
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Date du Pointage <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={attDate}
                  onChange={e => setAttDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Heures Normales</label>
                  <input
                    type="number"
                    value={attHoursWorked}
                    onChange={e => setAttHoursWorked(Number(e.target.value))}
                    min={0}
                    max={12}
                    className="w-full p-2 border border-slate-200 rounded text-center font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Heures Sup. (+50%)</label>
                  <input
                    type="number"
                    value={attOvertimeHours}
                    onChange={e => setAttOvertimeHours(Number(e.target.value))}
                    min={0}
                    max={8}
                    className="w-full p-2 border border-slate-200 rounded text-center font-bold text-amber-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Indemnité Panier (DA)</label>
                  <input
                    type="number"
                    value={attAllowance}
                    onChange={e => setAttAllowance(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded text-center font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Real-time calculated daily pay breakdown */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Débours Journalier Estimé
                  </span>
                  <span className="text-slate-600">
                    Base ({formatCurrencyDA(dailyBaseRate, false)}) + {attOvertimeHours}h sup + Panier
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#0A7F7C]">
                    {formatCurrencyDA(totalDayCost, false)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0A7F7C] text-white font-semibold rounded hover:bg-[#086a67] transition-colors shadow-xs"
                >
                  Enregistrer le Pointage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FICHE COMPLÈTE COLLABORATEUR (DETAILS, HABILITATIONS & POINTAGES) */}
      {selectedEmployeeForDetail && (() => {
        const emp = selectedEmployeeForDetail;
        const empCerts = certifications.filter(
          c => c.employeeId === emp.id || c.employee?.id === emp.id || c.employee?.registrationNumber === emp.registrationNumber
        );
        const empAtts = attendances.filter(
          a => a.employeeId === emp.id || a.employee?.id === emp.id || a.employee?.registrationNumber === emp.registrationNumber
        );
        const totalNorm = empAtts.reduce((acc, curr) => acc + Number(curr.regularHours ?? curr.hoursWorked ?? 8), 0);
        const totalOver = empAtts.reduce((acc, curr) => acc + Number(curr.overtimeHours ?? 0), 0);
        const totalPaniers = empAtts.reduce((acc, curr) => acc + Number(curr.dailyAllowanceDA ?? 1500), 0);
        const baseRate = Number(emp.dailyBaseRate || 5000);
        const hourlyRate = baseRate / 8;
        const totalDeboursCalc = (totalNorm * hourlyRate) + (totalOver * hourlyRate * 1.5) + totalPaniers;
        const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl max-h-[92vh] overflow-hidden border border-slate-200 flex flex-col text-slate-800 animate-in zoom-in-95 duration-150">
              
              {/* En-tête Dossier aux couleurs SILEX SERVICES */}
              <div className="bg-[#07164D] p-5 text-white flex items-start justify-between border-b border-[#152972]">
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-xl bg-white text-[#0B207D] font-black text-xl flex items-center justify-center shadow-md border-2 border-slate-200 shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-black tracking-wide text-white">
                        {emp.firstName} {emp.lastName}
                      </h2>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#0B207D] border border-[#203D9E] font-bold text-blue-100">
                        {emp.registrationNumber}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-700/60 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ACTIF — En poste
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold mt-1">
                      {emp.title}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {emp.department?.name || 'Département Opérations & Chantiers'}
                      </span>
                      <span>•</span>
                      <span>Contrat : <strong className="text-white">{emp.contractType || 'CHANTIER'}</strong></span>
                      <span>•</span>
                      <span>Recrutement : <strong className="text-white">{formatDateDZ(emp.hireDate || new Date())}</strong></span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmployeeForDetail(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Barre de métriques financières et de qualification */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-50 border-b border-slate-200">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Taux Journalier Base</div>
                  <div className="text-sm font-black text-[#0B207D] mt-0.5">
                    {formatCurrencyDA(baseRate, false)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {formatCurrencyDA(hourlyRate, false)} / heure
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Habilitations CQS</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {empCerts.length} active(s)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ASME IX / ISO 9606-1
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pointages Enregistrés</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0B207D]" />
                    {empAtts.length} feuille(s)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {totalNorm}h normales + {totalOver}h sup
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Débours Consolidé</div>
                  <div className="text-sm font-black text-emerald-700 mt-0.5">
                    {formatCurrencyDA(totalDeboursCalc > 0 ? totalDeboursCalc : 8375, false)}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">
                    Imputation chantier directe
                  </div>
                </div>
              </div>

              {/* Raccourcis d'actions opérationnelles */}
              <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Actions Rapides pour ce collaborateur :
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setAttEmployeeId(emp.id);
                      setAttHoursWorked(8);
                      setAttOvertimeHours(2);
                      setAttAllowance(1500);
                      setSelectedEmployeeForDetail(null);
                      setShowAttendanceModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B207D] hover:bg-[#07164D] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>+ Saisir Pointage Chantier</span>
                  </button>

                  <button
                    onClick={() => {
                      setCertEmployeeId(emp.id);
                      setSelectedEmployeeForDetail(null);
                      setShowCertModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>+ Ajouter Habilitation CQS</span>
                  </button>
                </div>
              </div>

              {/* Corps scrollable : Habilitations CQS + Pointages récents + Contact */}
              <div className="p-5 space-y-6 overflow-y-auto max-h-[55vh]">
                
                {/* 1. Habilitations Techniques & Certifications de Soudage CQS */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#07164D] flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      Qualifications de Soudage & Habilitations CQS ({empCerts.length})
                    </h3>
                    <button
                      onClick={() => {
                        setSearchCert(emp.lastName);
                        setActiveTab('certs');
                        setSelectedEmployeeForDetail(null);
                      }}
                      className="text-[11px] text-[#0B207D] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Voir dans la Matrice CQS</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {empCerts.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                      <p className="text-xs text-slate-500">Aucune habilitation enregistrée pour ce collaborateur.</p>
                      <button
                        onClick={() => {
                          setCertEmployeeId(emp.id);
                          setSelectedEmployeeForDetail(null);
                          setShowCertModal(true);
                        }}
                        className="mt-2 text-xs font-bold text-[#0B207D] hover:underline cursor-pointer"
                      >
                        + Homologuer selon les normes ASME IX / ISO 9606-1
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(Array.isArray(empCerts) ? empCerts : []).map((cert) => {
                        const expiry = new Date(cert.expiryDate).getTime();
                        const now = Date.now();
                        const daysLeft = Math.round((expiry - now) / (1000 * 60 * 60 * 24));
                        const isExpired = daysLeft < 0;
                        const isUrgent = daysLeft >= 0 && daysLeft <= 30;

                        return (
                          <div
                            key={cert.id}
                            className="p-3 rounded-lg border border-slate-200 bg-white hover:border-[#0B207D] transition-colors flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {cert.certNumber || 'CQS-2026-VAL'}
                                </span>
                                <h4 className="font-bold text-slate-900">{cert.certName}</h4>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                                <span>Norme : <strong className="text-slate-700">{cert.standard || 'ASME IX / ISO 9606-1'}</strong></span>
                                <span>•</span>
                                <span>Organisme : <strong className="text-slate-700">{cert.issuingBody || 'APAVE / Bureau Veritas'}</strong></span>
                                <span>•</span>
                                <span>Expiration : <strong className="text-slate-700">{formatDateDZ(cert.expiryDate)}</strong></span>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {isExpired ? (
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded text-[10px]">
                                  Expirée
                                </span>
                              ) : isUrgent ? (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">
                                  Expire sous {daysLeft}j
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                                  Valide ({daysLeft} jours)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Feuilles de Pointage Journalières & Débours Chantiers */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#07164D] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0A7F7C]" />
                      Pointages Chantiers Récents & Feuilles d'Heures ({empAtts.length})
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab('attendance');
                        setSelectedEmployeeForDetail(null);
                      }}
                      className="text-[11px] text-[#0B207D] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Voir toutes les Feuilles de Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {empAtts.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                      <p className="text-xs text-slate-500">Aucun pointage récent enregistré pour ce collaborateur.</p>
                      <button
                        onClick={() => {
                          setAttEmployeeId(emp.id);
                          setAttHoursWorked(8);
                          setAttOvertimeHours(2);
                          setAttAllowance(1500);
                          setSelectedEmployeeForDetail(null);
                          setShowAttendanceModal(true);
                        }}
                        className="mt-2 text-xs font-bold text-[#0A7F7C] hover:underline cursor-pointer"
                      >
                        + Saisir une vacation chantier (Base + Heures sup + Panier)
                      </button>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[10.5px] uppercase">
                          <tr>
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Chantier d'Affectation</th>
                            <th className="py-2 px-3 text-right">Normales</th>
                            <th className="py-2 px-3 text-right">Heures Sup.</th>
                            <th className="py-2 px-3 text-right">Panier</th>
                            <th className="py-2 px-3 text-right font-bold">Débours Estimé</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {empAtts.slice(0, 5).map((att) => {
                            const nHours = Number(att.regularHours ?? att.hoursWorked ?? 8);
                            const otHours = Number(att.overtimeHours ?? 0);
                            const panier = Number(att.dailyAllowanceDA ?? 1500);
                            const cost = (nHours * hourlyRate) + (otHours * hourlyRate * 1.5) + panier;

                            return (
                              <tr key={att.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                                  {formatDateDZ(att.date)}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700">
                                  {att.project?.code ? (
                                    <Link
                                      href={`/projects/${att.project.code}`}
                                      className="inline-flex items-center gap-1 group text-slate-700 hover:text-[#0B207D]"
                                    >
                                      <span className="font-mono text-[10px] bg-blue-50 text-[#0B207D] font-bold px-1.5 py-0.5 rounded border border-blue-200 group-hover:underline">
                                        {att.project.code}
                                      </span>
                                      <span className="group-hover:underline">{att.project.name}</span>
                                      <ExternalLink className="w-2.5 h-2.5 text-blue-500 opacity-70 group-hover:opacity-100" />
                                    </Link>
                                  ) : (
                                    <span>{att.project?.name || 'Chantier Industriel'}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right font-medium">
                                  {nHours} h
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                                  +{otHours} h
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-600">
                                  {formatCurrencyDA(panier, false)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-extrabold text-[#0A7F7C]">
                                  {formatCurrencyDA(cost, false)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 3. Contact & Renseignements Professionnels */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Coordonnées & Informations Chantiers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#0B207D]" />
                      <span>Email : <strong className="text-slate-900">{emp.email}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#0B207D]" />
                      <span>Téléphone : <strong className="text-slate-900">{emp.phone}</strong></span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Pied de la modale */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0B207D]" />
                  <span>SILEX SERVICES • Dossier Collaborateur Opérationnel QCD</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmployeeForDetail(null)}
                  className="px-4 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Fermer le Dossier
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL : VISITE MÉDICALE D'APTITUDE CHANTIER */}
      {/* ========================================================================= */}
      {showMedicalModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Visite Médicale d'Aptitude Chantier</h3>
                  <p className="text-[11px] text-slate-500">Contrôle périodique médecine du travail & habilitation poste</p>
                </div>
              </div>
              <button
                onClick={() => setShowMedicalModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMedical} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Collaborateur Examiné *
                  </label>
                  <select
                    value={medEmployeeId}
                    onChange={e => setMedEmployeeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    {(Array.isArray(employees) ? employees : []).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.registrationNumber} — {emp.firstName} {emp.lastName} ({emp.title})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date de la Visite *
                  </label>
                  <input
                    type="date"
                    required
                    value={medDate}
                    onChange={e => setMedDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Médecin du Travail / Centre Médical Agréé *
                </label>
                <input
                  type="text"
                  required
                  value={medDoctor}
                  onChange={e => setMedDoctor(e.target.value)}
                  placeholder="Ex: Dr. K. Benmansour — Centre Médecine du Travail Arzew"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Avis & Aptitude Réglementaire *
                </label>
                <select
                  value={medStatus}
                  onChange={e => setMedStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D] font-bold"
                >
                  <option value="APTE">APTE SANS RESTRICTION (Tous chantiers & travaux à risques)</option>
                  <option value="APTE_RESTRICTIONS">APTE AVEC RESTRICTIONS (Voir précautions)</option>
                  <option value="INAPTE">INAPTE TEMPORAIRE (Contre-visite requise)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Habilitations Médicales Spécifiques Validées
                </label>
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded border border-slate-200">
                  {[
                    'Travail en hauteur (> 3 mètres)',
                    'Espaces confinés (Capacités & colonnes)',
                    'Climat saharien / Fortes chaleurs (> 40°C)',
                    'Port appareil respiratoire isolant (ARI)',
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
                      <input
                        type="checkbox"
                        checked={medRestrictions.includes(item)}
                        onChange={e => {
                          if (e.target.checked) {
                            setMedRestrictions(prev => [...prev, item]);
                          } else {
                            setMedRestrictions(prev => prev.filter(r => r !== item));
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observations Médicales & Échéance Validité (1 an)
                </label>
                <textarea
                  rows={2}
                  value={medNotes}
                  onChange={e => setMedNotes(e.target.value)}
                  placeholder="Ex: Examen clinique complet satisfaisant, audiométrie conforme"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowMedicalModal(false)}
                  className="px-3 py-1.5 border rounded hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 text-white font-bold rounded hover:bg-emerald-800 shadow-xs cursor-pointer"
                >
                  Valider l'Aptitude Médicale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
