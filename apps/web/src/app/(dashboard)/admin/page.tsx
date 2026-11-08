'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDateTimeDZ, SystemRole, DepartmentCode } from '@silex/shared';
import {
  Shield,
  Users,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  History,
  UserPlus,
  X,
  Mail,
  Briefcase,
  Building,
  Key,
  Eye,
  EyeOff,
  UserCheck,
  Edit2,
  Power,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: SystemRole.ADMINISTRATEUR, label: 'Administrateur Système', dept: DepartmentCode.INFORMATIQUE_ADMIN, title: 'Administrateur Système ERP' },
  { value: SystemRole.DIRECTEUR_GENERAL, label: 'Directeur Général', dept: DepartmentCode.DIRECTION_GENERALE, title: 'Directeur Général' },
  { value: SystemRole.RESPONSABLE_PROJET, label: 'Responsable Projet', dept: DepartmentCode.OPERATIONS_PROJETS, title: 'Chef de Projets Industriels' },
  { value: SystemRole.RESPONSABLE_ACHATS, label: 'Responsable Achats & Logistique', dept: DepartmentCode.ACHATS_LOGISTIQUE, title: 'Responsable Approvisionnements & Achats' },
  { value: SystemRole.RESPONSABLE_MAGASIN, label: 'Responsable Magasin & Stocks', dept: DepartmentCode.MAGASIN_STOCKS, title: 'Gestionnaire Magasin Central' },
  { value: SystemRole.RESPONSABLE_RH, label: 'Responsable Ressources Humaines', dept: DepartmentCode.RESSOURCES_HUMAINES, title: 'Responsable RH & Compétences' },
  { value: SystemRole.RESPONSABLE_FINANCIER, label: 'Responsable Financier & Gestion', dept: DepartmentCode.FINANCE_COMPTABILITE, title: 'Directeur Financier & Contrôle de Gestion' },
  { value: SystemRole.RESPONSABLE_MAINTENANCE, label: 'Responsable Parc & Maintenance', dept: DepartmentCode.PARC_MAINTENANCE, title: 'Responsable Matériel & Parc Engins' },
  { value: SystemRole.RESPONSABLE_QUALITE, label: 'Responsable Qualité & QHSE', dept: DepartmentCode.QHSE, title: 'Responsable Qualité & Sécurité QHSE' },
];

const DEPARTMENT_OPTIONS = [
  { value: DepartmentCode.DIRECTION_GENERALE, label: 'Direction Générale' },
  { value: DepartmentCode.OPERATIONS_PROJETS, label: 'Opérations & Projets' },
  { value: DepartmentCode.ACHATS_LOGISTIQUE, label: 'Achats & Approvisionnements' },
  { value: DepartmentCode.MAGASIN_STOCKS, label: 'Magasins & Stocks' },
  { value: DepartmentCode.RESSOURCES_HUMAINES, label: 'Ressources Humaines' },
  { value: DepartmentCode.FINANCE_COMPTABILITE, label: 'Finance & Contrôle de Gestion' },
  { value: DepartmentCode.PARC_MAINTENANCE, label: 'Parc Matériel & Maintenance' },
  { value: DepartmentCode.QHSE, label: 'QHSE & Conformité' },
  { value: DepartmentCode.INFORMATIQUE_ADMIN, label: 'Informatique & Administration' },
];

