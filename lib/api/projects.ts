import { api } from './client';
import type {
  ProjectCreate,
  ProjectRead,
  ProjectUpdate,
  PaginatedProjects,
  ProjectListParams,
  ProjectTypeRead,
  ProjectStatusRead,
} from './types';

export const projectsApi = {
  /** List projects with optional filters and pagination */
  list: (params?: ProjectListParams): Promise<PaginatedProjects> =>
    api.get<PaginatedProjects>('/projects/', { params }),

  /** Create a new project */
  create: (data: ProjectCreate): Promise<ProjectRead> =>
    api.post<ProjectRead>('/projects/', data),

  /** Get a project by ID */
  getById: (projectId: string): Promise<ProjectRead> =>
    api.get<ProjectRead>(`/projects/${projectId}`),

  /** Update a project */
  update: (projectId: string, data: ProjectUpdate): Promise<ProjectRead> =>
    api.patch<ProjectRead>(`/projects/${projectId}`, data),

  /** Activate or deactivate a project */
  toggleActive: (projectId: string, projectStatus: 0 | 1): Promise<ProjectRead> =>
    api.patch<ProjectRead>(`/projects/${projectId}/activate-desactivate`, undefined, {
      params: { project_status: projectStatus },
    }),

  /** List active project types */
  listTypes: (): Promise<ProjectTypeRead[]> =>
    api.get<ProjectTypeRead[]>('/projects/types'),

  /** List active project statuses */
  listStatuses: (): Promise<ProjectStatusRead[]> =>
    api.get<ProjectStatusRead[]>('/projects/statuses'),
};
