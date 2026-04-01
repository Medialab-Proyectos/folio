import { apiRequest } from './client';
import type { DocumentAnalysisResponse } from './types';

export const documentApi = {
  /** Analyze invoice from images (jpeg, jpg, png, heic/heif) */
  analyzeInvoiceImages: (files: File[]): Promise<DocumentAnalysisResponse> => {
    const form = new FormData();
    files.forEach((f) => form.append('file', f));
    return apiRequest<DocumentAnalysisResponse>('/document/invoice-image', {
      method: 'POST',
      body: form,
      auth: false,
    });
  },

  /** Analyze invoice from PDF */
  analyzeInvoicePDF: (file: File): Promise<DocumentAnalysisResponse> => {
    const form = new FormData();
    form.append('file', file);
    return apiRequest<DocumentAnalysisResponse>('/document/invoice-pdf', {
      method: 'POST',
      body: form,
      auth: false,
    });
  },

  /** Analyze invoice from images (v1) */
  analyzeInvoiceImagesV1: (files: File[]): Promise<DocumentAnalysisResponse> => {
    const form = new FormData();
    files.forEach((f) => form.append('file', f));
    return apiRequest<DocumentAnalysisResponse>('/document/invoice-image-version-1', {
      method: 'POST',
      body: form,
      auth: false,
    });
  },

  /** Analyze invoice from PDF (v1) */
  analyzeInvoicePDFV1: (file: File): Promise<DocumentAnalysisResponse> => {
    const form = new FormData();
    form.append('file', file);
    return apiRequest<DocumentAnalysisResponse>('/document/invoice-pdf-version-1', {
      method: 'POST',
      body: form,
      auth: false,
    });
  },
};
