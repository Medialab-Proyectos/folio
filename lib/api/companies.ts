import { api } from './client';
import type { CompanyCreate, CompanyRead, CompanyUpdate, CompanyListParams } from './types';

export const companiesApi = {
  /** Create a new company */
  create: (data: CompanyCreate): Promise<CompanyRead> =>
    api.post<CompanyRead>('/companies/', data),

  /** List companies */
  list: (params?: CompanyListParams): Promise<CompanyRead[]> =>
    api.get<CompanyRead[]>('/companies/', { params }),

  /** Get a company by ID */
  getById: (companyId: string): Promise<CompanyRead> =>
    api.get<CompanyRead>(`/companies/${companyId}`),

  /** Update a company */
  update: (companyId: string, data: CompanyUpdate): Promise<CompanyRead> =>
    api.patch<CompanyRead>(`/companies/${companyId}`, data),

  /** Delete a company */
  delete: (companyId: string): Promise<void> =>
    api.delete<void>(`/companies/${companyId}`),
};
