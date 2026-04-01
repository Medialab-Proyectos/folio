import { api } from './client';
import type { UserCompanyRead, UserCompanyCreate, UserCompanyUpdate } from './types';

export const userCompaniesApi = {
  /** List companies for the current user */
  listMine: (): Promise<UserCompanyRead[]> =>
    api.get<UserCompanyRead[]>('/user-companies/me'),

  /** List all user-company relations (admin) */
  list: (): Promise<UserCompanyRead[]> =>
    api.get<UserCompanyRead[]>('/user-companies/'),

  /** Create a user-company relation */
  create: (data: UserCompanyCreate): Promise<UserCompanyRead> =>
    api.post<UserCompanyRead>('/user-companies/', data),

  /** Get a user-company relation by ID */
  getById: (id: string): Promise<UserCompanyRead> =>
    api.get<UserCompanyRead>(`/user-companies/${id}`),

  /** Update a user-company relation */
  update: (id: string, data: UserCompanyUpdate): Promise<UserCompanyRead> =>
    api.patch<UserCompanyRead>(`/user-companies/${id}`, data),

  /** Activate or deactivate a user-company relation */
  toggleActive: (id: string, userCompanyStatus: 0 | 1): Promise<UserCompanyRead> =>
    api.patch<UserCompanyRead>(`/user-companies/${id}/activate-desactivate`, undefined, {
      params: { user_company_status: userCompanyStatus },
    }),
};
