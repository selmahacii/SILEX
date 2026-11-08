'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDateTimeDZ, SystemRole, DepartmentCode } from '@silex/shared';
import {
  Shield,
  Users,
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
  Trash2,
  Lock,
  Layers,
  Save,
  Check,
  ShieldCheck,
  SlidersHorizontal,
  Search,
  Filter,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: SystemRole.ADMINISTRATEUR, label: 'Administrateur Système', dept: DepartmentCode.INFORMATIQUE_ADMIN, title: 'Administrateur Système ERP', color: 'bg-slate-800 text-white' },
  { value: SystemRole.DIRECTEUR_GENERAL, label: 'Directeur Général', dept: DepartmentCode.DIRECTION_GENERALE, title: 'Directeur Général', color: 'bg-[#0B207D] text-white' },
  { value: SystemRole.RESPONSABLE_PROJET, label: 'Chef de Projets Industriels', dept: DepartmentCode.OPERATIONS_PROJETS, title: 'Chef de Projets Industriels', color: 'bg-[#0A7F7C] text-white' },
  { value: SystemRole.RESPONSABLE_ACHATS, label: 'Responsable Achats & Logistique', dept: DepartmentCode.ACHATS_LOGISTIQUE, title: 'Responsable Approvisionnements & Achats', color: 'bg-indigo-700 text-white' },
  { value: SystemRole.RESPONSABLE_MAGASIN, label: 'Responsable Magasin & Stocks', dept: DepartmentCode.MAGASIN_STOCKS, title: 'Gestionnaire Magasin Central', color: 'bg-emerald-700 text-white' },
  { value: SystemRole.RESPONSABLE_RH, label: 'Responsable Ressources Humaines', dept: DepartmentCode.RESSOURCES_HUMAINES, title: 'Responsable RH & Compétences', color: 'bg-purple-700 text-white' },
  { value: SystemRole.RESPONSABLE_FINANCIER, label: 'Directeur Financier', dept: DepartmentCode.FINANCE_COMPTABILITE, title: 'Directeur Financier & Contrôle de Gestion', color: 'bg-blue-800 text-white' },
  { value: SystemRole.RESPONSABLE_MAINTENANCE, label: 'Responsable Parc & Maintenance', dept: DepartmentCode.PARC_MAINTENANCE, title: 'Responsable Matériel & Parc Engins', color: 'bg-amber-700 text-white' },
  { value: SystemRole.RESPONSABLE_QUALITE, label: 'Responsable QHSE & Qualité CND', dept: DepartmentCode.QHSE, title: 'Responsable Qualité & Sécurité QHSE', color: 'bg-teal-700 text-white' },
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

const MODULE_DEFINITIONS = [
  { key: 'dashboard', label: 'Tableau de bord Exécutif', desc: 'Indicateurs consolidés, marges, KPIs chantiers' },
  { key: 'projects', label: 'Gestion des Projets & Chantiers', desc: 'Fiches chantiers, jalons, ODS, métrés et situations' },
  { key: 'procurement', label: 'Achats & Approvisionnements', desc: 'DAs multi-lignes, consultations, bons de commande' },
  { key: 'inventory', label: 'Stocks & Magasins', desc: 'Catalogue articles, bons de sortie chantier, transferts' },
  { key: 'hr', label: 'Ressources Humaines', desc: 'Collaborateurs, habilitations soudage CQS, pointages' },
  { key: 'finance', label: 'Finance & Rentabilité', desc: 'Encaissements, facturation, retenue de garantie 5%' },
  { key: 'maintenance', label: 'Parc Matériel & Engins', desc: 'Équipements, postes Miller, ordres de travail (OT)' },
  { key: 'quality', label: 'Documents & Qualité QHSE', desc: 'GED, fiches de non-conformité (FNC), Weld Book CND' },
  { key: 'workflows', label: 'Workflows & Arbitrages QCD', desc: 'Circuit d’approbation, visa DG et séparation SoD' },
  { key: 'admin', label: 'Administration Système', desc: 'Création d’utilisateurs, gestion des rôles et audit' },
];

