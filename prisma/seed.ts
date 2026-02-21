import { PrismaClient, VehicleStatus, VehicleType, DriverStatus, TripStatus, ExpenseType } from "@prisma/client";

const prisma = new PrismaClient();

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

async function main() {
  const vehicleCount = await prisma.vehicle.count();
  if (vehicleCount > 0) {
    return;
  }

  await prisma.vehicle.createMany({
    data: [
      {
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
      {
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
      {
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
      {
        name: "Van-11",
        model: "Transit 350",
        licensePlate: "FF-4419",
        maxLoad: 750,
        odometer: 29120,
        acquisitionCost: 47000,
        status: VehicleStatus.IN_SHOP,
        region: "East",
        type: VehicleType.VAN,
      },
      {
        name: "Truck-03",
        model: "Isuzu NQR",
        licensePlate: "FF-3306",
        maxLoad: 3200,
        odometer: 81220,
        acquisitionCost: 76000,
        status: VehicleStatus.OUT_OF_SERVICE,
        region: "West",
        type: VehicleType.TRUCK,
      },
    ],
  });

  await prisma.driver.createMany({
    data: [
      {
        name: "Alex Monroe",
        licenseNumber: "DL-8821",
        licenseExpiry: daysAgo(-120),
        licenseClass: "Van",
        status: DriverStatus.ON_TRIP,
        safetyScore: 92.5,
        tripCompletionRate: 96.2,
        region: "East",
      },
      {
        name: "Nia Santos",
        licenseNumber: "DL-5520",
        licenseExpiry: daysAgo(20),
        licenseClass: "Truck",
        status: DriverStatus.OFF_DUTY,
        safetyScore: 88.1,
        tripCompletionRate: 90.4,
        region: "Central",
      },
      {
        name: "Rohan Patel",
        licenseNumber: "DL-1093",
        licenseExpiry: daysAgo(260),
        licenseClass: "Bike",
        status: DriverStatus.ON_DUTY,
        safetyScore: 94.7,
        tripCompletionRate: 98.1,
        region: "Metro",
      },
      {
        name: "Keisha Ward",
        licenseNumber: "DL-6634",
        licenseExpiry: daysAgo(-30),
        licenseClass: "Truck",
        status: DriverStatus.ON_TRIP,
        safetyScore: 85.2,
        tripCompletionRate: 89.3,
        region: "Central",
      },
      {
        name: "Tariq Aziz",
        licenseNumber: "DL-2290",
        licenseExpiry: daysAgo(-210),
        licenseClass: "Van",
        status: DriverStatus.OFF_DUTY,
        safetyScore: 90.9,
        tripCompletionRate: 93.0,
        region: "East",
      },
    ],
  });

  const vehicles = await prisma.vehicle.findMany({
    where: { licensePlate: { in: ["FF-1023", "FF-7831", "FF-2201"] } },
  });

  const drivers = await prisma.driver.findMany({
    where: { licenseNumber: { in: ["DL-8821", "DL-6634", "DL-1093"] } },
  });

  const vehicleMap = new Map(vehicles.map((vehicle) => [vehicle.licensePlate, vehicle]));
  const driverMap = new Map(drivers.map((driver) => [driver.licenseNumber, driver]));

  const van05 = vehicleMap.get("FF-1023");
  const truck12 = vehicleMap.get("FF-7831");
  const bike07 = vehicleMap.get("FF-2201");

  const alex = driverMap.get("DL-8821");
  const keisha = driverMap.get("DL-6634");
  const rohan = driverMap.get("DL-1093");

  if (van05 && alex) {
    await prisma.trip.create({
      data: {
        reference: "TRIP-2045",
        origin: "Harbor Depot",
        destination: "North Market",
        cargoWeight: 420,
        status: TripStatus.DISPATCHED,
        distanceKm: 38,
        revenue: 640,
        vehicleId: van05.id,
        driverId: alex.id,
      },
    });
  }

  if (truck12 && keisha) {
    await prisma.trip.create({
      data: {
        reference: "TRIP-1912",
        origin: "Central Hub",
        destination: "West Crossdock",
        cargoWeight: 3200,
        status: TripStatus.DISPATCHED,
        distanceKm: 120,
        revenue: 1850,
        vehicleId: truck12.id,
        driverId: keisha.id,
      },
    });
  }

  if (bike07 && rohan) {
    await prisma.trip.create({
      data: {
        reference: "TRIP-2108",
        origin: "Metro Dispatch",
        destination: "Old Town",
        cargoWeight: 40,
        status: TripStatus.COMPLETED,
        distanceKm: 16,
        revenue: 120,
        completedAt: daysAgo(2),
        vehicleId: bike07.id,
        driverId: rohan.id,
      },
    });
  }

  const van11 = await prisma.vehicle.findFirst({
    where: { licensePlate: "FF-4419" },
  });

  if (van11) {
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: van11.id,
        description: "Oil change and brake inspection",
        cost: 420,
        servicedAt: daysAgo(1),
      },
    });
  }

  if (bike07) {
    await prisma.expense.create({
      data: {
        vehicleId: bike07.id,
        liters: 0,
        cost: 18,
        expenseDate: daysAgo(2),
        type: ExpenseType.OTHER,
      },
    });
  }

  if (truck12) {
    await prisma.expense.create({
      data: {
        vehicleId: truck12.id,
        liters: 120,
        cost: 480,
        expenseDate: daysAgo(3),
        type: ExpenseType.FUEL,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
