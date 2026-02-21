import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ExpenseType, TripStatus, VehicleStatus } from "@prisma/client";

export async function GET() {
  const [vehicleCount, activeFleet, maintenanceAlerts, pendingCargo] = await Promise.all([
    db.vehicle.count(),
    db.vehicle.count({ where: { status: VehicleStatus.ON_TRIP } }),
    db.vehicle.count({ where: { status: VehicleStatus.IN_SHOP } }),
    db.trip.count({ where: { status: TripStatus.DRAFT } }),
  ]);

  const completedTrips = await db.trip.findMany({
    where: { status: TripStatus.COMPLETED },
  });

  const fuelExpenses = await db.expense.findMany({
    where: { type: ExpenseType.FUEL },
  });

  const totalDistance = completedTrips.reduce((sum, trip) => sum + trip.distanceKm, 0);
  const totalFuel = fuelExpenses.reduce((sum, expense) => sum + expense.liters, 0);
  const fuelEfficiency = totalFuel > 0 ? Number((totalDistance / totalFuel).toFixed(2)) : 0;

  const vehicles = await db.vehicle.findMany({
    include: { expenses: true, maintenanceLogs: true, trips: true },
  });

  const vehicleRoi = vehicles.map((vehicle) => {
    const fuelCost = vehicle.expenses.reduce((sum, expense) => sum + expense.cost, 0);
    const maintenanceCost = vehicle.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
    const revenue = vehicle.trips.reduce((sum, trip) => sum + trip.revenue, 0);
    const roiBase = vehicle.acquisitionCost || 1;
    const roi = (revenue - (fuelCost + maintenanceCost)) / roiBase;

    return {
      id: vehicle.id,
      name: vehicle.name,
      region: vehicle.region,
      roi: Number(roi.toFixed(2)),
      operationalCost: Number((fuelCost + maintenanceCost).toFixed(2)),
    };
  });

  const utilizationRate = vehicleCount > 0 ? Number(((activeFleet / vehicleCount) * 100).toFixed(1)) : 0;

  return NextResponse.json({
    activeFleet,
    maintenanceAlerts,
    utilizationRate,
    pendingCargo,
    fuelEfficiency,
    vehicleRoi,
  });
}
