import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DriverStatus } from "@prisma/client";

const parseStatus = (value: string) => {
  if (!Object.values(DriverStatus).includes(value as DriverStatus)) {
    return null;
  }
  return value as DriverStatus;
};

export async function GET() {
  const drivers = await db.driver.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(drivers);
}

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name || "").trim();
  const licenseNumber = String(body.licenseNumber || "").trim();
  const licenseExpiry = new Date(String(body.licenseExpiry || ""));
  const licenseClass = String(body.licenseClass || "").trim();
  const region = String(body.region || "").trim();
  const status = parseStatus(String(body.status || DriverStatus.ON_DUTY));
  const safetyScore = Number(body.safetyScore || 0);
  const tripCompletionRate = Number(body.tripCompletionRate || 0);

  if (!name || !licenseNumber || !licenseClass || !region || !status) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (Number.isNaN(licenseExpiry.getTime())) {
    return NextResponse.json({ error: "Invalid license expiry date." }, { status: 400 });
  }

  const driver = await db.driver.create({
    data: {
      name,
      licenseNumber,
      licenseExpiry,
      licenseClass,
      region,
      status,
      safetyScore: Number.isNaN(safetyScore) ? 0 : safetyScore,
      tripCompletionRate: Number.isNaN(tripCompletionRate) ? 0 : tripCompletionRate,
    },
  });

  return NextResponse.json(driver);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = String(body.id || "").trim();

  if (!id) {
    return NextResponse.json({ error: "Driver id is required." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.status) {
    const status = parseStatus(String(body.status));
    if (!status) {
      return NextResponse.json({ error: "Invalid driver status." }, { status: 400 });
    }
    updates.status = status;
  }

  const driver = await db.driver.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json(driver);
}
