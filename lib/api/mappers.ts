import { Vehicle, StaffUser, Client, Company, Facility, VehicleStatus } from '../types';
import { CarRead, CarCreate, CarUpdate, UserRead, CompanyRead, FacilityRead } from './types';

// ─── Car ↔ Vehicle ────────────────────────────────────────────────────────────
// Extra vehicle fields not in the Car model are stored as JSON in car.notes

interface CarExtra {
  color?: string;
  statusUpdatedAt?: string;
  initialDocumentation?: Vehicle['initialDocumentation'];
  originalNotes?: string;
  registrationCompleted?: boolean;
  createdAt?: string;
}

function isUUID(v?: string): v is string {
  return !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function parseCarExtra(notes?: string): CarExtra {
  if (!notes) return {};
  try {
    if (notes.startsWith('{')) return JSON.parse(notes);
  } catch {}
  return {};
}

export function carToVehicle(car: CarRead, defaultFacilityId?: string): Vehicle {
  const extra = parseCarExtra(car.nickname);
  return {
    id: car.id,
    facilityId: car.facility_id || defaultFacilityId || '',
    clientId: car.user_id || '',
    licensePlate: car.vin_number || '',
    make: car.make,
    model: car.model,
    color: extra.color || '',
    year: car.year,
    vin: car.vin || '',
    status: (car.location as VehicleStatus) || 'checked_out',
    statusUpdatedAt: extra.statusUpdatedAt || new Date().toISOString(),
    registrationExpDate: car.registration_date,
    insuranceExpDate: car.insurance_date,
    initialDocumentation: extra.initialDocumentation ?? {
      frontExterior: [],
      rearExterior: [],
      leftSide: [],
      rightSide: [],
      interior: [],
    },
    odometer: car.odometer,
    notes: extra.originalNotes,
    voiceRecord: car.voice ? String(car.voice) : undefined,
    registrationCompleted: extra.registrationCompleted ?? false,
    createdByStaffUserId: car.staff_user_id || '',
    createdAt: extra.createdAt || new Date().toISOString(),
  };
}

const FALLBACK_UUID = '00000000-0000-0000-0000-000000000000';

export function vehicleToCarCreate(v: Omit<Vehicle, 'id'>): CarCreate {
  const extra: CarExtra = {
    color: v.color,
    statusUpdatedAt: v.statusUpdatedAt,
    originalNotes: v.notes,
    registrationCompleted: v.registrationCompleted,
    createdAt: v.createdAt,
  };
  return {
    make: v.make,
    model: v.model,
    year: v.year,
    user_id: isUUID(v.clientId) ? v.clientId : FALLBACK_UUID,
    facility_id: isUUID(v.facilityId) ? v.facilityId : FALLBACK_UUID,
    staff_user_id: isUUID(v.createdByStaffUserId) ? v.createdByStaffUserId : FALLBACK_UUID,
    vin_number: v.licensePlate,
    vin: v.vin,
    odometer: v.odometer,
    nickname: JSON.stringify(extra),
    notes: 0,
    voice: 0,
    location: v.status,
    registration_date: v.registrationExpDate,
    insurance_date: v.insuranceExpDate,
  };
}

export function vehicleToCarUpdate(v: Partial<Vehicle>, existingNotes?: string): CarUpdate {
  // Merge extras so we don't overwrite unrelated fields in notes
  const existing = parseCarExtra(existingNotes);
  const extra: CarExtra = {
    ...existing,
    ...(v.color !== undefined && { color: v.color }),
    ...(v.statusUpdatedAt !== undefined && { statusUpdatedAt: v.statusUpdatedAt }),
    ...(v.notes !== undefined && { originalNotes: v.notes }),
    ...(v.registrationCompleted !== undefined && { registrationCompleted: v.registrationCompleted }),
  };
  return {
    ...(v.make && { make: v.make }),
    ...(v.model && { model: v.model }),
    ...(v.year && { year: v.year }),
    ...(v.licensePlate !== undefined && { vin_number: v.licensePlate }),
    ...(v.vin !== undefined && { vin: v.vin }),
    ...(v.odometer !== undefined && { odometer: v.odometer }),
    nickname: JSON.stringify(extra),
    ...(v.status !== undefined && { location: v.status }),
    ...(v.registrationExpDate !== undefined && { registration_date: v.registrationExpDate }),
    ...(v.insuranceExpDate !== undefined && { insurance_date: v.insuranceExpDate }),
    ...(v.voiceRecord !== undefined && { voice: 0 }),
    ...(v.clientId !== undefined && { user_id: isUUID(v.clientId) ? v.clientId : FALLBACK_UUID }),
    ...(v.facilityId !== undefined && { facility_id: isUUID(v.facilityId) ? v.facilityId : FALLBACK_UUID }),
    ...(v.createdByStaffUserId !== undefined && { staff_user_id: isUUID(v.createdByStaffUserId) ? v.createdByStaffUserId : FALLBACK_UUID }),
  };
}

// ─── User ↔ StaffUser / Client ────────────────────────────────────────────────

function splitName(fullName?: string): [string, string] {
  const parts = (fullName ?? '').trim().split(' ');
  return [parts[0] || '', parts.slice(1).join(' ')];
}

export function userToStaffUser(user: UserRead, defaultFacilityId?: string): StaffUser {
  const [firstName, lastName] = splitName(user.name);
  return {
    id: user.id,
    facilityId: isUUID(user.place) ? user.place : (defaultFacilityId || ''),
    role: user.type === 'super_user' ? 'super_user' : 'regular_user',
    firstName,
    lastName,
    phone: user.phone || '',
    email: user.email,
    status: 'active',
  };
}

export function userToClient(user: UserRead, defaultFacilityId?: string): Client {
  const [firstName, lastName] = splitName(user.name);
  return {
    id: user.id,
    facilityId: isUUID(user.place) ? user.place : (defaultFacilityId || ''),
    firstName,
    lastName,
    phone: user.phone || '',
    email: user.email,
    billingAddress: user.billing || '',
    memberSince: new Date().toISOString(),
    status: 'active',
  };
}

// ─── Company ─────────────────────────────────────────────────────────────────

export function companyReadToCompany(c: CompanyRead): Company {
  return {
    id: c.id,
    name: c.company_name,
    address: c.company_address || '',
    phone: c.company_phone || '',
    status: (c.company_status ?? 1) > 0 ? 'active' : 'inactive',
  };
}

// ─── Facility ─────────────────────────────────────────────────────────────────

export function facilityReadToFacility(f: FacilityRead): Facility {
  return {
    id: f.id,
    companyId: f.company_id,
    name: f.facility_name,
    type: 'other',
    address: f.facility_address || f.facility_location || '',
    phone: f.facility_phone || '',
    website: f.facility_web,
    capacity: { floorSpaces: 50, liftSpaces: 0 },
    status: (f.facility_status ?? 1) > 0 ? 'active' : 'inactive',
  };
}
