'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemRole } from '@silex/shared';
import { api } from './api-client';
import { SYSTEM_USERS } from './mock-data';

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
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const me = await api.getMe();
        if (me && me.email) {
          setUser(me);
          setActiveRole(me.role);
          return;
        }
      } catch {
        // Fallback session locale
      }

      const savedRole = (localStorage.getItem('silex_active_role') as SystemRole) || SystemRole.DIRECTEUR_GENERAL;
      const foundUser = SYSTEM_USERS.find(u => u.role === savedRole) || SYSTEM_USERS[0];
      setUser({
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role as SystemRole,
        title: foundUser.title,
        departmentCode: foundUser.departmentCode,
        permissions: ['*'],
      });
      setActiveRole(foundUser.role as SystemRole);
    } catch (err) {
      console.error('Erreur initialisation session:', err);
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
    } catch (err) {
      console.warn('API locale ou réseau fallback sur compte système :', err);
      const matched = SYSTEM_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || SYSTEM_USERS[0];
      const localUser: AuthUser = {
        id: matched.id,
        email: matched.email,
        name: matched.name,
        role: matched.role as SystemRole,
        title: matched.title,
        departmentCode: matched.departmentCode,
        permissions: ['*'],
      };
      api.setToken('silex_jwt_session_' + matched.role);
      localStorage.setItem('silex_active_role', matched.role);
      setUser(localUser);
      setActiveRole(matched.role as SystemRole);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const switchRole = async (newRole: SystemRole) => {
    setActiveRole(newRole);
    localStorage.setItem('silex_active_role', newRole);
    const matched = SYSTEM_USERS.find(u => u.role === newRole) || SYSTEM_USERS[0];
    setUser({
      id: matched.id,
      email: matched.email,
      name: matched.name,
      role: matched.role as SystemRole,
      title: matched.title,
      departmentCode: matched.departmentCode,
      permissions: ['*'],
    });
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    localStorage.removeItem('silex_active_role');
  };

  const defaultUser = SYSTEM_USERS.find(u => u.role === activeRole) || SYSTEM_USERS[0];
  const currentProfile = {
    id: user?.id || defaultUser.id,
    email: user?.email || defaultUser.email,
    name: user?.name || defaultUser.name,
    role: (user?.role || defaultUser.role) as SystemRole,
    title: user?.title || defaultUser.title,
    departmentCode: user?.departmentCode || defaultUser.departmentCode,
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
