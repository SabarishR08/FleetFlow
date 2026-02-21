import { db } from "@/lib/db";
import { DriverStatus, ExpenseType, TripStatus, VehicleStatus, VehicleType } from "@prisma/client";

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export async function bootstrapIfEmpty() {
  const vehicleCount = await db.vehicle.count();
  if (vehicleCount > 0) {
    return;
  }

  const van = await db.vehicle.create({
    data: {
      name: "Van-05",
      model: "Sprinter 2500",
      licensePlate: "FF-1023",
      maxLoad: 500,
      odometer: 18240,
      acquisitionCost: 42000,
      status: VehicleStatus.ON_TRIP,
      region: "East",
      type: VehicleType.VAN,
    },
  });

  const truck = await db.vehicle.create({
    data: {
      name: "Truck-12",
      model: "Freightliner M2",
      licensePlate: "FF-7831",
      maxLoad: 4500,
      odometer: 65480,
      acquisitionCost: 98000,
      status: VehicleStatus.ON_TRIP,
      region: "Central",
      type: VehicleType.TRUCK,
    },
  });

  const bike = await db.vehicle.create({
    data: {
      name: "Bike-07",
      model: "CargoPro",
      licensePlate: "FF-2201",
      maxLoad: 80,
      odometer: 3240,
      acquisitionCost: 1800,
      status: VehicleStatus.AVAILABLE,
      region: "Metro",
      type: VehicleType.BIKE,
    },
  });

  const alex = await db.driver.create({
    data: {
      name: "Alex Monroe",
      licenseNumber: "DL-8821",
      licenseExpiry: daysAgo(-120),
      licenseClass: "Van",
      status: DriverStatus.ON_TRIP,
      safetyScore: 92.5,
      tripCompletionRate: 96.2,
      region: "East",
    },
  });

  const keisha = await db.driver.create({
    data: {
      name: "Keisha Ward",
      licenseNumber: "DL-6634",
      licenseExpiry: daysAgo(-30),
      licenseClass: "Truck",
      status: DriverStatus.ON_TRIP,
      safetyScore: 85.2,
      tripCompletionRate: 89.3,
      region: "Central",
    },
  });

  const rohan = await db.driver.create({
    data: {
      name: "Rohan Patel",
      licenseNumber: "DL-1093",
      licenseExpiry: daysAgo(260),
      licenseClass: "Bike",
      status: DriverStatus.ON_DUTY,
      safetyScore: 94.7,
      tripCompletionRate: 98.1,
      region: "Metro",
    },
  });

  await db.trip.create({
    data: {
      reference: "TRIP-2045",
      origin: "Harbor Depot",
      destination: "North Market",
      cargoWeight: 420,
      status: TripStatus.DISPATCHED,
      distanceKm: 38,
      revenue: 640,
      vehicleId: van.id,
      driverId: alex.id,
    },
  });

  await db.trip.create({
    data: {
      reference: "TRIP-1912",
      origin: "Central Hub",
      destination: "West Crossdock",
      cargoWeight: 3200,
      status: TripStatus.DISPATCHED,
      distanceKm: 120,
      revenue: 1850,
      vehicleId: truck.id,
      driverId: keisha.id,
    },
  });

  await db.trip.create({
    data: {
      reference: "TRIP-2108",
      origin: "Metro Dispatch",
      destination: "Old Town",
      cargoWeight: 40,
      status: TripStatus.COMPLETED,
      distanceKm: 16,
      revenue: 120,
      completedAt: daysAgo(2),
      vehicleId: bike.id,
      driverId: rohan.id,
    },
  });

  await db.maintenanceLog.create({
    data: {
      vehicleId: van.id,
      description: "Oil change and brake inspection",
      cost: 420,
      servicedAt: daysAgo(1),
    },
  });

  await db.expense.create({
    data: {
      vehicleId: truck.id,
      liters: 120,
      cost: 480,
      expenseDate: daysAgo(3),
      type: ExpenseType.FUEL,
    },
  });
}
