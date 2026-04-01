import { api } from './client';
import type { RoleCreate, RoleRead, RoleUpdate, RoleListParams } from './types';

export const rolesApi = {
  /** Create a new role */
  create: (data: RoleCreate): Promise<RoleRead> =>
    api.post<RoleRead>('/roles/', data),

  /** List roles */
  list: (params?: RoleListParams): Promise<RoleRead[]> =>
    api.get<RoleRead[]>('/roles/', { params }),

  /** Get a role by ID */
  getById: (roleId: string): Promise<RoleRead> =>
    api.get<RoleRead>(`/roles/${roleId}`),

  /** Update a role */
  update: (roleId: string, data: RoleUpdate): Promise<RoleRead> =>
    api.put<RoleRead>(`/roles/${roleId}`, data),

  /** Delete a role (soft delete) */
  delete: (roleId: string): Promise<void> =>
    api.delete<void>(`/roles/${roleId}`),
};
