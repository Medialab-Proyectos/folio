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

// ─── Route backend survey photo URLs through Next.js proxy on the client ──────
// Avoids Mixed Content (HTTP image on HTTPS page) on Safari/iOS.
const BACKEND_ORIGIN = 'http://34.233.63.96:8001';
function formatSurveyPhotoUrl(path: string): string {
  if (typeof window === 'undefined') return path; // SSR: fine to use direct
  if (!path || path.startsWith('data:')) return path;
  if (path.startsWith(BACKEND_ORIGIN)) {
    return '/api/proxy/' + path.slice(BACKEND_ORIGIN.length).replace(/^\//, '');
  }
  if (path.startsWith('http')) return path; // external domain, leave as-is
  return '/api/proxy/' + path.replace(/^\//, '');
}

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

    const isValidUUID = (id: string | undefined) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');

    const isAdmin = staffUser.role === 'super_user';

    // ── Step 1: facilities + companies in parallel ─────────────────────────
    // Facilities must resolve before cars so we have the correct facilityId.
    // Admin users can list all; regular users fetch only their own facility.
    await Promise.allSettled([
      isAdmin
        ? companiesApi.list({ only_active: true }).then(list => {
            s.companies = list.map(companyReadToCompany);
            console.log('[GF] companies loaded:', list.length);
          }).catch(e => console.warn('[GF] companies error:', e?.message))
        : Promise.resolve(),

      isAdmin
        ? facilitiesApi.list({ only_active: true }).then(list => {
            s.facilities = list.map(facilityReadToFacility);
            console.log('[GF] facilities loaded:', list.length, list.map(f => f.id));
            if (!isValidUUID(staffUser.facilityId) && list.length > 0) {
              staffUser.facilityId = list[0].id;
              if (s.currentUser) s.currentUser.facilityId = list[0].id;
            }
          }).catch(e => console.warn('[GF] facilities error:', e?.message))
        : isValidUUID(user.place)
          ? facilitiesApi.getById(user.place!).then(f => {
              s.facilities = [facilityReadToFacility(f)];
              console.log('[GF] facility loaded (own):', f.id);
            }).catch(e => console.warn('[GF] facility getById error:', e?.message))
          : Promise.resolve(),
    ]);

    console.log('[GF] staffUser.facilityId after step 1:', staffUser.facilityId, 'isValid:', isValidUUID(staffUser.facilityId));

    // ── Step 2: cars + users in parallel (facilityId is now correct) ───────
    await Promise.allSettled([
      // Cars: try facilities/{id}/cars first (most complete), then /cars/, then /cars/me
      // Cars: Use carsApi.list({ items: 100 }) directly as it reliably returns the dataset
      (async () => {
        let items: any[] = [];
        try {
          const r = await carsApi.list({ items: 100 });
          items = r.items || [];
          console.log('[GF] /cars/ fallback items:', items.length);
        } catch (e: any) {
          console.warn('[GF] /cars/ error:', e?.message);
        }

        console.log('[GF] total vehicles after load:', items.length);

        let localPhotos: Record<string, any> = {};
        if (typeof window !== 'undefined') {
          try { localPhotos = JSON.parse(localStorage.getItem('GF_VEHICLE_PHOTOS') || '{}'); } catch {}
        }

        s.vehicles = items.map((c: any) => {
          const facilityId = c.facility_id || staffUser.facilityId;
          const v = carToVehicle({ ...c, facility_id: facilityId }, staffUser.facilityId);
          if (localPhotos[v.id]) v.initialDocumentation = localPhotos[v.id];
          return v;
        });

        // Background: load survey photos
        surveyCarsApi.list().then(surveyCarsData => {
          setStore(currentStore => {
            if (!currentStore) return currentStore;
            return {
              ...currentStore,
              vehicles: currentStore.vehicles.map(v => {
                const apiPhotos = (surveyCarsData as any[]).filter((sc: any) => sc.car_id === v.id);
                if (!localPhotos[v.id] && apiPhotos.length > 0) {
                  const validUrl = (sc: any) => sc.file_url && sc.file_url !== 'string';
                  const byPos = (pos: string) => apiPhotos
                    .filter((sc: any) => sc.view_position === pos && validUrl(sc))
                    .map((sc: any) => formatSurveyPhotoUrl(sc.file_url));
                  return {
                    ...v,
                    initialDocumentation: {
                      frontExterior: byPos('frontExterior'),
                      rearExterior: byPos('rearExterior'),
                      leftSide: byPos('leftSide'),
                      rightSide: byPos('rightSide'),
                      interior: byPos('interior'),
                    }
                  };
                }
                return v;
              })
            };
          });
        }).catch(() => {});
      })(),

      // Users → split into StaffUsers (admins) and Clients (members)
      // Only admin users can list all users; skip this call for regular users.
      isAdmin
        ? usersApi.list({ items: 100 }).then(({ items }) => {
            const adminTypes = ['admin', 'adminuser', 'super_user', 'AdminUser', 'Admin'];
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
              s.clients = s.clients.map(c => ({ ...c, facilityId: staffUser.facilityId }));
            }
          }).catch(() => {
            s.clients = s.clients.map(c => ({ ...c, facilityId: staffUser.facilityId }));
          })
        : Promise.resolve(),
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
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
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
      const facilityId = store.currentUser?.facilityId;
      const [listResult, meResult] = await Promise.allSettled([
        carsApi.list({ items: 100 }),
        carsApi.getMe(),
      ]);
      let items: any[] = [];
      if (listResult.status === 'fulfilled') {
        const r = listResult.value as any;
        const arr = Array.isArray(r) ? r : (r.items ?? r.data ?? []);
        if (arr.length > 0) items = arr;
      }
      if (items.length === 0 && meResult.status === 'fulfilled') {
        const r = meResult.value as any;
        items = Array.isArray(r) ? r : (r.data ?? r.items ?? []);
      }
      setStore(prev => {
        if (!prev) return prev;
        let localPhotos: Record<string, any> = {};
        if (typeof window !== 'undefined') {
          try { localPhotos = JSON.parse(localStorage.getItem('GF_VEHICLE_PHOTOS') || '{}'); } catch {}
        }
        return {
          ...prev,
          vehicles: items.map((c: any) => {
            const resolvedFacilityId = c.facility_id || facilityId;
            const v = carToVehicle({ ...c, facility_id: resolvedFacilityId }, facilityId);
            if (localPhotos[v.id]) {
              v.initialDocumentation = localPhotos[v.id];
            }
            return v;
          })
        };
      });

      // Background fetch for survey photos
      surveyCarsApi.list().then(surveyCarsData => {
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
                const validUrl = (sc: any) => sc.file_url && sc.file_url !== 'string';
                const byPos = (pos: string) => apiPhotos.filter((sc: any) => sc.view_position === pos && validUrl(sc)).map((sc: any) => formatSurveyPhotoUrl(sc.file_url));
                return {
                  ...v,
                  initialDocumentation: {
                    frontExterior: byPos('frontExterior'),
                    rearExterior: byPos('rearExterior'),
                    leftSide: byPos('leftSide'),
                    rightSide: byPos('rightSide'),
                    interior: byPos('interior'),
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
