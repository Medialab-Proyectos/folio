import { api, apiRequest } from './client';
import type { RecordFilesRead, RecordFilesListIn, RecordFilesDeleteIn } from './types';

export const recordFilesApi = {
  /** List record files by project/record (POST body) */
  list: (body: RecordFilesListIn): Promise<RecordFilesRead[]> =>
    api.post<RecordFilesRead[]>('/record-files/list', body),

  /** Upload a new record file */
  create: (data: { project_id: string; record_id: string; file: File; record_file_status?: number }): Promise<RecordFilesRead> => {
    const form = new FormData();
    form.append('project_id', data.project_id);
    form.append('record_id', data.record_id);
    form.append('file', data.file);
    if (data.record_file_status !== undefined) form.append('record_file_status', String(data.record_file_status));
    return apiRequest<RecordFilesRead>('/record-files/', { method: 'POST', body: form });
  },

  /** Update a record file */
  update: (recordFileId: string, data: { project_id: string; record_id: string; file?: File; record_file_status?: number }): Promise<RecordFilesRead> => {
    const form = new FormData();
    form.append('project_id', data.project_id);
    form.append('record_id', data.record_id);
    if (data.file) form.append('file', data.file);
    if (data.record_file_status !== undefined) form.append('record_file_status', String(data.record_file_status));
    return apiRequest<RecordFilesRead>(`/record-files/${recordFileId}`, { method: 'PATCH', body: form });
  },

  /** Delete a record file */
  delete: (recordFileId: string, body: RecordFilesDeleteIn): Promise<void> =>
    apiRequest<void>(`/record-files/${recordFileId}`, { method: 'DELETE', body }),

  /** Activate or deactivate a record file */
  toggleActive: (recordFileId: string, recordFileStatus: 0 | 1): Promise<RecordFilesRead> =>
    api.patch<RecordFilesRead>(`/record-files/${recordFileId}/activate-desactivate`, undefined, {
      params: { record_file_status: recordFileStatus },
    }),
};
