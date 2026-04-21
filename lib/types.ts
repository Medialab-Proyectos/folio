// Data Models

export type CompanyStatus = 'active' | 'inactive';
export type FacilityType = 'private_storage' | 'dealer' | 'detailer' | 'event_space' | 'other';
export type FacilityStatus = 'active' | 'inactive';
export type StaffRole = 'super_user' | 'regular_user';
export type StaffStatus = 'active' | 'inactive';
export type ClientStatus = 'active' | 'inactive';
export type VehicleStatus = 'in_storage' | 'checked_out' | 'archived';
export type EventType = 'arrival_after_use' | 'departure_after_use';
export type DamageStatus = 'open' | 'fixed';
export type DamageSeverity = 'low' | 'medium' | 'high';
export type NotificationType = 
  | 'new_damage_recorded'
  | 'we_need_you_to_contact_us'
  | 'registration_expiring_30d'
  | 'insurance_expiring_30d'
  | 'registration_incomplete'
  | 'mass_communication';
export type NotificationStatus = 'sent' | 'scheduled' | 'draft';

export type CarPart = 
  | 'front_bumper'
  | 'rear_bumper'
  | 'hood'
  | 'roof'
  | 'trunk'
  | 'left_front_door'
  | 'left_rear_door'
  | 'right_front_door'
  | 'right_rear_door'
  | 'left_front_fender'
  | 'left_rear_fender'
  | 'right_front_fender'
  | 'right_rear_fender'
  | 'left_mirror'
  | 'right_mirror'
  | 'windshield'
  | 'rear_windshield';

export interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: CompanyStatus;
}

export interface Facility {
  id: string;
  companyId: string;
  name: string;
  type: FacilityType;
  address: string;
  phone: string;
  website?: string;
  capacity: {
    floorSpaces: number;
    liftSpaces: number;
  };
  rates?: string;
  status: FacilityStatus;
}

export interface StaffUser {
  id: string;
  facilityId: string;
  role: StaffRole;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: StaffStatus;
}

export interface Client {
  id: string;
  facilityId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  billingAddress: string;
  memberSince: string;
  status: ClientStatus;
  monthlyRate?: number;
}

export interface Vehicle {
  id: string;
  facilityId: string;
  clientId: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  year: number;
  vin: string;
  status: VehicleStatus;
  statusUpdatedAt: string;
  registrationExpDate?: string;
  insuranceExpDate?: string;
  initialDocumentation: {
    frontExterior: string[];
    rearExterior: string[];
    leftSide: string[];
    rightSide: string[];
    interior: string[];
  };
  odometer?: number;
  notes?: string;
  voiceRecord?: string;
  registrationCompleted: boolean;
  createdByStaffUserId: string;
  createdAt: string;
}

export interface VehicleEvent {
  id: string;
  eventType: EventType;
  vehicleId: string;
  facilityId: string;
  staffUserId: string;
  timestamp: string;
  damagesCaptured: string[];
  notes?: string;
  okParts?: string[];
  partData?: Record<string, { photos: string[]; notes: string; severity?: 'low' | 'medium' | 'high' }>;
}

export interface Damage {
  id: string;
  vehicleId: string;
  eventId?: string;
  status: DamageStatus;
  carPart: CarPart;
  severity: DamageSeverity;
  photos: string[];
  description?: string;
  createdAt: string;
  fixedAt?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  audience: 'individual' | 'all_clients';
  clientId?: string;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
  scheduledFor?: string;
}

export interface ActivityLog {
  id: string;
  entityType: 'company' | 'facility' | 'staff' | 'client' | 'vehicle' | 'damage' | 'notification';
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Derived data types
export interface ClientWithVehicles extends Client {
  totalVehicles: number;
  inStorageCount: number;
  checkedOutCount: number;
}

export interface DashboardKPIs {
  totalInventory: number;
  totalOccupancy: number;
  checkIns24h: number;
  checkOuts24h: number;
  availableSpace: number;
  facilityCapacity: number;
}
