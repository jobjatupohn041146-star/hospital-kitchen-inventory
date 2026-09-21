import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateTomorrowPurchaseOrders } from "@/lib/demandEngine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dietCountsParam = searchParams.get("patientCounts");
    let patientCountsOverride: Record<string, number> | undefined = undefined;

    if (dietCountsParam) {
      try {
        patientCountsOverride = JSON.parse(dietCountsParam);
      } catch (e) {
        // ignore
      }
    }

    const dietTypes = await prisma.dietType.findMany({
      orderBy: { code: "asc" },
    });

    const forecastData = await calculateTomorrowPurchaseOrders(patientCountsOverride);

    return NextResponse.json({
      success: true,
      dietTypes,
      ...forecastData,
    });
  } catch (error: any) {
    console.error("Forecast API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: อัปเดตจำนวนผู้ป่วยในแต่ละกลุ่มอาหาร
    if (action === "UPDATE_PATIENTS") {
      const { counts } = body; // { [dietTypeId]: number }
      if (counts) {
        for (const [id, count] of Object.entries(counts)) {
          await prisma.dietType.update({
            where: { id },
            data: { currentPatientCount: Number(count) },
          });
        }
      }
      const forecastData = await calculateTomorrowPurchaseOrders();
      return NextResponse.json({ success: true, ...forecastData });
    }

    // Action 2: อนุมัติและสร้างใบสั่งซื้อ (Purchase Order)
    if (action === "CREATE_PO") {
      const { supplierId, items, totalAmount, createdBy } = body;

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
      const poNumber = `PO-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;

      const po = await prisma.purchaseOrder.create({
        data: {
          poNumber,
          orderDate: now,
          supplierId,
          totalAmount: parseFloat(totalAmount),
          status: "APPROVED",
          itemsJson: JSON.stringify(items),
          createdBy: createdBy || "หัวหน้าฝ่ายจัดซื้อ",
        },
        include: {
          supplier: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: `สร้างใบสั่งซื้อเลขที่ ${po.poNumber} สำเร็จ`,
        purchaseOrder: po,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Forecast API POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
