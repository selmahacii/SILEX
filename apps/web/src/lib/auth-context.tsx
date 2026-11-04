'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemRole, DEMO_PROFILES, DemoProfile } from '@silex/shared';
import { api } from './api-client';

interface AuthContextType {
  user: any | null;
  activeRole: SystemRole;
  currentProfile: DemoProfile;
  loading: boolean;
  switchRole: (role: SystemRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<SystemRole>(SystemRole.DIRECTEUR_GENERAL);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async (roleToLoad: SystemRole) => {
    try {
      setLoading(true);
      const authData = await api.switchDemoRole(roleToLoad);
      setUser(authData.user);
      setActiveRole(roleToLoad);
    } catch (err) {
      console.error('Erreur initialisation auth:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedRole = (localStorage.getItem('silex_active_role') as SystemRole) || SystemRole.DIRECTEUR_GENERAL;
    initAuth(savedRole);
  }, []);

  const switchRole = async (newRole: SystemRole) => {
    setLoading(true);
    try {
      const authData = await api.switchDemoRole(newRole);
      setUser(authData.user);
      setActiveRole(newRole);
      localStorage.setItem('silex_active_role', newRole);
    } catch (err) {
      console.error('Erreur bascule de rôle:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    localStorage.removeItem('silex_active_role');
  };

  const currentProfile = DEMO_PROFILES[activeRole] || DEMO_PROFILES[SystemRole.DIRECTEUR_GENERAL];

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        currentProfile,
        loading,
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
