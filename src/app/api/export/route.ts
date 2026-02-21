import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
// @ts-ignore
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "pdf";
  const type = searchParams.get("type") || "trips";

  try {
    if (type === "trips") {
      const trips = await db.trip.findMany({
        include: { vehicle: true, driver: true },
        orderBy: { createdAt: "desc" },
      });

      if (format === "excel") {
        const data = trips.map((trip) => ({
          Reference: trip.reference,
          Origin: trip.origin,
          Destination: trip.destination,
          Vehicle: trip.vehicle?.name || "-",
          Driver: trip.driver?.name || "-",
          "Cargo Weight (kg)": trip.cargoWeight,
          "Distance (km)": trip.distanceKm,
          "Revenue ($)": trip.revenue.toFixed(2),
          Status: trip.status,
          Date: new Date(trip.createdAt).toLocaleDateString(),
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");

        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        return new NextResponse(buffer, {
          headers: {
            "Content-Disposition": 'attachment; filename="trips.xlsx"',
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        });
      }

      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => {});

      doc.fontSize(20).text("Trip Report", { align: "center" });
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown();

      trips.slice(0, 50).forEach((trip) => {
        doc
          .fontSize(11)
          .text(`${trip.reference} - ${trip.origin} → ${trip.destination}`, {
            underline: true,
          });
        doc.fontSize(9);
        doc.text(`Vehicle: ${trip.vehicle?.name || "-"} | Driver: ${trip.driver?.name || "-"}`);
        doc.text(`Cargo: ${trip.cargoWeight} kg | Distance: ${trip.distanceKm} km | Revenue: $${trip.revenue}`);
        doc.text(`Status: ${trip.status} | Date: ${new Date(trip.createdAt).toLocaleDateString()}`);
        doc.moveDown(0.5);
      });

      doc.end();

      return new Promise((resolve) => {
        doc.on("end", () => {
          const buffer = Buffer.concat(buffers);
          resolve(
            new NextResponse(buffer, {
              headers: {
                "Content-Disposition": 'attachment; filename="trips.pdf"',
                "Content-Type": "application/pdf",
              },
            })
          );
        });
      });
    } else if (type === "expenses") {
      const expenses = await db.expense.findMany({
        include: { vehicle: true, trip: true },
        orderBy: { expenseDate: "desc" },
      });

      if (format === "excel") {
        const data = expenses.map((expense) => ({
          Vehicle: expense.vehicle?.name || "-",
          Type: expense.type,
          Liters: expense.liters || "-",
          "Cost ($)": expense.cost.toFixed(2),
          Trip: expense.trip?.reference || "-",
          Date: new Date(expense.expenseDate).toLocaleDateString(),
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        return new NextResponse(buffer, {
          headers: {
            "Content-Disposition": 'attachment; filename="expenses.xlsx"',
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        });
      }

      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => {});

      doc.fontSize(20).text("Expense Report", { align: "center" });
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown();

      let totalCost = 0;
      expenses.slice(0, 50).forEach((expense) => {
        totalCost += expense.cost;
        doc.fontSize(11).text(`${expense.vehicle?.name} - ${expense.type}`, { underline: true });
        doc.fontSize(9);
        if (expense.liters) {
          doc.text(`Liters: ${expense.liters}`);
        }
        doc.text(`Cost: $${expense.cost} | Date: ${new Date(expense.expenseDate).toLocaleDateString()}`);
        doc.moveDown(0.5);
      });

      doc.moveDown();
      doc.fontSize(12).text(`Total Expenses: $${totalCost.toFixed(2)}`, { align: "right", bold: true });

      doc.end();

      return new Promise((resolve) => {
        doc.on("end", () => {
          const buffer = Buffer.concat(buffers);
          resolve(
            new NextResponse(buffer, {
              headers: {
                "Content-Disposition": 'attachment; filename="expenses.pdf"',
                "Content-Type": "application/pdf",
              },
            })
          );
        });
      });
    } else if (type === "maintenance") {
      const logs = await db.maintenanceLog.findMany({
        include: { vehicle: true },
        orderBy: { servicedAt: "desc" },
      });

      if (format === "excel") {
        const data = logs.map((log) => ({
          Vehicle: log.vehicle?.name || "-",
          Description: log.description,
          "Cost ($)": log.cost.toFixed(2),
          "Service Date": new Date(log.servicedAt).toLocaleDateString(),
          Status: log.resolved ? "Resolved" : "In Shop",
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance");

        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        return new NextResponse(buffer, {
          headers: {
            "Content-Disposition": 'attachment; filename="maintenance.xlsx"',
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        });
      }

      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => {});

      doc.fontSize(20).text("Maintenance Report", { align: "center" });
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown();

      let totalCost = 0;
      logs.slice(0, 50).forEach((log) => {
        totalCost += log.cost;
        doc.fontSize(11).text(`${log.vehicle?.name}`, { underline: true });
        doc.fontSize(9);
        doc.text(`Description: ${log.description}`);
        doc.text(`Cost: $${log.cost} | Status: ${log.resolved ? "Resolved" : "In Shop"}`);
        doc.text(`Service Date: ${new Date(log.servicedAt).toLocaleDateString()}`);
        doc.moveDown(0.5);
      });

      doc.moveDown();
      doc.fontSize(12).text(`Total Maintenance Cost: $${totalCost.toFixed(2)}`, { align: "right", bold: true });

      doc.end();

      return new Promise((resolve) => {
        doc.on("end", () => {
          const buffer = Buffer.concat(buffers);
          resolve(
            new NextResponse(buffer, {
              headers: {
                "Content-Disposition": 'attachment; filename="maintenance.pdf"',
                "Content-Type": "application/pdf",
              },
            })
          );
        });
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
