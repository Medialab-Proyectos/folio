import {
  Company,
  Facility,
  StaffUser,
  Client,
  Vehicle,
  VehicleEvent,
  Damage,
  Notification,
  ActivityLog,
} from '../types';

// Helper generators
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function randomPlate(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  return (
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    numbers[Math.floor(Math.random() * numbers.length)]
  );
}

export function randomVIN(): string {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin;
}

const carMakes = [
  { make: 'Porsche', models: ['911', 'Taycan', 'Cayenne', 'Macan'] },
  { make: 'Ferrari', models: ['488', 'F8 Tributo', 'SF90', '812'] },
  { make: 'Lamborghini', models: ['Huracán', 'Aventador', 'Urus'] },
  { make: 'BMW', models: ['M3', 'M5', 'X5 M', 'i8'] },
  { make: 'Mercedes-Benz', models: ['AMG GT', 'S-Class', 'G-Class', 'E63'] },
  { make: 'Audi', models: ['R8', 'RS6', 'RS7', 'e-tron GT'] },
  { make: 'Chevrolet', models: ['Corvette', 'Camaro', 'Suburban'] },
  { make: 'Ford', models: ['Mustang', 'GT', 'Raptor', 'Bronco'] },
  { make: 'Tesla', models: ['Model S', 'Model X', 'Model 3', 'Roadster'] },
  { make: 'McLaren', models: ['720S', '765LT', 'Artura'] },
];

const colors = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Gray', 'Yellow', 'Green', 'Orange'];

export function randomCarMakeModel(): { make: string; model: string } {
  const car = carMakes[Math.floor(Math.random() * carMakes.length)];
  const model = car.models[Math.floor(Math.random() * car.models.length)];
  return { make: car.make, model };
}

export function randomColor(): string {
  return colors[Math.floor(Math.random() * colors.length)];
}

export function randomYear(): number {
  return Math.floor(Math.random() * (2024 - 1965 + 1)) + 1965;
}

export function randomPhone(): string {
  return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
}

export function randomEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
}

export function randomDateInRange(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
}

const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];

export function randomName(): { firstName: string; lastName: string } {
  return {
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
  };
}

