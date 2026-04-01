'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';
import { carsApi } from '../api/cars';
import { companiesApi } from '../api/companies';
import { facilitiesApi } from '../api/facilities';
import { surveyCarsApi } from '../api/survey-cars';
import { tokens } from '../api/client';
import {
  carToVehicle,
  userToStaffUser,
  userToClient,
  companyReadToCompany,
  facilityReadToFacility,
} from '../api/mappers';
import { StaffUser, Vehicle, Client, Damage, VehicleEvent, Notification, ActivityLog, Company, Facility } from '../types';
import { getLocalStore, saveLocalStore } from '../store/local-store';
import { UserRead } from '../api/types';

// ─── Store shape (compatible with existing pages) ─────────────────────────────

export interface AppStore {
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

// ─── Context type ─────────────────────────────────────────────────────────────

interface AppContextType {
  store: AppStore;
  currentUser: StaffUser | null;
  currentFacility: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshStore: () => void;
  refreshVehicles: () => Promise<void>;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  // Local-only mutations (no API equivalent)
  addClient: (client: Client) => void;
  setVehicleEvents: (events: VehicleEvent[]) => void;
  setDamages: (damages: Damage[]) => void;
  setNotifications: (notifications: Notification[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyStore(): AppStore {
  return {
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
    settings: { brandMode: 'black', slowNetworkMode: false, randomErrorMode: false, capacityFullMode: false },
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<AppStore | null>(null);
  const [currentUserApi, setCurrentUserApi] = useState<UserRead | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── Load all data after a successful login ─────────────────────────────────
  const loadData = useCallback(async (user: UserRead): Promise<AppStore> => {
    const local = getLocalStore();
    const s: AppStore = { ...emptyStore(), ...local };

    // Determine facility from user.place (used as facilityId)
    const staffUser = userToStaffUser(user);
    s.currentUser = staffUser;
    s.staffUsers = [staffUser];

    await Promise.allSettled([
      // Companies
      companiesApi.list({ only_active: true }).then(list => {
        s.companies = list.map(companyReadToCompany);
      }),
      // Facilities
      facilitiesApi.list({ only_active: true }).then(list => {
        s.facilities = list.map(facilityReadToFacility);
        // If facilityId not set on user or is invalid UUID, use first facility
        const isValidUUID = (id: string | undefined) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
        if (!isValidUUID(staffUser.facilityId) && list.length > 0) {
          staffUser.facilityId = list[0].id;
          if (s.currentUser) s.currentUser.facilityId = list[0].id;
        }
      }),
      // Cars → Vehicles (Load cars first without blocking on surveys)
      carsApi.list({ items: 100 }).then(({ items }) => {
        let localPhotos: Record<string, any> = {};
        if (typeof window !== 'undefined') {
          try { localPhotos = JSON.parse(localStorage.getItem('GF_VEHICLE_PHOTOS') || '{}'); } catch {}
        }
        
        s.vehicles = items.map((c: any) => {
          const v = carToVehicle(c, staffUser.facilityId);
          if (localPhotos[v.id]) {
            v.initialDocumentation = localPhotos[v.id];
          }
          return v;
        });

        // Background fetch for authenticated backend photos
        surveyCarsApi.list().then(surveyCarsData => {
          const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.BACKEND_URL ?? 'http://52.90.109.124:8001');
          setStore(currentStore => {
            if (!currentStore) return currentStore;
            return {
              ...currentStore,
              vehicles: currentStore.vehicles.map(v => {
                const apiPhotos = (surveyCarsData as any[]).filter((sc: any) => sc.car_id === v.id);
                // Only override if we don't have local photos and API photos exist
                if (!localPhotos[v.id] && apiPhotos.length > 0) {
                  const formatPath = (path: string) => path.startsWith('http') ? path : `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
                  return {
                    ...v,
                    initialDocumentation: {
                      frontExterior: apiPhotos.filter((sc: any) => sc.view_position === 'frontExterior' && sc.file_url && sc.file_url !== 'string').map((sc: any) => formatPath(sc.file_url)),
                      rearExterior: apiPhotos.filter((sc: any) => sc.view_position === 'rearExterior' && sc.file_url && sc.file_url !== 'string').map((sc: any) => formatPath(sc.file_url)),
                      leftSide: apiPhotos.filter((sc: any) => sc.view_position === 'leftSide' && sc.file_url && sc.file_url !== 'string').map((sc: any) => formatPath(sc.file_url)),
                      rightSide: apiPhotos.filter((sc: any) => sc.view_position === 'rightSide' && sc.file_url && sc.file_url !== 'string').map((sc: any) => formatPath(sc.file_url)),
                      interior: apiPhotos.filter((sc: any) => sc.view_position === 'interior' && sc.file_url && sc.file_url !== 'string').map((sc: any) => formatPath(sc.file_url)),
                    }
                  };
                }
                return v;
              })
            };
          });
        }).catch(() => {});
      }),
        // Users → split into StaffUsers (admins) and Clients (members)
      usersApi.list({ items: 100 }).then(({ items }) => {
        const adminTypes = ['admin', 'adminuser', 'super_user'];
        const staff = items
          .filter(u => adminTypes.includes(u.type || ''))
          .map(u => userToStaffUser(u, staffUser.facilityId));
        const apiClients = items
          .filter(u => !adminTypes.includes(u.type || ''))
          .map(u => userToClient(u, staffUser.facilityId));

        if (staff.length > 0) s.staffUsers = staff;
        if (apiClients.length > 0) {
          s.clients = apiClients;
        } else {
          // If no clients in API, ensure local mock clients use the correct facilityId
          s.clients = s.clients.map(c => ({
            ...c,
            facilityId: staffUser.facilityId
          }));
        }
      }).catch(() => {
        // If API fails, also ensure local mock clients match the facility
        s.clients = s.clients.map(c => ({
          ...c,
          facilityId: staffUser.facilityId
        }));
      }),
    ]);

    return s;
  }, []);

  // ─── Bootstrap: check for existing token ───────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = tokens.getAccess();
      if (token) {
        try {
          const user = await usersApi.me();
          setCurrentUserApi(user);
          const data = await loadData(user);
          setStore(data);
        } catch {
          tokens.clear();
          setStore(emptyStore());
        }
      } else {
        setStore(emptyStore());
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auth ───────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      await authApi.login({ email, password });
      const user = await usersApi.me();
      setCurrentUserApi(user);
      const data = await loadData(user);
      setStore(data);
      return true;
    } catch {
      return false;
    }
  }, [loadData]);

  const logout = useCallback(() => {
    const rt = tokens.getRefresh();
    if (rt) {
      authApi.logout({ refresh_token: rt }).catch(() => tokens.clear());
    } else {
      tokens.clear();
    }
    setCurrentUserApi(null);
    setStore(emptyStore());
  }, []);

  // ─── Refresh ────────────────────────────────────────────────────────────────

  const refreshStore = useCallback(() => {
    if (!currentUserApi) return;
    loadData(currentUserApi).then(setStore);
  }, [currentUserApi, loadData]);

  const refreshVehicles = useCallback(async () => {
    if (!store) return;
    try {
      const { items } = await carsApi.list({ items: 100 });
      const facilityId = store.currentUser?.facilityId;
      setStore(prev => {
        if (!prev) return prev;
        let localPhotos: Record<string, any> = {};
        if (typeof window !== 'undefined') {
          try { localPhotos = JSON.parse(localStorage.getItem('GF_VEHICLE_PHOTOS') || '{}'); } catch {}
        }
        
        return {
          ...prev,
          vehicles: items.map((c: any) => {
            const v = carToVehicle(c, facilityId);
            if (localPhotos[v.id]) {
              v.initialDocumentation = localPhotos[v.id];
            }
            return v;
          })
        };
      });

      // Background fetch for survey photos
      surveyCarsApi.list().then(surveyCarsData => {
        const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.BACKEND_URL ?? 'http://52.90.109.124:8001');
        let localPhotos: Record<string, any> = {};
        if (typeof window !== 'undefined') {
          try { localPhotos = JSON.parse(localStorage.getItem('GF_VEHICLE_PHOTOS') || '{}'); } catch {}
        }
        
        setStore(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            vehicles: prev.vehicles.map(v => {
              const apiPhotos = (surveyCarsData as any[]).filter((sc: any) => sc.car_id === v.id);
              if (!localPhotos[v.id] && apiPhotos.length > 0) {
                const formatPath = (path: string) => path.startsWith('http') ? path : `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
                return {
                  ...v,
                  initialDocumentation: {
                    frontExterior: apiPhotos.filter((sc: any) => sc.view_position === 'frontExterior' && sc.file_url && sc.file_url !== 'string').map((sc: any) => formatPath(sc.file_url)),
                    rearExterior: apiPhotos.filter((sc: any) => sc.view_position === 'rearExterior' && sc.file_url && sc.file_url !== 'string').map((sc: any) => formatPath(sc.file_url)),
                    leftSide: apiPhotos.filter((sc: any) => sc.view_position === 'leftSide' && sc.file_url && sc.file_url !== 'string').map((sc: any) => formatPath(sc.file_url)),
                    rightSide: apiPhotos.filter((sc: any) => sc.view_position === 'rightSide' && sc.file_url && sc.file_url !== 'string').map((sc: any) => formatPath(sc.file_url)),
                    interior: apiPhotos.filter((sc: any) => sc.view_position === 'interior' && sc.file_url && sc.file_url !== 'string').map((sc: any) => formatPath(sc.file_url)),
                  }
                };
              }
              return v;
            })
          };
        });
      }).catch(() => {});
    } catch {}
  }, [store]);

  // ─── Activity log ────────────────────────────────────────────────────────────

  const addActivityLog = useCallback((log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    setStore(prev => {
      if (!prev) return prev;
      const activityLogs = [newLog, ...prev.activityLogs];
      saveLocalStore({ activityLogs });
      return { ...prev, activityLogs };
    });
  }, []);

  // ─── Add a client directly to store and persist locally ─────────────────────
  const addClient = useCallback((client: Client) => {
    setStore(prev => {
      if (!prev) return prev;
      const clients = [...prev.clients, client];
      saveLocalStore({ clients });
      return { ...prev, clients };
    });
  }, []);

  // ─── Local-only mutations ────────────────────────────────────────────────────

  const setVehicleEvents = useCallback((vehicleEvents: VehicleEvent[]) => {
    saveLocalStore({ vehicleEvents });
    setStore(prev => prev ? { ...prev, vehicleEvents } : prev);
  }, []);

  const setDamages = useCallback((damages: Damage[]) => {
    saveLocalStore({ damages });
    setStore(prev => prev ? { ...prev, damages } : prev);
  }, []);

  const setNotifications = useCallback((notifications: Notification[]) => {
    saveLocalStore({ notifications });
    setStore(prev => prev ? { ...prev, notifications } : prev);
  }, []);

  // ─── Loading state ───────────────────────────────────────────────────────────

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading GarageFolio...</p>
        </div>
      </div>
    );
  }

  const value: AppContextType = {
    store,
    currentUser: store.currentUser,
    currentFacility: store.currentUser?.facilityId || null,
    login,
    logout,
    refreshStore,
    refreshVehicles,
    addActivityLog,
    showToast,
    addClient,
    setVehicleEvents,
    setDamages,
    setNotifications,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success' ? 'bg-success text-success-foreground' :
            toast.type === 'error' ? 'bg-destructive text-destructive-foreground' :
            'bg-foreground text-background'
          }`}
        >
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