export default function AdminPage() {
  const { user, activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'rbac' | 'audit'>('users');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');

  // Matrice RBAC state
  const [rbacMatrix, setRbacMatrix] = useState<Record<string, Record<string, any>>>({});
  const [selectedRbacRole, setSelectedRbacRole] = useState<SystemRole>(SystemRole.DIRECTEUR_GENERAL);
  const [savingRbac, setSavingRbac] = useState(false);
  const [rbacNotification, setRbacNotification] = useState<string | null>(null);

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
      const [usrs, logs, rbac] = await Promise.all([
        api.get<any[]>('/users'),
        api.get<any[]>('/audit?limit=50'),
        api.get<Record<string, any>>('/admin/rbac').catch(() => ({})),
      ]);
      setUsersList(Array.isArray(usrs) ? usrs : []);
      setAuditLogs(Array.isArray(logs) ? logs : []);
      if (rbac && Object.keys(rbac).length > 0) {
        setRbacMatrix(rbac);
      }
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
      setCreateError('Veuillez renseigner le nom complet du collaborateur.');
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

      if (createdUser && createdUser.id) {
        setUsersList(prev => [createdUser, ...prev]);
      }

      setCreateSuccess(`Le collaborateur "${createForm.name}" a été créé et habilité avec succès !`);
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
      setCreateError(err?.message || 'Erreur lors de la création du collaborateur.');
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
    if (userToToggle.email === 'admin@silex-services.dz') {
      alert("Le compte Super-Administrateur initial ne peut pas être désactivé.");
      return;
    }
    try {
      const nextStatus = !userToToggle.active;
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

  const handleDeleteUser = async (userToDelete: any) => {
    if (userToDelete.email === 'admin@silex-services.dz' || userToDelete.id === 'usr-superadmin-001') {
      alert("Impossible de supprimer le compte Super-Administrateur racine.");
      return;
    }
    if (!confirm(`Confirmez-vous la suppression définitive du compte de "${userToDelete.name}" (${userToDelete.email}) ?`)) {
      return;
    }
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
      await loadAdminData();
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de la suppression de l’utilisateur.');
    }
  };

  // RBAC Permission Toggle Handler
  const handleTogglePermission = (moduleKey: string, actionKey: string) => {
    setRbacMatrix(prev => {
      const rolePerms = prev[selectedRbacRole] || {};
      const modulePerms = rolePerms[moduleKey] || {
        read: false,
        create: false,
        update: false,
        delete: false,
        approve: false,
        export: false,
      };

      return {
        ...prev,
        [selectedRbacRole]: {
          ...rolePerms,
          [moduleKey]: {
            ...modulePerms,
            [actionKey]: !modulePerms[actionKey],
          },
        },
      };
    });
  };

  const handleSaveRbacMatrix = async () => {
    try {
      setSavingRbac(true);
      const rolePermissions = rbacMatrix[selectedRbacRole];
      await api.post('/admin/rbac', {
        role: selectedRbacRole,
        permissions: rolePermissions,
      });
      setRbacNotification(`Matrice d’habilitations enregistrée pour le rôle ${selectedRbacRole.replace(/_/g, ' ')} !`);
      setTimeout(() => setRbacNotification(null), 5000);
      await loadAdminData();
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de l’enregistrement de la matrice RBAC.');
    } finally {
      setSavingRbac(false);
    }
  };

  const handleSetRolePreset = (preset: 'full' | 'readonly' | 'none') => {
    setRbacMatrix(prev => {
      const newModulePerms: Record<string, any> = {};
      MODULE_DEFINITIONS.forEach(m => {
        if (preset === 'full') {
          newModulePerms[m.key] = { read: true, create: true, update: true, delete: true, approve: true, export: true };
        } else if (preset === 'readonly') {
          newModulePerms[m.key] = { read: true, create: false, update: false, delete: false, approve: false, export: true };
        } else {
          newModulePerms[m.key] = { read: false, create: false, update: false, delete: false, approve: false, export: false };
        }
      });
      return {
        ...prev,
        [selectedRbacRole]: newModulePerms,
      };
    });
  };

  const filteredUsers = usersList.filter(u =>
    (u.name || '').toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.title || '').toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none">
      {/* Toast Notification */}
      {rbacNotification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{rbacNotification}</span>
          </div>
          <button onClick={() => setRbacNotification(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#07164D] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0B207D]" />
            Administration Système & Gouvernance RBAC
          </h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Gestion centrale des utilisateurs, affectation des rôles et contrôle micro-détaillé de la matrice d'habilitations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCreateError(null);
              setCreateSuccess(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-lg hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Créer un Collaborateur
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">Comptes Utilisateurs</div>
          <div className="text-xl font-extrabold text-[#07164D] mt-1">{usersList.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {usersList.filter(u => u.active !== false).length} compte(s) actif(s)
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">Rôles Système Définis</div>
          <div className="text-xl font-extrabold text-[#0A7F7C] mt-1">9</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Profils métier SILEX</div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">Périmètre RBAC</div>
          <div className="text-xl font-extrabold text-[#0B207D] mt-1">10 Modules</div>
          <div className="text-[10px] text-slate-500 mt-0.5">60 règles d’action granulaires</div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">Registre d'Audit</div>
          <div className="text-xl font-extrabold text-amber-700 mt-1">{auditLogs.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Événements tracés au ledger</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#0B207D] text-[#0B207D] font-bold bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>1. Utilisateurs & Collaborateurs ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'rbac'
              ? 'border-[#0B207D] text-[#0B207D] font-bold bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#0A7F7C]" />
          <span>2. Matrice des Permissions RBAC Micro-Détaillées</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit'
              ? 'border-[#0B207D] text-[#0B207D] font-bold bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>3. Journal d'Audit & Sécurité ({auditLogs.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: UTILISATEURS */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou rôle..."
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B207D] text-slate-900"
              />
            </div>
            <div className="text-xs text-slate-500">
              Affichage de <strong>{filteredUsers.length}</strong> collaborateur(s)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Collaborateur</th>
                  <th className="py-2.5 px-3">Fonction & Département</th>
                  <th className="py-2.5 px-3">Rôle Attribué</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      Aucun collaborateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isRootSuperAdmin = u.email === 'admin@silex-services.dz' || u.id === 'usr-superadmin-001';
                    const roleInfo = ROLE_OPTIONS.find(r => r.value === u.role);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0B207D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isRootSuperAdmin && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                    SUPERADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{u.title || 'Collaborateur'}</div>
                          <div className="text-[10px] text-slate-400">{u.departmentCode || u.department?.name}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${roleInfo?.color || 'bg-slate-100 text-slate-800'}`}>
                            {u.role?.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {u.active !== false ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              Inactif
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 text-slate-500 hover:text-[#0B207D] hover:bg-blue-50 rounded transition-colors"
                              title="Modifier ce profil"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {!isRootSuperAdmin && (
                              <>
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  className={`p-1.5 rounded transition-colors ${
                                    u.active !== false
                                      ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                      : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={u.active !== false ? 'Désactiver ce compte' : 'Activer ce compte'}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MATRICE RBAC MICRO-DÉTAILLÉE */}
      {/* ========================================================================= */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#07164D] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0A7F7C]" />
                Configuration Granulaire des Droits par Rôle
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cochez ou décochez les permissions d’action (Lecture, Création, Modification, Suppression, Visa SoD, Export).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Rôle ciblé :</span>
                <select
                  value={selectedRbacRole}
                  onChange={e => setSelectedRbacRole(e.target.value as SystemRole)}
                  className="p-2 border border-slate-300 rounded-lg text-xs font-bold bg-white text-[#07164D] focus:ring-2 focus:ring-[#0B207D]"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSaveRbacMatrix}
                disabled={savingRbac}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0A7F7C] hover:bg-[#076461] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingRbac ? 'Enregistrement...' : 'Enregistrer la Matrice'}</span>
              </button>
            </div>
          </div>

          {/* Quick presets toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600">Raccourcis de configuration pour ce rôle :</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSetRolePreset('full')}
                className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded text-[11px] font-semibold hover:bg-slate-100"
              >
                Accès Total (Tout cocher)
              </button>
              <button
                type="button"
                onClick={() => handleSetRolePreset('readonly')}
                className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded text-[11px] font-semibold hover:bg-slate-100"
              >
                Lecture Seule (Consultation)
              </button>
              <button
                type="button"
                onClick={() => handleSetRolePreset('none')}
                className="px-2.5 py-1 bg-white border border-slate-300 text-red-600 rounded text-[11px] font-semibold hover:bg-red-50"
              >
                Révoquer Tout
              </button>
            </div>
          </div>

          {/* Granular Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#05113B] text-white uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Module Applicatif</th>
                  <th className="py-3 px-2 text-center">1. Lecture (Visibilité)</th>
                  <th className="py-3 px-2 text-center">2. Création</th>
                  <th className="py-3 px-2 text-center">3. Modification</th>
                  <th className="py-3 px-2 text-center">4. Suppression</th>
                  <th className="py-3 px-2 text-center">5. Visa SoD / Validation</th>
                  <th className="py-3 px-2 text-center">6. Export Données</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MODULE_DEFINITIONS.map(m => {
                  const rolePerms = rbacMatrix[selectedRbacRole] || {};
                  const mod = rolePerms[m.key] || {
                    read: false,
                    create: false,
                    update: false,
                    delete: false,
                    approve: false,
                    export: false,
                  };

                  return (
                    <tr key={m.key} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#07164D]">{m.label}</div>
                        <div className="text-[10px] text-slate-500">{m.desc}</div>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(mod.read)}
                          onChange={() => handleTogglePermission(m.key, 'read')}
                          className="w-4 h-4 text-[#0B207D] rounded border-slate-300 focus:ring-[#0B207D] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(mod.create)}
                          onChange={() => handleTogglePermission(m.key, 'create')}
                          className="w-4 h-4 text-[#0B207D] rounded border-slate-300 focus:ring-[#0B207D] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(mod.update)}
                          onChange={() => handleTogglePermission(m.key, 'update')}
                          className="w-4 h-4 text-[#0B207D] rounded border-slate-300 focus:ring-[#0B207D] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(mod.delete)}
                          onChange={() => handleTogglePermission(m.key, 'delete')}
                          className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(mod.approve)}
                          onChange={() => handleTogglePermission(m.key, 'approve')}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(mod.export)}
                          onChange={() => handleTogglePermission(m.key, 'export')}
                          className="w-4 h-4 text-[#0A7F7C] rounded border-slate-300 focus:ring-[#0A7F7C] cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              Journal d'Audit Immuable ({auditLogs.length} événements)
            </h2>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Aucun événement d’audit enregistré pour l’instant.
              </div>
            ) : (
              auditLogs.map((log, idx) => (
                <div key={log.id || idx} className="py-3 flex items-start justify-between text-xs hover:bg-slate-50 px-2 rounded">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-900">{log.entityType || log.entityName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{log.entityId}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">{log.details || log.description}</div>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 shrink-0">
                    <div>{log.userName || log.userEmail || 'Système'}</div>
                    <div className="font-mono">{formatDateTimeDZ(log.timestamp || log.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL CRÉATION UTILISATEUR */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0B207D]" />
                <h3 className="text-sm font-bold text-[#07164D]">Créer un Collaborateur & Habiliter son Rôle</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {createSuccess && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded text-xs text-teal-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0A7F7C] shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nom & Prénom *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Sofiane Belkacem"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Professionnel *</label>
                <input
                  type="email"
                  required
                  placeholder="ex: s.belkacem@silex-services.dz"
                  value={createForm.email}
                  onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#0B207D] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rôle Métier Attribué *</label>
                <select
                  value={createForm.role}
                  onChange={e => handleRoleChange(e.target.value as SystemRole)}
                  className="w-full p-2 border border-slate-300 rounded text-xs font-semibold bg-white"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Département d'attache</label>
                <select
                  value={createForm.departmentCode}
                  onChange={e => setCreateForm({ ...createForm, departmentCode: e.target.value as DepartmentCode })}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                >
                  {DEPARTMENT_OPTIONS.map(d => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Intitulé du Poste</label>
                <input
                  type="text"
                  placeholder="ex: Chef de Projets / Ingénieur Mécanique"
                  value={createForm.title}
                  onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mot de passe initial</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Laisser vide pour auto-générer (Silex2026@!)"
                    value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full p-2 pr-9 border border-slate-300 rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] disabled:opacity-50 cursor-pointer"
                >
                  {submittingUser ? 'Création en cours...' : 'Créer & Habiliter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFICATION UTILISATEUR */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#0B207D]" />
                <h3 className="text-sm font-bold text-[#07164D]">Modifier le Collaborateur</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded text-xs text-teal-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0A7F7C] shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nom & Prénom</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rôle Attribué</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value as SystemRole })}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-xs bg-white"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Département</label>
                <select
                  value={editForm.departmentCode}
                  onChange={e => setEditForm({ ...editForm, departmentCode: e.target.value as DepartmentCode })}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                >
                  {DEPARTMENT_OPTIONS.map(d => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Intitulé du Poste</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={editForm.active}
                  onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
                  className="w-4 h-4 text-[#0B207D] rounded border-slate-300"
                />
                <label htmlFor="userActiveCheck" className="text-slate-700 font-semibold cursor-pointer">
                  Compte actif et autorisé à se connecter
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] disabled:opacity-50 cursor-pointer"
                >
                  {submittingEdit ? 'Enregistrement...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
