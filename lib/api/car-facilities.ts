import { api } from './client';
import type { CarFacilityRead, CarFacilityCreate, CarFacilityUpdate, CarFacilityListParams } from './types';

export const carFacilitiesApi = {
  /** List car-facility relations */
  list: (params?: CarFacilityListParams): Promise<CarFacilityRead[]> =>
    api.get<CarFacilityRead[]>('/car-facilities/', { params }),

  /** Create a car-facility relation */
  create: (data: CarFacilityCreate): Promise<CarFacilityRead> =>
    api.post<CarFacilityRead>('/car-facilities/', data),

  /** Get a car-facility relation by ID */
  getById: (carFacilityId: string): Promise<CarFacilityRead> =>
    api.get<CarFacilityRead>(`/car-facilities/${carFacilityId}`),

  /** Update a car-facility relation */
  update: (carFacilityId: string, data: CarFacilityUpdate): Promise<CarFacilityRead> =>
    api.patch<CarFacilityRead>(`/car-facilities/${carFacilityId}`, data),

  /** Activate or deactivate a car-facility relation */
  toggleActive: (carFacilityId: string, status: 0 | 1): Promise<CarFacilityRead> =>
    api.patch<CarFacilityRead>(`/car-facilities/${carFacilityId}/activate-desactivate`, undefined, {
      params: { status },
    }),
};
