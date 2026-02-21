import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ExpenseType } from "@prisma/client";

const parseType = (value: string) => {
  if (!Object.values(ExpenseType).includes(value as ExpenseType)) {
    return null;
  }
  return value as ExpenseType;
};

export async function GET() {
  const expenses = await db.expense.findMany({
    orderBy: { expenseDate: "desc" },
    include: { vehicle: true, trip: true },
  });
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const body = await request.json();

  const vehicleId = String(body.vehicleId || "").trim();
  const tripId = body.tripId ? String(body.tripId).trim() : null;
  const liters = Number(body.liters || 0);
  const cost = Number(body.cost || 0);
  const expenseDate = new Date(String(body.expenseDate || ""));
  const type = parseType(String(body.type || ExpenseType.FUEL));

  if (!vehicleId || !type) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (Number.isNaN(expenseDate.getTime())) {
    return NextResponse.json({ error: "Invalid expense date." }, { status: 400 });
  }

  const expense = await db.expense.create({
    data: {
      vehicleId,
      tripId,
      liters: Number.isNaN(liters) ? 0 : liters,
      cost: Number.isNaN(cost) ? 0 : cost,
      expenseDate,
      type,
    },
  });

  return NextResponse.json(expense);
}
