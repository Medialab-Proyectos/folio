import { api } from './client';
import type { FacilityCreate, FacilityRead, FacilityUpdate, FacilityListParams, CarRead } from './types';

export interface FacilityWithCars extends FacilityRead {
  cars: CarRead[];
}

export const facilitiesApi = {
  /** Create a new facility */
  create: (data: FacilityCreate): Promise<FacilityRead> =>
    api.post<FacilityRead>('/facilities/', data),

  /** List facilities */
  list: (params?: FacilityListParams): Promise<FacilityRead[]> =>
    api.get<FacilityRead[]>('/facilities/', { params }),

  /** Get a facility by ID */
  getById: (facilityId: string): Promise<FacilityRead> =>
    api.get<FacilityRead>(`/facilities/${facilityId}`),

  /** Get all cars for a facility */
  getCars: (facilityId: string): Promise<FacilityWithCars> =>
    api.get<FacilityWithCars>(`/facilities/${facilityId}/cars`),

  /** Update a facility */
  update: (facilityId: string, data: FacilityUpdate): Promise<FacilityRead> =>
    api.patch<FacilityRead>(`/facilities/${facilityId}`, data),

  /** Delete a facility */
  delete: (facilityId: string): Promise<void> =>
    api.delete<void>(`/facilities/${facilityId}`),
};
