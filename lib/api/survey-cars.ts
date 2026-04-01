import { api, apiRequest } from './client';
import type { SurveyCarRead, SurveyCarCreate, SurveyCarUpdate, SurveyCarListParams } from './types';

export const surveyCarsApi = {
  /** List survey cars, optionally filtered by car_id */
  list: (params?: SurveyCarListParams): Promise<SurveyCarRead[]> =>
    api.get<SurveyCarRead[]>('/survey-cars/', { params }),

  /** Create a new survey car (supports image upload) */
  create: (data: SurveyCarCreate): Promise<SurveyCarRead> => {
    const form = new FormData();
    form.append('car_id', data.car_id);
    form.append('view_position', data.view_position);
    if (data.survey_car_status !== undefined) form.append('survey_car_status', String(data.survey_car_status));
    if (data.image) form.append('image', data.image);
    return apiRequest<SurveyCarRead>('/survey-cars/', { method: 'POST', body: form });
  },

  /** Get a survey car by ID */
  getById: (surveyId: string): Promise<SurveyCarRead> =>
    api.get<SurveyCarRead>(`/survey-cars/${surveyId}`),

  /** Update a survey car */
  update: (surveyId: string, data: SurveyCarUpdate): Promise<SurveyCarRead> => {
    const form = new FormData();
    if (data.view_position !== undefined) form.append('view_position', data.view_position);
    if (data.survey_car_status !== undefined) form.append('survey_car_status', String(data.survey_car_status));
    if (data.image) form.append('image', data.image);
    return apiRequest<SurveyCarRead>(`/survey-cars/${surveyId}`, { method: 'PATCH', body: form });
  },

  /** Delete a survey car */
  delete: (surveyId: string): Promise<void> =>
    api.delete<void>(`/survey-cars/${surveyId}`),

  /** Activate or deactivate a survey car */
  toggleActive: (surveyId: string, surveyCaStatus: 0 | 1): Promise<SurveyCarRead> =>
    api.patch<SurveyCarRead>(`/survey-cars/${surveyId}/activate-desactivate`, undefined, {
      params: { survey_car_status: surveyCaStatus },
    }),
};
