import { api } from './client';
import type { UserRead, UserCreate, UserUpdate, PaginatedUsers, UserListParams, UserDeletionResponse } from './types';

export const usersApi = {
  /** Get the current authenticated user */
  me: (): Promise<UserRead> =>
    api.get<UserRead>('/users/me'),

  /** Update the current authenticated user */
  updateMe: (data: UserUpdate): Promise<UserRead> =>
    api.patch<UserRead>('/users/me', data),

  /** Get a user by ID */
  getById: (userId: string): Promise<UserRead> =>
    api.get<UserRead>(`/users/${userId}`),

  /** Update a user by ID */
  updateById: (userId: string, data: UserUpdate): Promise<UserRead> =>
    api.patch<UserRead>(`/users/${userId}`, data),

  /** Create a new user (Web only) */
  create: (data: UserCreate): Promise<UserRead> =>
    api.post<UserRead>('/users/', data),

  /** Get paginated list of all users */
  list: (params?: UserListParams): Promise<PaginatedUsers> =>
    api.get<PaginatedUsers>('/users/', { params }),

  /** Delete the current user's account (DB + S3) */
  deleteMe: (): Promise<UserDeletionResponse> =>
    api.delete<UserDeletionResponse>('/user-deletion/me'),
};
