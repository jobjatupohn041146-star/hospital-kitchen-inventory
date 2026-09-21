import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      // ดึงรายการล็อตล่าสุดที่พร้อมให้เลือกค้นหา/จำลอง Recall
      const recentLots = await prisma.lot.findMany({
        take: 20,
        orderBy: { receivedDate: "desc" },
        include: {
          item: true,
          supplier: true,
          transactions: {
            where: { type: "DISPENSE" },
            take: 5,
          },
        },
      });
      return NextResponse.json({ success: true, recentLots });
    }

    // ค้นหาล็อตแบบเจาะจง
    const lot = await prisma.lot.findFirst({
      where: {
        OR: [
          { lotNumber: { equals: query } },
          { lotNumber: { contains: query } },
          { qrCode: { equals: query } },
          { id: { equals: query } },
        ],
      },
      include: {
        item: true,
        supplier: true,
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, message: `ไม่พบล็อตที่ตรงกับคำค้นหา: "${query}"` },
        { status: 404 }
      );
    }

    // สรุปการกระจายตัวของล็อต (Traceability Dossier)
    const dispenseTx = lot.transactions.filter((t) => t.type === "DISPENSE");
    const totalDispensed = dispenseTx.reduce((sum, t) => sum + t.qty, 0);

    const affectedMenus = dispenseTx.map((t) => ({
      menuName: t.menuName || "อาหารผู้ป่วยประจำวัน",
      qtyUsed: t.qty,
      unit: lot.item.baseUnit,
      usedAt: t.createdAt,
      operatorName: t.operatorName,
      method: t.method,
      notes: t.notes,
    }));

    return NextResponse.json({
      success: true,
      lot,
      summary: {
        lotNumber: lot.lotNumber,
        itemName: lot.item.name,
        itemCode: lot.item.code,
        category: lot.item.category,
        supplierName: lot.supplier.name,
        supplierContact: `${lot.supplier.contact || "-"} โทร ${lot.supplier.phone || "-"}`,
        invoiceNumber: lot.invoiceNumber || "-",
        receivedDate: lot.receivedDate,
        expiryDate: lot.expiryDate,
        receivedTemp: lot.receivedTemp !== null ? `${lot.receivedTemp} °C` : "-",
        tempStatus: lot.tempStatus,
        receiverName: lot.receiverName,
        initialQty: lot.initialQty,
        remainingQty: lot.remainingQty,
        totalDispensed,
        unit: lot.item.baseUnit,
        isRecalled: lot.isRecalled,
        recallReason: lot.recallReason,
        recalledAt: lot.recalledAt,
        affectedMenus,
      },
    });
  } catch (error: any) {
    console.error("Recall API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, lotId, reason } = body;

    if (action === "TRIGGER_RECALL") {
      const now = new Date();
      const updatedLot = await prisma.lot.update({
        where: { id: lotId },
        data: {
          isRecalled: true,
          recallReason: reason || "คำสั่งระงับและเรียกคืนสินค้าฉุกเฉิน (Recall Notice)",
          recalledAt: now,
        },
        include: { item: true, supplier: true },
      });

      // บันทึกธุรกรรมแจ้งเตือนการเรียกคืน
      await prisma.stockTransaction.create({
        data: {
          type: "SPOIL",
          itemId: updatedLot.itemId,
          lotId: updatedLot.id,
          qty: updatedLot.remainingQty,
          unitCost: updatedLot.unitCost,
          totalCost: updatedLot.remainingQty * updatedLot.unitCost,
          menuName: "กักกันสินค้าเรียกคืน (RECALL QUARANTINE)",
          operatorName: "หัวหน้าฝ่ายควบคุมคุณภาพ",
          operatorRole: "หัวหน้าจัดซื้อ / หัวหน้าครัว",
          method: "MANUAL",
          notes: `ระงับการใช้ล็อต ${updatedLot.lotNumber} เนื่องจาก: ${reason}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `ระงับและเรียกคืนล็อต ${updatedLot.lotNumber} เรียบร้อยแล้ว (ล็อคสต๊อกไม่ให้เบิกใช้)`,
        lot: updatedLot,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Recall POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
