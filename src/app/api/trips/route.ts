import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DriverStatus, TripStatus, VehicleStatus } from "@prisma/client";

const parseStatus = (value: string) => {
  if (!Object.values(TripStatus).includes(value as TripStatus)) {
    return null;
  }
  return value as TripStatus;
};

export async function GET() {
  const trips = await db.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: true,
      driver: true,
    },
  });
  return NextResponse.json(trips);
}

export async function POST(request: Request) {
  const body = await request.json();

  const reference = String(body.reference || "").trim();
  const origin = String(body.origin || "").trim();
  const destination = String(body.destination || "").trim();
  const cargoWeight = Number(body.cargoWeight || 0);
  const distanceKm = Number(body.distanceKm || 0);
  const revenue = Number(body.revenue || 0);
  const vehicleId = String(body.vehicleId || "").trim();
  const driverId = String(body.driverId || "").trim();
  const requestedStatus = parseStatus(String(body.status || TripStatus.DISPATCHED));

  if (!reference || !origin || !destination || !vehicleId || !driverId || !requestedStatus) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (Number.isNaN(cargoWeight) || cargoWeight <= 0) {
    return NextResponse.json({ error: "Cargo weight must be greater than 0." }, { status: 400 });
  }

  const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
  const driver = await db.driver.findUnique({ where: { id: driverId } });

  if (!vehicle || !driver) {
    return NextResponse.json({ error: "Vehicle or driver not found." }, { status: 404 });
  }

  if (cargoWeight > vehicle.maxLoad) {
    return NextResponse.json({ error: "Cargo exceeds vehicle capacity." }, { status: 400 });
  }

  const licenseExpired = driver.licenseExpiry.getTime() < Date.now();
  if (licenseExpired) {
    return NextResponse.json({ error: "Driver license is expired." }, { status: 400 });
  }

  if (requestedStatus === TripStatus.DISPATCHED) {
    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      return NextResponse.json({ error: "Vehicle is not available." }, { status: 400 });
    }
    if (driver.status !== DriverStatus.ON_DUTY) {
      return NextResponse.json({ error: "Driver is not available." }, { status: 400 });
    }
  }

  const trip = await db.trip.create({
    data: {
      reference,
      origin,
      destination,
      cargoWeight,
      status: requestedStatus,
      distanceKm: Number.isNaN(distanceKm) ? 0 : distanceKm,
      revenue: Number.isNaN(revenue) ? 0 : revenue,
      vehicleId,
      driverId,
    },
  });

  if (requestedStatus === TripStatus.DISPATCHED) {
    await Promise.all([
      db.vehicle.update({ where: { id: vehicleId }, data: { status: VehicleStatus.ON_TRIP } }),
      db.driver.update({ where: { id: driverId }, data: { status: DriverStatus.ON_TRIP } }),
    ]);
  }

  return NextResponse.json(trip);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = String(body.id || "").trim();
  const status = parseStatus(String(body.status || ""));

  if (!id || !status) {
    return NextResponse.json({ error: "Trip id and status are required." }, { status: 400 });
  }

  const trip = await db.trip.findUnique({ where: { id } });
  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const updates: Record<string, unknown> = { status };
  if (status === TripStatus.COMPLETED) {
    updates.completedAt = new Date();
  }

  const updatedTrip = await db.trip.update({
    where: { id },
    data: updates,
  });

  if (trip.vehicleId && trip.driverId && (status === TripStatus.COMPLETED || status === TripStatus.CANCELLED)) {
    await Promise.all([
      db.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: VehicleStatus.AVAILABLE,
          odometer: status === TripStatus.COMPLETED ? { increment: trip.distanceKm } : undefined,
        },
      }),
      db.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.ON_DUTY },
      }),
    ]);
  }

  return NextResponse.json(updatedTrip);
}
