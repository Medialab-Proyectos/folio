import { api } from './client';
import type { NotyUserRead, NotyUserCreate, NotyUserUpdate } from './types';

export const notyUsersApi = {
  /** List notifications for the current user */
  listMine: (): Promise<NotyUserRead[]> =>
    api.get<NotyUserRead[]>('/noty-users/me'),

  /** Update a notification state for the current user */
  updateMine: (notyUserId: string, data: NotyUserUpdate): Promise<NotyUserRead> =>
    api.patch<NotyUserRead>(`/noty-users/me/${notyUserId}`, data),

  /** List all noty-user relations (admin) */
  list: (): Promise<NotyUserRead[]> =>
    api.get<NotyUserRead[]>('/noty-users/'),

  /** Create a noty-user relation */
  create: (data: NotyUserCreate): Promise<NotyUserRead> =>
    api.post<NotyUserRead>('/noty-users/', data),

  /** Get a noty-user relation by ID */
  getById: (notyUserId: string): Promise<NotyUserRead> =>
    api.get<NotyUserRead>(`/noty-users/${notyUserId}`),

  /** Update a noty-user relation */
  update: (notyUserId: string, data: NotyUserUpdate): Promise<NotyUserRead> =>
    api.patch<NotyUserRead>(`/noty-users/${notyUserId}`, data),

  /** Delete a noty-user relation */
  delete: (notyUserId: string): Promise<void> =>
    api.delete<void>(`/noty-users/${notyUserId}`),
};