export function generateSeedData() {
  // 1 Company
  const companies: Company[] = [
    {
      id: 'company_1',
      name: 'GarageFolio Enterprise Demo',
      address: '100 Demo Plaza, Suite 500, Miami, FL 33131',
      phone: randomPhone(),
      status: 'active',
    },
  ];

  // 3 Facilities
  const facilities: Facility[] = [
    {
      id: 'facility_miami',
      companyId: 'company_1',
      name: 'Miami Facility',
      type: 'private_storage',
      address: '200 Storage Way, Miami, FL 33132',
      phone: randomPhone(),
      website: 'https://miami.garagefolio.com',
      capacity: { floorSpaces: 80, liftSpaces: 10 },
      rates: '$500/month',
      status: 'active',
    },
    {
      id: 'facility_dallas',
      companyId: 'company_1',
      name: 'Dallas Facility',
      type: 'dealer',
      address: '300 Dealer Drive, Dallas, TX 75201',
      phone: randomPhone(),
      capacity: { floorSpaces: 50, liftSpaces: 5 },
      rates: '$450/month',
      status: 'active',
    },
    {
      id: 'facility_la',
      companyId: 'company_1',
      name: 'Los Angeles Facility',
      type: 'private_storage',
      address: '400 Premium Blvd, Los Angeles, CA 90001',
      phone: randomPhone(),
      capacity: { floorSpaces: 120, liftSpaces: 15 },
      rates: '$600/month',
      status: 'active',
    },
  ];

  // 12 Staff Users
  const staffUsers: StaffUser[] = [
    {
      id: 'staff_1',
      facilityId: 'facility_miami',
      role: 'super_user',
      firstName: 'Admin',
      lastName: 'User',
      phone: randomPhone(),
      email: 'admin@garagefolio.com',
      status: 'active',
    },
  ];

  for (let i = 2; i <= 12; i++) {
    const { firstName, lastName } = randomName();
    const facilityId = i <= 5 ? 'facility_miami' : i <= 8 ? 'facility_dallas' : 'facility_la';
    staffUsers.push({
      id: `staff_${i}`,
      facilityId,
      role: 'regular_user',
      firstName,
      lastName,
      phone: randomPhone(),
      email: randomEmail(firstName, lastName),
      status: i > 11 ? 'inactive' : 'active',
    });
  }

  // 50 Clients
  const clients: Client[] = [];
  for (let i = 1; i <= 50; i++) {
    const { firstName, lastName } = randomName();
    const facilityId = i <= 20 ? 'facility_miami' : i <= 35 ? 'facility_dallas' : 'facility_la';
    clients.push({
      id: `client_${i}`,
      facilityId,
      firstName,
      lastName,
      phone: randomPhone(),
      email: randomEmail(firstName, lastName),
      billingAddress: `${100 + i} Main St, City, ST ${10000 + i}`,
      memberSince: randomDateInRange(730),
      status: i > 45 ? 'inactive' : 'active',
      monthlyRate: Math.floor(Math.random() * 300) + 400,
    });
  }

  // 150 Vehicles
  const vehicles: Vehicle[] = [];
  const vehicleStatuses: Array<'in_storage' | 'checked_out' | 'archived'> = [];
  
  // Better distribution: 45 in_storage, 65 checked_out, 10 archived, 30 incomplete
  for (let i = 1; i <= 45; i++) vehicleStatuses.push('in_storage');
  for (let i = 1; i <= 65; i++) vehicleStatuses.push('checked_out');
  for (let i = 1; i <= 10; i++) vehicleStatuses.push('archived');
  for (let i = 1; i <= 30; i++) vehicleStatuses.push('in_storage'); // For incomplete registrations
  
  for (let i = 0; i < 150; i++) {
    const { make, model } = randomCarMakeModel();
    const clientIndex = Math.floor(i / 3);
    const client = clients[Math.min(clientIndex, clients.length - 1)];
    const isIncomplete = i >= 120;
    
    vehicles.push({
      id: `vehicle_${i + 1}`,
      facilityId: client.facilityId,
      clientId: client.id,
      licensePlate: randomPlate(),
      make,
      model,
      color: randomColor(),
      year: randomYear(),
      vin: randomVIN(),
      status: vehicleStatuses[i],
      statusUpdatedAt: randomDateInRange(30),
      registrationExpDate: isIncomplete ? undefined : randomDateInRange(-365),
      insuranceExpDate: isIncomplete ? undefined : randomDateInRange(-365),
      initialDocumentation: {
        frontExterior: isIncomplete ? [] : ['photo_url_1'],
        rearExterior: isIncomplete ? [] : ['photo_url_2'],
        leftSide: isIncomplete ? [] : ['photo_url_3'],
        rightSide: isIncomplete ? [] : ['photo_url_4'],
        interior: [],
      },
      odometer: isIncomplete ? undefined : Math.floor(Math.random() * 100000) + 1000,
      notes: '',
      registrationCompleted: !isIncomplete,
      createdByStaffUserId: 'staff_1',
      createdAt: randomDateInRange(180),
    });
  }

  // 200 Vehicle Events
  const vehicleEvents: VehicleEvent[] = [];
  const completedVehicles = vehicles.filter(v => v.registrationCompleted);
  
  for (let i = 0; i < 200; i++) {
    const vehicle = completedVehicles[Math.floor(Math.random() * completedVehicles.length)];
    vehicleEvents.push({
      id: `event_${i + 1}`,
      eventType: i % 2 === 0 ? 'arrival_after_use' : 'departure_after_use',
      vehicleId: vehicle.id,
      facilityId: vehicle.facilityId,
      staffUserId: 'staff_1',
      timestamp: randomDateInRange(60),
      damagesCaptured: [],
      notes: '',
    });
  }

  // 80 Damages
  const damages: Damage[] = [];
  const damageParts: Array<any> = [
    'front_bumper', 'rear_bumper', 'hood', 'roof', 'trunk',
    'left_front_door', 'left_rear_door', 'right_front_door', 'right_rear_door',
  ];
  
  for (let i = 0; i < 80; i++) {
    const vehicle = completedVehicles[Math.floor(Math.random() * completedVehicles.length)];
    const part = damageParts[Math.floor(Math.random() * damageParts.length)];
    
    damages.push({
      id: `damage_${i + 1}`,
      vehicleId: vehicle.id,
      eventId: vehicleEvents[i % vehicleEvents.length]?.id,
      status: i < 40 ? 'open' : 'fixed',
      carPart: part,
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      photos: ['damage_photo_1'],
      description: 'Minor scratch detected during inspection',
      createdAt: randomDateInRange(60),
      fixedAt: i >= 40 ? randomDateInRange(30) : undefined,
    });
  }

  // 20 Notifications
  const notifications: Notification[] = [];
  
  for (let i = 0; i < 20; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const types: Array<any> = [
      'new_damage_recorded',
      'we_need_you_to_contact_us',
      'registration_expiring_30d',
      'insurance_expiring_30d',
      'registration_incomplete',
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    notifications.push({
      id: `notification_${i + 1}`,
      type,
      audience: i < 15 ? 'individual' : 'all_clients',
      clientId: i < 15 ? client.id : undefined,
      title: type === 'new_damage_recorded' ? 'New Damage Recorded' : 
             type === 'registration_incomplete' ? 'Registration Incomplete' : 'Important Notice',
      message: 'Please review the details in your account.',
      status: i < 5 ? 'draft' : i < 10 ? 'scheduled' : 'sent',
      createdAt: randomDateInRange(30),
      scheduledFor: i >= 5 && i < 10 ? randomDateInRange(-7) : undefined,
    });
  }

  // Activity Logs
  const activityLogs: ActivityLog[] = [];
  
  for (let i = 0; i < 100; i++) {
    activityLogs.push({
      id: `log_${i + 1}`,
      entityType: 'vehicle',
      entityId: vehicles[Math.floor(Math.random() * vehicles.length)].id,
      action: 'Vehicle created',
      actorId: 'staff_1',
      actorName: 'Admin User',
      timestamp: randomDateInRange(180),
      metadata: {},
    });
  }

  return {
    companies,
    facilities,
    staffUsers,
    clients,
    vehicles,
    vehicleEvents,
    damages,
    notifications,
    activityLogs,
  };
}
