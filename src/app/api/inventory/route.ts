import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // 1. วัตถุดิบทั้งหมดพร้อมล็อต
    const items = await prisma.item.findMany({
      include: {
        supplier: true,
        lots: {
          where: { remainingQty: { gt: 0 } },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    // 2. ล็อตที่ใกล้หมดอายุใน 3 วัน
    const expiringLots = await prisma.lot.findMany({
      where: {
        remainingQty: { gt: 0 },
        isRecalled: false,
        expiryDate: {
          lte: threeDaysLater,
        },
      },
      include: {
        item: true,
        supplier: true,
      },
      orderBy: { expiryDate: "asc" },
    });

    // 3. วัตถุดิบที่สต๊อกต่ำกว่า Safety Stock
    const lowStockItems = items.filter((it) => {
      const totalStock = it.lots.reduce((sum, l) => sum + l.remainingQty, 0);
      return totalStock <= it.safetyStock;
    });

    // 4. ธุรกรรมล่าสุด 10 รายการ
    const recentTransactions = await prisma.stockTransaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        item: true,
        lot: true,
      },
    });

    // 5. สถิติต้นทุนวันนี้ (คำนวณจากธุรกรรม DISPENSE ของ 24 ชม. ล่าสุด)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const todayDispenseTx = await prisma.stockTransaction.findMany({
      where: {
        type: "DISPENSE",
        createdAt: { gte: oneDayAgo },
      },
    });

    const totalTodayCost = todayDispenseTx.reduce((sum, tx) => sum + tx.totalCost, 0);

    // คำนวณผู้ป่วยรวม
    const dietTypes = await prisma.dietType.findMany();
    const totalPatients = dietTypes.reduce((sum, dt) => sum + dt.currentPatientCount, 0);
    const costPerPatient = totalPatients > 0 ? totalTodayCost / totalPatients : 0;

    return NextResponse.json({
      success: true,
      items: items.map((it) => {
        const totalStock = it.lots.reduce((sum, l) => sum + l.remainingQty, 0);
        return {
          ...it,
          totalStock,
          isLowStock: totalStock <= it.safetyStock,
        };
      }),
      expiringLots,
      lowStockItemsCount: lowStockItems.length,
      expiringLotsCount: expiringLots.length,
      recentTransactions,
      metrics: {
        totalTodayCost,
        totalPatients,
        costPerPatient: Math.round(costPerPatient * 100) / 100,
        activeLotsCount: items.reduce((sum, it) => sum + it.lots.length, 0),
      },
    });
  } catch (error: any) {
    console.error("Inventory API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
