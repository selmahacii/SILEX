'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemRole, DEMO_PROFILES, DemoProfile } from '@silex/shared';
import { api } from './api-client';

interface AuthContextType {
  user: any | null;
  activeRole: SystemRole;
  currentProfile: DemoProfile;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
      const token = api.getToken();
      if (token) {
        if (token.startsWith('silex_demo_token_')) {
          const roleStr = token.replace('silex_demo_token_', '') as SystemRole;
          const profile = DEMO_PROFILES[roleStr] || DEMO_PROFILES[roleToLoad] || DEMO_PROFILES[SystemRole.DIRECTEUR_GENERAL];
          const mockUser = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            departmentCode: profile.departmentCode,
            avatarUrl: profile.avatar,
            title: profile.title,
            assignedProjects: (profile.assignedProjectCodes || []).map(code => ({ id: code, code, name: code })),
            permissions: ['*'],
          };
          setUser(mockUser);
          setActiveRole(profile.role);
          return;
        }

        try {
          const me = await api.getMe();
          setUser(me);
          setActiveRole(me.role);
          return;
        } catch {
          const profile = DEMO_PROFILES[roleToLoad] || DEMO_PROFILES[SystemRole.DIRECTEUR_GENERAL];
          const mockUser = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            departmentCode: profile.departmentCode,
            avatarUrl: profile.avatar,
            title: profile.title,
            assignedProjects: (profile.assignedProjectCodes || []).map(code => ({ id: code, code, name: code })),
            permissions: ['*'],
          };
          setUser(mockUser);
          setActiveRole(profile.role);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Erreur initialisation auth:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authData = await api.login(email, password);
      setUser(authData.user);
      setActiveRole(authData.user.role);
      localStorage.setItem('silex_active_role', authData.user.role);
    } catch (err) {
      console.warn('API non disponible, bascule automatique sur le profil démo:', err);
      const foundProfile = Object.values(DEMO_PROFILES).find(p => p.email.toLowerCase() === email.toLowerCase()) || DEMO_PROFILES[SystemRole.DIRECTEUR_GENERAL];
      const mockUser = {
        id: foundProfile.id,
        email: foundProfile.email,
        name: foundProfile.name,
        role: foundProfile.role,
        departmentCode: foundProfile.departmentCode,
        avatarUrl: foundProfile.avatar,
        title: foundProfile.title,
        assignedProjects: (foundProfile.assignedProjectCodes || []).map(code => ({ id: code, code, name: code })),
        permissions: ['*'],
      };
      api.setToken('silex_demo_token_' + foundProfile.role);
      localStorage.setItem('silex_active_role', foundProfile.role);
      setUser(mockUser);
      setActiveRole(foundProfile.role);
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
      console.warn('API switchDemoRole non disponible, bascule locale:', err);
      const profile = DEMO_PROFILES[newRole] || DEMO_PROFILES[SystemRole.DIRECTEUR_GENERAL];
      const mockUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        departmentCode: profile.departmentCode,
        avatarUrl: profile.avatar,
        title: profile.title,
        assignedProjects: (profile.assignedProjectCodes || []).map(code => ({ id: code, code, name: code })),
        permissions: ['*'],
      };
      api.setToken('silex_demo_token_' + profile.role);
      localStorage.setItem('silex_active_role', profile.role);
      setUser(mockUser);
      setActiveRole(newRole);
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
