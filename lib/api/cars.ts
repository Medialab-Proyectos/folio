import { api } from './client';
import type {
  CarCreate,
  CarRead,
  CarReadWithFileUrl,
  CarUpdate,
  PaginatedCars,
  PaginatedDataResponse,
  CarListParams,
  ProjectRead,
} from './types';

export const carsApi = {
  /** List cars with optional filters and pagination */
  list: (params?: CarListParams): Promise<PaginatedCars> =>
    api.get<PaginatedCars>('/cars/', { params: params as Record<string, string | number | boolean | undefined | null> }),

  /** Get current authenticated user's cars */
  getMe: (): Promise<PaginatedDataResponse<CarReadWithFileUrl>> =>
    api.get<PaginatedDataResponse<CarReadWithFileUrl>>('/cars/me'),

  /** Create a new car */
  create: (data: CarCreate): Promise<CarRead> =>
    api.post<CarRead>('/cars/', data),

  /** Get a car by ID */
  getById: (carId: string): Promise<CarRead> =>
    api.get<CarRead>(`/cars/${carId}`),

  /** Update a car */
  update: (carId: string, data: CarUpdate): Promise<CarRead> =>
    api.patch<CarRead>(`/cars/${carId}`, data),

  /** Activate or deactivate a car */
  toggleActive: (carId: string, carStatus: 0 | 1): Promise<CarRead> =>
    api.patch<CarRead>(`/cars/${carId}/activate-desactivate`, undefined, {
      params: { car_status: carStatus },
    }),

  /** Get all projects associated with a specific car */
  getProjects: (carId: string): Promise<ProjectRead[]> =>
    api.get<ProjectRead[]>(`/cars/${carId}/projects`),
};
