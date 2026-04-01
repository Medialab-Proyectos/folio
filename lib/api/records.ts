import { api, apiRequest } from './client';
import type { RecordRead, RecordCreate, RecordUpdate, RecordListParams } from './types';

export const recordsApi = {
  /** List records, optionally filtered by project_id */
  list: (params?: RecordListParams): Promise<RecordRead[]> =>
    api.get<RecordRead[]>('/records/', { params }),

  /** Create a new record (supports file uploads) */
  create: (data: RecordCreate): Promise<RecordRead> => {
    const form = new FormData();
    form.append('project_id', data.project_id);
    form.append('title', data.title);
    form.append('date', data.date);
    form.append('cost', String(data.cost));
    form.append('description', data.description);
    if (data.notes !== undefined) form.append('notes', data.notes);
    if (data.record_status !== undefined) form.append('record_status', String(data.record_status));
    if (data.file) form.append('file', data.file);
    if (data.files) data.files.forEach((f) => form.append('files', f));
    return apiRequest<RecordRead>('/records/', { method: 'POST', body: form });
  },

  /** Get a record by ID */
  getById: (recordId: string): Promise<RecordRead> =>
    api.get<RecordRead>(`/records/${recordId}`),

  /** Update a record */
  update: (recordId: string, data: RecordUpdate): Promise<RecordRead> =>
    api.patch<RecordRead>(`/records/${recordId}`, data),

  /** Delete a record */
  delete: (recordId: string): Promise<void> =>
    api.delete<void>(`/records/${recordId}`),

  /** Activate or deactivate a record */
  toggleActive: (recordId: string, recordStatus: 0 | 1): Promise<RecordRead> =>
    api.patch<RecordRead>(`/records/${recordId}/activate-desactivate`, undefined, {
      params: { record_status: recordStatus },
    }),
};
