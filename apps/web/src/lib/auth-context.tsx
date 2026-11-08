'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemRole } from '@silex/shared';
import { api } from './api-client';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: SystemRole;
  departmentCode?: string;
  title?: string;
  avatarUrl?: string;
  assignedProjects?: any[];
  permissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  activeRole: SystemRole;
  currentProfile: {
    id: string;
    email: string;
    name: string;
    role: SystemRole;
    title: string;
    departmentCode: string;
    avatar?: string;
  };
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  switchRole: (role: SystemRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<SystemRole>(SystemRole.DIRECTEUR_GENERAL);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      setLoading(true);
      const token = api.getToken();
      if (token) {
        try {
          const me = await api.getMe();
          if (me && me.email) {
            setUser(me);
            setActiveRole(me.role);
            localStorage.setItem('silex_active_role', me.role);
            return;
          }
        } catch (e) {
          console.warn('[AUTH] Token expiré ou invalide, rafraîchissement de la session...');
        }
      }

      // Connexion initiale automatique via le compte de démonstration en base
      const savedRole = (localStorage.getItem('silex_active_role') as SystemRole) || SystemRole.DIRECTEUR_GENERAL;
      try {
        const demoAuth = await api.switchDemoRole(savedRole);
        if (demoAuth && demoAuth.user) {
          setUser(demoAuth.user as AuthUser);
          setActiveRole(demoAuth.user.role as SystemRole);
          localStorage.setItem('silex_active_role', demoAuth.user.role);
        }
      } catch (demoErr) {
        console.error('[AUTH] Impossible d’initialiser le compte démo en base :', demoErr);
        setUser(null);
      }
    } catch (err) {
      console.error('[AUTH] Erreur initialisation session :', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authData = await api.login(email, password);
      setUser(authData.user as AuthUser);
      setActiveRole(authData.user.role as SystemRole);
      localStorage.setItem('silex_active_role', authData.user.role);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const switchRole = async (newRole: SystemRole) => {
    setLoading(true);
    try {
      const res = await api.switchDemoRole(newRole);
      if (res && res.user) {
        setUser(res.user as AuthUser);
        setActiveRole(res.user.role as SystemRole);
        localStorage.setItem('silex_active_role', res.user.role);
      }
    } catch (err) {
      console.error('[AUTH] Échec basculement rôle réel :', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    localStorage.removeItem('silex_active_role');
  };

  const currentProfile = {
    id: user?.id || 'guest',
    email: user?.email || '',
    name: user?.name || 'Utilisateur',
    role: (user?.role || activeRole) as SystemRole,
    title: user?.title || 'Collaborateur SILEX',
    departmentCode: user?.departmentCode || 'DIRECTION_GENERALE',
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        currentProfile,
        loading,
        login,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider');
  }
  return context;
}
