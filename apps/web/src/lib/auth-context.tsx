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
  // 1. Réhydratation synchrone depuis localStorage pour éviter tout flicker ou switch de profil au rechargement F5
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('silex_user');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('[AUTH] Erreur lecture silex_user initial:', e);
      }
    }
    return null;
  });

  const [activeRole, setActiveRole] = useState<SystemRole>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedRole = localStorage.getItem('silex_active_role');
        if (storedRole) return storedRole as SystemRole;
        const storedUser = localStorage.getItem('silex_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.role) return parsed.role as SystemRole;
        }
      } catch (e) {
        console.warn('[AUTH] Erreur lecture silex_active_role initial:', e);
      }
    }
    return SystemRole.DIRECTEUR_GENERAL;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hasToken = Boolean(localStorage.getItem('silex_token'));
      const hasUser = Boolean(localStorage.getItem('silex_user'));
      // Si une session existe déjà en cache local, la page s'affiche immédiatement
      if (hasToken && hasUser) return false;
    }
    return true;
  });

  const initAuth = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        setUser(null);
        localStorage.removeItem('silex_user');
        localStorage.removeItem('silex_active_role');
        setLoading(false);
        return;
      }

      try {
        const me = await api.getMe();
        if (me && me.email) {
          setUser(me);
          setActiveRole(me.role);
          localStorage.setItem('silex_user', JSON.stringify(me));
          localStorage.setItem('silex_active_role', me.role);
        } else {
          throw new Error('Données utilisateur invalides');
        }
      } catch (e: any) {
        console.warn('[AUTH] Token expiré ou invalide, nettoyage session :', e?.message);
        api.setToken(null);
        setUser(null);
        localStorage.removeItem('silex_user');
        localStorage.removeItem('silex_active_role');
      }
    } catch (err) {
      console.error('[AUTH] Erreur initialisation session :', err);
      setUser(null);
      localStorage.removeItem('silex_user');
      localStorage.removeItem('silex_active_role');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authData = await api.login(email, password);
      const authUser = authData.user as AuthUser;
      setUser(authUser);
      setActiveRole(authUser.role as SystemRole);
      localStorage.setItem('silex_user', JSON.stringify(authUser));
      localStorage.setItem('silex_active_role', authUser.role);
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
        const switchedUser = res.user as AuthUser;
        setUser(switchedUser);
        setActiveRole(switchedUser.role as SystemRole);
        localStorage.setItem('silex_user', JSON.stringify(switchedUser));
        localStorage.setItem('silex_active_role', switchedUser.role);
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
    localStorage.removeItem('silex_user');
    localStorage.removeItem('silex_active_role');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const currentProfile = {
    id: user?.id || 'guest',
    email: user?.email || '',
    name: user?.name || (user ? 'Collaborateur' : 'Invité'),
    role: (user?.role || activeRole) as SystemRole,
    title: user?.title || 'Collaborateur SILEX',
    departmentCode: user?.departmentCode || 'DIRECTION_GENERALE',
    avatar: user?.avatarUrl,
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
