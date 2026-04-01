import { apiRequest } from './client';
import type { AICardBasicResponse, AICardDetailResponse } from './types';

export const aicardApi = {
  /** Basic car recognition from image (version 1) */
  analyze: (file: File): Promise<AICardBasicResponse> => {
    const form = new FormData();
    form.append('upload', file);
    return apiRequest<AICardBasicResponse>('/aicard/', {
      method: 'POST',
      body: form,
      auth: false,
    });
  },

  /** Basic car recognition from image (version 2) */
  analyzeV2: (file: File): Promise<AICardBasicResponse> => {
    const form = new FormData();
    form.append('upload', file);
    return apiRequest<AICardBasicResponse>('/aicard/version-2', {
      method: 'POST',
      body: form,
      auth: false,
    });
  },

  /** Detailed OpenAI car analysis */
  analyzeDetails: (file: File): Promise<AICardDetailResponse> => {
    const form = new FormData();
    form.append('upload', file);
    return apiRequest<AICardDetailResponse>('/aicard/openai/details', {
      method: 'POST',
      body: form,
      auth: false,
    });
  },

  /** Plate Recognizer analysis */
  analyzePlate: (file: File): Promise<Record<string, unknown>> => {
    const form = new FormData();
    form.append('upload', file);
    return apiRequest<Record<string, unknown>>('/aicard/apicards', {
      method: 'POST',
      body: form,
      auth: false,
    });
  },
};
