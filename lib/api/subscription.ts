import { api } from './client';
import type { SubscriptionRead } from './types';

export const subscriptionApi = {
  /** Create default subscription (Collector) for the current user */
  createDefault: (): Promise<SubscriptionRead> =>
    api.post<SubscriptionRead>('/subscription/default'),
};
