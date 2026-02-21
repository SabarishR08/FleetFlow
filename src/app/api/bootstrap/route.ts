import { NextResponse } from "next/server";
import { bootstrapIfEmpty } from "@/lib/bootstrap";

export async function POST() {
  await bootstrapIfEmpty();
  return NextResponse.json({ ok: true });
}
