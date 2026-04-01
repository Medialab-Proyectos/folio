// Mock Data Store with localStorage persistence
import { 
  Company, 
  Facility, 
  StaffUser, 
  Client, 
  Vehicle, 
  VehicleEvent, 
  Damage, 
  Notification,
  ActivityLog 
} from '../types';
import { generateSeedData } from './seed-data';

const STORAGE_KEY = 'GF_ENTERPRISE_DATA_V3'; // Changed key to force fresh start with new vehicle distribution
const STORAGE_VERSION = '3.0.0'; // Major version bump - more checked_out vehicles for testing

export interface DataStore {
  version: string;
  companies: Company[];
  facilities: Facility[];
  staffUsers: StaffUser[];
  clients: Client[];
  vehicles: Vehicle[];
  vehicleEvents: VehicleEvent[];
  damages: Damage[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  currentUser: StaffUser | null;
  settings: {
    brandMode: 'black' | 'white';
    slowNetworkMode: boolean;
    randomErrorMode: boolean;
    capacityFullMode: boolean;
  };
}

let store: DataStore | null = null;
let isInitializing = false;

function createEmptyStore(): DataStore {
  return {
    version: STORAGE_VERSION,
    companies: [],
    facilities: [],
    staffUsers: [],
    clients: [],
    vehicles: [],
    vehicleEvents: [],
    damages: [],
    notifications: [],
    activityLogs: [],
    currentUser: null,
    settings: {
      brandMode: 'black',
      slowNetworkMode: false,
      randomErrorMode: false,
      capacityFullMode: false,
    },
  };
}

function initializeStoreSync(): DataStore {
  if (isInitializing) {
    return createEmptyStore();
  }
  
  isInitializing = true;
  
  try {
    const seedData = generateSeedData();
    
    const newStore: DataStore = {
      version: STORAGE_VERSION,
      ...seedData,
      currentUser: null,
      settings: {
        brandMode: 'black',
        slowNetworkMode: false,
        randomErrorMode: false,
        capacityFullMode: false,
      },
    };
    
    store = newStore;
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
    
    return newStore;
  } finally {
    isInitializing = false;
  }
}

function loadFromLocalStorageSync(): DataStore {
  // Server-side: always initialize fresh
  if (typeof window === 'undefined') {
    return initializeStoreSync();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version === STORAGE_VERSION) {
        store = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }

  return initializeStoreSync();
}

export function getStore(): DataStore {
  if (store) {
    return store;
  }
  
  if (isInitializing) {
    return createEmptyStore();
  }
  
  store = loadFromLocalStorageSync();
  return store;
}

export function saveStore(data?: Partial<DataStore>): void {
  if (isInitializing) {
    return; // Don't save during initialization
  }
  
  if (data && store) {
    store = { ...store, ...data };
  }
  
  if (typeof window !== 'undefined' && store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }
}

export function resetStore(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  
  store = null;
  isInitializing = false;
  store = initializeStoreSync();
}

// Simulate network delay
export async function simulateDelay(ms: number = 300): Promise<void> {
  if (store && store.settings?.slowNetworkMode) {
    await new Promise(resolve => setTimeout(resolve, 1500));
  } else {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Simulate random errors
export function checkRandomError(): void {
  if (store && store.settings?.randomErrorMode && Math.random() < 0.05) {
    throw new Error('Simulated network error');
  }
}
