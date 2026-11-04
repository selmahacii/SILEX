import { SystemRole, DepartmentCode } from './enums.js';

export type ActionPermission =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'submit'
  | 'approve'
  | 'reject'
  | 'export'
  | 'validate';

export type ResourceDomain =
  | 'projects'
  | 'procurement'
  | 'inventory'
  | 'hr'
  | 'finance'
  | 'maintenance'
  | 'quality'
  | 'workflows'
  | 'reports'
  | 'admin';

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: SystemRole;
  departmentCode: DepartmentCode;
  assignedProjectCodes?: string[];
  permissions: string[];
}

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  badgeCount?: number;
  allowedRoles?: SystemRole[];
  children?: {
    id: string;
    title: string;
    path: string;
    allowedRoles?: SystemRole[];
  }[];
}
