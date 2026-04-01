// Stores data that has no API endpoint: damages, vehicle events, notifications, activity logs
import { Damage, VehicleEvent, Notification, ActivityLog, Client } from '../types';

const LOCAL_KEY = 'GF_LOCAL_V1';

export interface LocalStore {
  damages: Damage[];
  vehicleEvents: VehicleEvent[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  clients: Client[];
}

function empty(): LocalStore {
  return { damages: [], vehicleEvents: [], notifications: [], activityLogs: [], clients: [] };
}

export function getLocalStore(): LocalStore {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch {}
  return empty();
}

export function saveLocalStore(data: Partial<LocalStore>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalStore();
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...current, ...data }));
  } catch {}
}
