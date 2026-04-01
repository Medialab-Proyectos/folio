import { api } from './client';
import type {
  PaginatedGarageSearchCars,
  PaginatedGarageSearchProjects,
  GarageSearchCarsParams,
  GarageSearchProjectsParams,
} from './types';

export const garageSearchApi = {
  /** Search cars with pagination and optional text search */
  searchCars: (params?: GarageSearchCarsParams): Promise<PaginatedGarageSearchCars> =>
    api.get<PaginatedGarageSearchCars>('/garage-search/cars', { params }),

  /** Search projects with pagination and optional filters */
  searchProjects: (params?: GarageSearchProjectsParams): Promise<PaginatedGarageSearchProjects> =>
    api.get<PaginatedGarageSearchProjects>('/garage-search/projects', { params }),
};
