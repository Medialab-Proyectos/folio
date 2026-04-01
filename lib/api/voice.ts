import { api } from './client';
import type { VoiceRequest, VoiceResponse } from './types';

export const voiceApi = {
  /** Extract structured info from voice text (v1) */
  setVoice: (data: VoiceRequest): Promise<VoiceResponse> =>
    api.post<VoiceResponse>('/voice/set-voice', data, { auth: false }),

  /** Extract structured info from voice text (v2) */
  setVoiceV2: (data: VoiceRequest): Promise<VoiceResponse> =>
    api.post<VoiceResponse>('/voice/set-voice-1', data, { auth: false }),
};
