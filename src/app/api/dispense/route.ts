import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateFefoAllocation } from "@/lib/fefo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: ตรวจสอบการจัดสรรล็อตตาม FEFO ก่อนเบิก
    if (action === "CHECK_FEFO") {
      const { itemId, requestedQty } = body;
      const recommendation = await calculateFefoAllocation(itemId, parseFloat(requestedQty));
      return NextResponse.json({ success: true, recommendation });
    }

    // Action 2: ตีความคำสั่งเสียงภาษาไทย (NLP Voice Parsing)
    if (action === "PARSE_VOICE") {
      const { text } = body;
      if (!text || typeof text !== "string") {
        return NextResponse.json({ error: "No voice text provided" }, { status: 400 });
      }

      // ดึงรายชื่อวัตถุดิบทั้งหมดเพื่อมาจับคู่
      const items = await prisma.item.findMany();
      let matchedItem = null;
      let matchedQty = 0;

      // ค้นหาวัตถุดิบที่ตรงกับคำพูด
      for (const item of items) {
        const keywords = [
          item.name.toLowerCase(),
          item.name.replace(/\(.*\)/, "").trim().toLowerCase(),
          item.code.toLowerCase(),
        ];
        if (item.name.includes("ไก่")) keywords.push("ไก่", "อกไก่");
        if (item.name.includes("หมู")) keywords.push("หมู", "สันใน");
        if (item.name.includes("ปลา")) keywords.push("ปลา", "ปลากะพง");
        if (item.name.includes("ผักกาด")) keywords.push("ผักกาด", "ผักกาดขาว", "ผัก");
        if (item.name.includes("ไข่")) keywords.push("ไข่", "ไข่ไก่");
        if (item.name.includes("ข้าว")) keywords.push("ข้าว", "ข้าวหอม");
        if (item.name.includes("เต้าหู้")) keywords.push("เต้าหู้", "เต้าหู้ไข่");

        for (const kw of keywords) {
          if (text.toLowerCase().includes(kw)) {
            matchedItem = item;
            break;
          }
        }
        if (matchedItem) break;
      }

      // ค้นหาตัวเลขในข้อความ เช่น "5 กิโล", "10", "2.5"
      const numberMatch = text.match(/(\d+(\.\d+)?)/);
      if (numberMatch) {
        matchedQty = parseFloat(numberMatch[0]);
      } else {
        matchedQty = 5.0; // ค่าเริ่มต้นถ้าไม่ระบุ
      }

      if (matchedItem) {
        const fefo = await calculateFefoAllocation(matchedItem.id, matchedQty);
        return NextResponse.json({
          success: true,
          parsed: {
            item: matchedItem,
            quantity: matchedQty,
            unit: matchedItem.baseUnit,
            fefo,
            speechResponse: `ต้องการเบิก ${matchedItem.name} จำนวน ${matchedQty} ${matchedItem.baseUnit} ใช่หรือไม่?`,
          },
        });
      }

      return NextResponse.json({
        success: false,
        message: "ระบบยังไม่พบชื่อวัตถุดิบที่ตรงกับคำสั่งเสียง กรุณาลองพูดใหม่อีกครั้ง หรือเลือกจากรายการ",
      });
    }

    // Action 3: ยืนยันการตัดสต๊อกจริง (Execute FEFO Dispense)
    if (action === "CONFIRM_DISPENSE") {
      const {
        itemId,
        requestedQty,
        menuName,
        operatorName,
        operatorRole,
        method,
        notes,
      } = body;

      const qty = parseFloat(requestedQty);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json({ error: "จำนวนที่เบิกต้องมากกว่า 0" }, { status: 400 });
      }

      const fefo = await calculateFefoAllocation(itemId, qty);

      if (!fefo.canFulfill) {
        return NextResponse.json(
          {
            error: `สต๊อกคงเหลือไม่พอ (ต้องการ ${qty} ${fefo.unit} แต่เหลือพร้อมใช้เพียง ${fefo.totalAvailable} ${fefo.unit})`,
          },
          { status: 400 }
        );
      }

      const item = await prisma.item.findUnique({ where: { id: itemId } });

      // ดำเนินการตัดยอดทีละล็อตตามลำดับ FEFO
      const transactions = [];

      for (const alloc of fefo.allocations) {
        // อัปเดต Lot
        await prisma.lot.update({
          where: { id: alloc.lotId },
          data: {
            remainingQty: alloc.remainingAfter,
          },
        });

        // บันทึกธุรกรรม Append-only
        const tx = await prisma.stockTransaction.create({
          data: {
            type: "DISPENSE",
            itemId,
            lotId: alloc.lotId,
            qty: alloc.allocatedQty,
            unitCost: alloc.unitCost,
            totalCost: alloc.totalCost,
            menuName: menuName || "ประกอบอาหารประจำวัน",
            operatorName: operatorName || "พ่อครัว / แม่ครัว",
            operatorRole: operatorRole || "พ่อครัว / แม่ครัว",
            method: method || "MANUAL",
            notes: notes || `เบิกใช้ตามเกณฑ์ FEFO จากล็อต ${alloc.lotNumber}`,
          },
        });

        transactions.push(tx);
      }

      return NextResponse.json({
        success: true,
        message: `ตัดยอดสต๊อกสำเร็จ ${qty} ${fefo.unit} เรียบร้อยแล้ว`,
        allocations: fefo.allocations,
        totalCost: fefo.totalCost,
        item,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Dispense API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
