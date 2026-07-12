import { PrismaClient, Role, VehicleType, VehicleStatus, DriverStatus, TripStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seeding...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('test123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@transitops.com' },
    update: { role: Role.ADMIN },
    create: {
      email: 'admin@transitops.com',
      name: 'Admin Manager',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'fleet@transitops.com' },
    update: { role: Role.FLEET_MANAGER },
    create: {
      email: 'fleet@transitops.com',
      name: 'Fleet Manager',
      passwordHash,
      role: Role.FLEET_MANAGER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'dispatcher@transitops.com' },
    update: { role: Role.DISPATCHER },
    create: {
      email: 'dispatcher@transitops.com',
      name: 'Route Dispatcher',
      passwordHash,
      role: Role.DISPATCHER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'safety@transitops.com' },
    update: { role: Role.SAFETY_OFFICER },
    create: {
      email: 'safety@transitops.com',
      name: 'Safety Officer',
      passwordHash,
      role: Role.SAFETY_OFFICER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'finance@transitops.com' },
    update: { role: Role.FINANCIAL_ANALYST },
    create: {
      email: 'finance@transitops.com',
      name: 'Financial Analyst',
      passwordHash,
      role: Role.FINANCIAL_ANALYST,
    },
  });

  await prisma.appSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      depotName: 'Gandhinagar Depot GJ4',
      currency: 'INR (Rs)',
      distanceUnit: 'KILOMETERS',
    },
  });

  // 2. Create Regions
  const regionNames = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'];
  const regions = [];
  for (const name of regionNames) {
    const region = await prisma.region.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    regions.push(region);
  }

  // 3. Create 25 Vehicles
  const manufacturers = ['Volvo', 'Scania', 'Mercedes-Benz', 'MAN', 'Ford', 'Toyota'];
  const types = Object.values(VehicleType);
  const vehicles = [];
  
  for (let i = 1; i <= 25; i++) {
    const v = await prisma.vehicle.upsert({
      where: { registrationNumber: `TRN-${1000 + i}` },
      update: {},
      create: {
        registrationNumber: `TRN-${1000 + i}`,
        manufacturer: manufacturers[i % manufacturers.length],
        model: `Model ${i}`,
        type: types[i % types.length],
        maxLoadCapacity: 1000 + i * 100,
        currentOdometer: 10000 + i * 500,
        acquisitionCost: 50000 + i * 1000,
        regionId: regions[i % regions.length].id,
        status: VehicleStatus.AVAILABLE,
      },
    });
    vehicles.push(v);
  }

  // 4. Create 40 Drivers
  const drivers = [];
  for (let i = 1; i <= 40; i++) {
    const d = await prisma.driver.upsert({
      where: { licenseNumber: `DL-${2000 + i}` },
      update: {},
      create: {
        name: `Driver ${i}`,
        licenseNumber: `DL-${2000 + i}`,
        category: 'Heavy',
        licenseExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
        contactNumber: `+123456789${i.toString().padStart(2, '0')}`,
        safetyScore: Math.floor(Math.random() * 20) + 80, // 80-100
        status: DriverStatus.AVAILABLE,
      },
    });
    drivers.push(d);
  }

  // 5. Create 200 Trips
  const tripStatuses = [TripStatus.COMPLETED, TripStatus.COMPLETED, TripStatus.DISPATCHED, TripStatus.DRAFT, TripStatus.CANCELLED];
  
  for (let i = 1; i <= 200; i++) {
    const status = tripStatuses[Math.floor(Math.random() * tripStatuses.length)];
    const vehicle = vehicles[i % vehicles.length];
    const driver = drivers[i % drivers.length];
    
    let tripStart = null;
    let tripEnd = null;
    let actualDistance = null;
    let fuelConsumed = null;
    
    if (status === TripStatus.COMPLETED || status === TripStatus.DISPATCHED) {
      tripStart = new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)); // Within last 30 days
      
      if (status === TripStatus.COMPLETED) {
        tripEnd = new Date(tripStart.getTime() + (Math.random() * 5 * 24 * 60 * 60 * 1000)); // Up to 5 days later
        actualDistance = 500 + Math.random() * 500;
        fuelConsumed = actualDistance / 10;
      }
    }

    await prisma.trip.create({
      data: {
        source: `City ${Math.floor(Math.random() * 50)}`,
        destination: `City ${Math.floor(Math.random() * 50)}`,
        cargoWeight: 500 + Math.random() * 500,
        plannedDistance: 500 + Math.random() * 500,
        actualDistance,
        revenue: 1000 + Math.random() * 4000,
        status,
        tripStart,
        tripEnd,
        fuelConsumed,
        createdBy: admin.id,
        vehicleId: vehicle.id,
        driverId: driver.id,
      },
    });
  }

  console.log('Database seeded successfully with realistic data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
