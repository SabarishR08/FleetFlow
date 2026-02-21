import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VehicleStatus } from "@prisma/client";
import { eventManager } from "@/lib/events";

export async function GET() {
  const logs = await db.maintenanceLog.findMany({
    orderBy: { servicedAt: "desc" },
    include: { vehicle: true },
  });
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body = await request.json();

  const vehicleId = String(body.vehicleId || "").trim();
  const description = String(body.description || "").trim();
  const cost = Number(body.cost || 0);
  const servicedAt = new Date(String(body.servicedAt || ""));

  if (!vehicleId || !description) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (Number.isNaN(servicedAt.getTime())) {
    return NextResponse.json({ error: "Invalid service date." }, { status: 400 });
  }

  const log = await db.maintenanceLog.create({
    data: {
      vehicleId,
      description,
      cost: Number.isNaN(cost) ? 0 : cost,
      servicedAt,
    },
  });

  await db.vehicle.update({
    where: { id: vehicleId },
    data: { status: VehicleStatus.IN_SHOP },
  });

  eventManager.emitFleetEvent({
    type: "maintenance:logged",
    data: { maintenanceId: log.id, vehicleId, description, cost },
  });

  return NextResponse.json(log);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = String(body.id || "").trim();

  if (!id) {
    return NextResponse.json({ error: "Maintenance id is required." }, { status: 400 });
  }

  const log = await db.maintenanceLog.update({
    where: { id },
    data: { resolved: true },
  });

  await db.vehicle.update({
    where: { id: log.vehicleId },
    data: { status: VehicleStatus.AVAILABLE },
  });

  eventManager.emitFleetEvent({
    type: "vehicle:status",
    data: { vehicleId: log.vehicleId, status: "AVAILABLE", reason: "maintenance_resolved" },
  });

  return NextResponse.json(log);
}
