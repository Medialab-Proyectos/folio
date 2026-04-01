import { api } from './client';
import type { PermissionCreate, PermissionRead, PermissionUpdate, PermissionListParams, ModulePermissionsRead, PermissionUserRead } from './types';

export const permissionsApi = {
  /** Get permissions for the current user grouped by module */
  me: (): Promise<ModulePermissionsRead[]> =>
    api.get<ModulePermissionsRead[]>('/permissions/me'),

  /** Get permission-user info for the current user */
  permissionUser: (): Promise<PermissionUserRead[]> =>
    api.get<PermissionUserRead[]>('/permissions/permission-user'),

  /** Create a new permission (admin only) */
  create: (data: PermissionCreate): Promise<PermissionRead> =>
    api.post<PermissionRead>('/permissions/', data),

  /** List permissions by role (admin only) */
  listByRole: (roleId: string, params?: PermissionListParams): Promise<PermissionRead[]> =>
    api.get<PermissionRead[]>(`/permissions/by-role/${roleId}`, { params }),

  /** Get a permission by ID (admin only) */
  getById: (permissionId: string): Promise<PermissionRead> =>
    api.get<PermissionRead>(`/permissions/${permissionId}`),

  /** Update a permission (admin only) */
  update: (permissionId: string, data: PermissionUpdate): Promise<PermissionRead> =>
    api.put<PermissionRead>(`/permissions/${permissionId}`, data),

  /** Delete a permission (admin only) */
  delete: (permissionId: string): Promise<void> =>
    api.delete<void>(`/permissions/${permissionId}`),
};
