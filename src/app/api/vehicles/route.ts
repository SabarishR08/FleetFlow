import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VehicleStatus, VehicleType } from "@prisma/client";

const parseStatus = (value: string) => {
  if (!Object.values(VehicleStatus).includes(value as VehicleStatus)) {
    return null;
  }
  return value as VehicleStatus;
};

const parseType = (value: string) => {
  if (!Object.values(VehicleType).includes(value as VehicleType)) {
    return null;
  }
  return value as VehicleType;
};

export async function GET() {
  const vehicles = await db.vehicle.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(vehicles);
}

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name || "").trim();
  const model = String(body.model || "").trim();
  const licensePlate = String(body.licensePlate || "").trim();
  const maxLoad = Number(body.maxLoad || 0);
  const odometer = Number(body.odometer || 0);
  const acquisitionCost = Number(body.acquisitionCost || 0);
  const region = String(body.region || "").trim();
  const status = parseStatus(String(body.status || VehicleStatus.AVAILABLE));
  const type = parseType(String(body.type || VehicleType.VAN));

  if (!name || !model || !licensePlate || !region || !status || !type) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (Number.isNaN(maxLoad) || maxLoad <= 0) {
    return NextResponse.json({ error: "Max load must be greater than 0." }, { status: 400 });
  }

  const vehicle = await db.vehicle.create({
    data: {
      name,
      model,
      licensePlate,
      maxLoad,
      odometer: Number.isNaN(odometer) ? 0 : odometer,
      acquisitionCost: Number.isNaN(acquisitionCost) ? 0 : acquisitionCost,
      region,
      status,
      type,
    },
  });

  return NextResponse.json(vehicle);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = String(body.id || "").trim();

  if (!id) {
    return NextResponse.json({ error: "Vehicle id is required." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.status) {
    const status = parseStatus(String(body.status));
    if (!status) {
      return NextResponse.json({ error: "Invalid vehicle status." }, { status: 400 });
    }
    updates.status = status;
  }

  if (body.odometer !== undefined) {
    const odometer = Number(body.odometer || 0);
    if (Number.isNaN(odometer) || odometer < 0) {
      return NextResponse.json({ error: "Invalid odometer value." }, { status: 400 });
    }
    updates.odometer = odometer;
  }

  const vehicle = await db.vehicle.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json(vehicle);
}