export default function AdminPage() {
  const { user, activeRole } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Modal Création Utilisateur
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    title: 'Chef de Projets Industriels',
    role: SystemRole.RESPONSABLE_PROJET,
    departmentCode: DepartmentCode.OPERATIONS_PROJETS,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submittingUser, setSubmittingUser] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Modal Modification Utilisateur (Update)
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    title: '',
    role: SystemRole.RESPONSABLE_PROJET,
    departmentCode: DepartmentCode.OPERATIONS_PROJETS,
    active: true,
    password: '',
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const isAuthorized =
    activeRole === SystemRole.ADMINISTRATEUR || activeRole === SystemRole.DIRECTEUR_GENERAL;

  const loadAdminData = async () => {
    if (!isAuthorized) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [usrs, logs] = await Promise.all([
        api.get<any[]>('/users'),
        api.get<any[]>('/audit?limit=25'),
      ]);
      setUsersList(usrs);
      setAuditLogs(logs);
    } catch (err: any) {
      console.error('Erreur admin:', err);
      setError(err?.message || 'Accès refusé aux données d’administration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeRole]);

  const handleRoleChange = (role: SystemRole) => {
    const opt = ROLE_OPTIONS.find(r => r.value === role);
    setCreateForm(prev => ({
      ...prev,
      role,
      departmentCode: opt?.dept || prev.departmentCode,
      title: opt?.title || prev.title,
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!createForm.name.trim()) {
      setCreateError('Veuillez renseigner le nom complet de l’utilisateur.');
      return;
    }
    if (!createForm.email.trim() || !createForm.email.includes('@')) {
      setCreateError('Veuillez renseigner une adresse email valide.');
      return;
    }

    try {
      setSubmittingUser(true);
      const createdUser = await api.post<any>('/users', {
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        title: createForm.title.trim() || undefined,
        role: createForm.role,
        departmentCode: createForm.departmentCode,
        password: createForm.password.trim() || undefined,
      });

      // Mise à jour visuelle instantanée dans la liste
      if (createdUser && createdUser.id) {
        setUsersList(prev => [createdUser, ...prev]);
      }

      setCreateSuccess(`L’utilisateur "${createForm.name}" a été créé avec succès !`);
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(null);
        setCreateForm({
          name: '',
          email: '',
          title: 'Chef de Projets Industriels',
          role: SystemRole.RESPONSABLE_PROJET,
          departmentCode: DepartmentCode.OPERATIONS_PROJETS,
          password: '',
        });
      }, 1000);

      await loadAdminData();
    } catch (err: any) {
      setCreateError(err?.message || 'Erreur lors de la création de l’utilisateur.');
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      title: u.title || '',
      role: u.role,
      departmentCode: u.departmentCode || u.department?.code || DepartmentCode.DIRECTION_GENERALE,
      active: u.active !== false,
      password: '',
    });
    setEditError(null);
    setEditSuccess(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);
    setEditSuccess(null);

    try {
      setSubmittingEdit(true);
      const updatedUser = await api.patch<any>(`/users/${editingUser.id}`, {
        name: editForm.name.trim(),
        title: editForm.title.trim(),
        role: editForm.role,
        departmentCode: editForm.departmentCode,
        active: editForm.active,
        password: editForm.password.trim() || undefined,
      });

      // Mise à jour visuelle instantanée dans la liste
      if (updatedUser && updatedUser.id) {
        setUsersList(prev =>
          prev.map(u => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
        );
      }

      setEditSuccess(`Le profil de "${editForm.name}" a été mis à jour avec succès !`);
      await loadAdminData();
      setTimeout(() => {
        setEditingUser(null);
        setEditSuccess(null);
      }, 1000);
    } catch (err: any) {
      setEditError(err?.message || 'Erreur lors de la mise à jour de l’utilisateur.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleUserStatus = async (userToToggle: any) => {
    try {
      const nextStatus = !userToToggle.active;
      // Mise à jour visuelle instantanée
      setUsersList(prev =>
        prev.map(u => (u.id === userToToggle.id ? { ...u, active: nextStatus } : u))
      );
      await api.patch(`/users/${userToToggle.id}`, {
        active: nextStatus,
      });
      await loadAdminData();
    } catch (err: any) {
      alert(err?.message || 'Erreur lors du changement de statut.');
      await loadAdminData();
    }
  };

  const handleResetDemoData = async () => {
    try {
      setResetting(true);
      const res = await api.post<any>('/users/reset-demo');
      setShowResetModal(false);
      await loadAdminData();
      alert(res.message || 'Données de démonstration réinitialisées avec succès.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResetting(false);
    }
  };

  const isAdmin = activeRole === SystemRole.ADMINISTRATEUR;

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#182433]">Administration Système & Sécurité</h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Gestion des utilisateurs ERP, attribution des rôles RBAC, traçabilité immuable et intégrité ISO.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {isAuthorized && (
            <button
              onClick={() => {
                setCreateError(null);
                setCreateSuccess(null);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B207D] hover:bg-[#07164D] text-white text-xs font-semibold rounded shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Nouvel Utilisateur
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C44747] text-white text-xs font-semibold rounded hover:bg-[#a83838] transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser les données démo
            </button>
          )}
        </div>
      </div>

      {!isAuthorized ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start gap-4 shadow-sm">
          <Shield className="w-8 h-8 text-red-600 shrink-0 mt-1" />
          <div>
            <h2 className="font-bold text-base">Accès Refusé — Contrôle RBAC</h2>
            <p className="text-xs text-red-700 mt-1">
              Votre rôle actuel (<strong>{activeRole}</strong>) ne dispose pas des droits requis pour accéder au panneau d'administration système et aux journaux d'audit de sécurité.
            </p>
            <p className="text-xs text-red-600 mt-2">
              Veuillez sélectionner le rôle <strong>Administrateur Système</strong> ou <strong>Directeur Général</strong> via le commutateur de rôles en haut à droite pour afficher ce module.
            </p>
          </div>
        </div>
      ) : (
        <>
          {!isAdmin && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Connectez-vous en tant qu'<strong>Administrateur Système</strong> (via le sélecteur en haut à droite) pour exécuter la réinitialisation de la base de démonstration.
              </span>
            </div>
          )}

          {/* Grid: Users Table & Audit Trail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Users (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#0A7F7C]" />
                  Comptes Utilisateurs & Rôles Définis
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">{usersList.length} profils configurés</span>
                  <button
                    onClick={() => {
                      setCreateError(null);
                      setCreateSuccess(null);
                      setShowCreateModal(true);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0B207D] hover:underline"
                  >
                    <UserPlus className="w-3 h-3" />
                    + Créer
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 flex-1 max-h-[540px] overflow-y-auto">
                {usersList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Aucun utilisateur enregistré.
                  </div>
                ) : (
                  (Array.isArray(usersList) ? usersList : []).map(u => (
                    <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EFF3FB] border border-[#CBD5E1] text-[#0B207D] flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.name}
                            {!u.active && (
                              <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded">Inactif</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.title} • {u.email}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Département : <span className="text-slate-600 font-medium">{u.department?.name || u.departmentCode}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0B207D] border border-slate-200">
                          {u.role}
                        </span>
                        {isAuthorized && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Modifier ce profil"
                              className="p-1 rounded text-slate-500 hover:text-[#0B207D] hover:bg-slate-200/70 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              title={u.active ? 'Désactiver le compte' : 'Activer le compte'}
                              className={`p-1 rounded transition-colors ${
                                u.active
                                  ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                                  : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit Log (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#0A7F7C]" />
                  Journal d’Audit Immuable
                </h2>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                  ISO 9001
                </span>
              </div>

              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[540px] p-2">
                {(Array.isArray(auditLogs) ? auditLogs : []).map(log => (
                  <div key={log.id} className="p-2.5 text-xs space-y-1 hover:bg-slate-50 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#142B45] text-[10px]">{log.action}</span>
                      <span className="text-[10px] text-slate-400">{formatDateTimeDZ(log.createdAt)}</span>
                    </div>
                    <div className="text-slate-700 text-[11px] leading-snug">{log.description}</div>
                    <div className="text-[10px] text-slate-500">
                      Auteur : <strong>{log.performerName}</strong> ({log.performerRole})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODALE CRÉATION UTILISATEUR */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-[#07164D] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Création d'un Compte Utilisateur</h3>
                  <p className="text-[11px] text-slate-300">Enregistrement et affectation du rôle RBAC</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{createSuccess}</span>
                </div>
              )}

              {/* Nom & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom & Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex. Mohamed Benali"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Professionnel <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="m.benali@silex-services.dz"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Rôle Système RBAC */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rôle Système (RBAC) <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.role}
                  onChange={e => handleRoleChange(e.target.value as SystemRole)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden bg-white"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label} ({r.value})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Définit la matrice des autorisations et périmètres d'accès aux modules ERP.
                </p>
              </div>

              {/* Intitulé & Département */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Intitulé du Poste / Fonction
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="ex. Chef de Projets Industriels"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden"
                    />
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Département d'Affectation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={createForm.departmentCode}
                      onChange={e => setCreateForm(prev => ({ ...prev, departmentCode: e.target.value as DepartmentCode }))}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden bg-white"
                    >
                      {DEPARTMENT_OPTIONS.map(d => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Mot de passe initial */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mot de passe initial
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Laisser vide pour le défaut (SilexDemo2026!)"
                    className="w-full pl-8 pr-10 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden"
                  />
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Hachage sécurisé argon2. Par défaut : <code>SilexDemo2026!</code>
                </p>
              </div>

              {/* Information Traçabilité */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 flex items-start gap-2">
                <UserCheck className="w-4 h-4 text-[#0A7F7C] shrink-0 mt-0.5" />
                <span>
                  La création de cet utilisateur sera tracée dans le journal d'audit de sécurité avec l'identifiant de votre compte administrateur.
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-4 py-1.5 bg-[#0B207D] hover:bg-[#07164D] text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingUser ? (
                    <>Enregistrement en cours...</>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Créer le Compte
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE MODIFICATION UTILISATEUR */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-[#0B207D] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Modifier l'Utilisateur : {editingUser.name}</h3>
                  <p className="text-[11px] text-slate-300">{editingUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {/* Nom & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom & Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Professionnel
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingUser.email}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded bg-slate-100 text-slate-500 outline-hidden cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Rôle Système RBAC */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rôle Système (RBAC) <span className="text-red-500">*</span>
                </label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value as SystemRole }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden bg-white"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label} ({r.value})
                    </option>
                  ))}
                </select>
              </div>

              {/* Intitulé & Département */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Intitulé du Poste / Fonction
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Département d'Affectation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.departmentCode}
                    onChange={e => setEditForm(prev => ({ ...prev, departmentCode: e.target.value as DepartmentCode }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden bg-white"
                  >
                    {DEPARTMENT_OPTIONS.map(d => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Statut du compte */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
                <input
                  type="checkbox"
                  id="activeCheckbox"
                  checked={editForm.active}
                  onChange={e => setEditForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-[#0B207D] rounded focus:ring-[#0B207D]"
                />
                <label htmlFor="activeCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Compte Actif (accès autorisé à la plateforme SILEX ERP)
                </label>
              </div>

              {/* Nouveau mot de passe (optionnel) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nouveau mot de passe (laisser vide pour ne pas changer)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Laisser vide pour conserver le mot de passe actuel"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] focus:border-[#0B207D] outline-hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-4 py-1.5 bg-[#0B207D] hover:bg-[#07164D] text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingEdit ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE RÉINITIALISATION DÉMO */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Confirmation de Réinitialisation Démo</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cette action va réinitialiser l’ensemble des flux transactionnels de démonstration (Demandes d’Achat, Bons de Commande, Réceptions Magasins, Sorties Chantiers) à leur état initial.
            </p>
            <p className="text-xs text-slate-600">
              Voulez-vous réinitialiser les données de démonstration de <strong>SILEX SERVICES</strong> ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                disabled={resetting}
                className="px-4 py-1.5 bg-[#C44747] text-white text-xs font-bold rounded hover:bg-[#a83838]"
              >
                {resetting ? 'Réinitialisation en cours...' : 'Confirmer la réinitialisation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
