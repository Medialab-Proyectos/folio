import { api, apiRequest } from './client';
import type { UserCarRead, UserCarCreate, UserCarUpdate } from './types';

export const userCarsApi = {
  /** List my cars */
  listMine: (): Promise<UserCarRead[]> =>
    api.get<UserCarRead[]>('/user-cars/me'),

  /** Add an existing car to the current user */
  addToMe: (carId: string, data?: { image?: File; status_car?: number; type?: string; position?: string }): Promise<UserCarRead> => {
    const form = new FormData();
    if (data?.status_car !== undefined) form.append('status_car', String(data.status_car));
    if (data?.type !== undefined) form.append('type', data.type);
    if (data?.position !== undefined) form.append('position', data.position);
    if (data?.image) form.append('image', data.image);
    return apiRequest<UserCarRead>(`/user-cars/me/${carId}`, { method: 'POST', body: form });
  },

  /** List all user-car relations (admin) */
  list: (): Promise<UserCarRead[]> =>
    api.get<UserCarRead[]>('/user-cars/'),

  /** Create a user-car relation */
  create: (data: UserCarCreate): Promise<UserCarRead> => {
    const form = new FormData();
    form.append('user_id', data.user_id);
    form.append('car_id', data.car_id);
    if (data.status_car !== undefined) form.append('status_car', String(data.status_car));
    if (data.type !== undefined) form.append('type', data.type);
    if (data.position !== undefined) form.append('position', data.position);
    if (data.image) form.append('image', data.image);
    return apiRequest<UserCarRead>('/user-cars/', { method: 'POST', body: form });
  },

  /** Get a user-car relation by ID */
  getById: (id: string): Promise<UserCarRead> =>
    api.get<UserCarRead>(`/user-cars/${id}`),

  /** Update a user-car relation */
  update: (id: string, data: UserCarUpdate): Promise<UserCarRead> => {
    const form = new FormData();
    if (data.status_car !== undefined) form.append('status_car', String(data.status_car));
    if (data.type !== undefined) form.append('type', data.type);
    if (data.position !== undefined) form.append('position', data.position);
    if (data.image) form.append('image', data.image);
    return apiRequest<UserCarRead>(`/user-cars/${id}`, { method: 'PATCH', body: form });
  },
};
