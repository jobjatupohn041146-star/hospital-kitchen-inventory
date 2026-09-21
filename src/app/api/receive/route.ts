import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceExtractionResult } from "@/lib/types";

// ตัวอย่าง Preset ใบส่งของจำลอง สำหรับงาน Demo/Workshop เมื่อไม่มี Gemini API Key หรือออฟไลน์
const PRESET_INVOICES: Record<string, InvoiceExtractionResult> = {
  meat: {
    supplierName: "บจก. สดเจริญอาหารฟาร์ม (เนื้อสัตว์และไข่สด)",
    invoiceNumber: "INV-SJ-" + Math.floor(1000 + Math.random() * 9000),
    invoiceDate: new Date().toISOString(),
    confidence: 0.98,
    source: "SMART_PRESET",
    items: [
      {
        itemName: "อกไก่สดลอกหนัง (เกรดโรงพยาบาล)",
        category: "เนื้อสัตว์สด",
        quantity: 40.0,
        unit: "กก.",
        unitPrice: 86.0,
        lotNumber: `LOT-CHK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-01`,
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        storageType: "แช่เย็น 0-4°C",
        recommendedTempMin: 0.0,
        recommendedTempMax: 4.0,
      },
      {
        itemName: "เนื้อหมูสันในสไลซ์บาง",
        category: "เนื้อสัตว์สด",
        quantity: 20.0,
        unit: "กก.",
        unitPrice: 165.0,
        lotNumber: `LOT-PRK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-01`,
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        storageType: "แช่เย็น 0-4°C",
        recommendedTempMin: 0.0,
        recommendedTempMax: 4.0,
      },
    ],
  },
  veg: {
    supplierName: "สหกรณ์ผักปลอดภัยเพื่อโรงพยาบาล",
    invoiceNumber: "INV-VG-" + Math.floor(1000 + Math.random() * 9000),
    invoiceDate: new Date().toISOString(),
    confidence: 0.96,
    source: "SMART_PRESET",
    items: [
      {
        itemName: "ผักกาดขาวอินทรีย์ตัดแต่ง",
        category: "ผักสด",
        quantity: 25.0,
        unit: "กก.",
        unitPrice: 35.0,
        lotNumber: `LOT-VEG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-01`,
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        storageType: "แช่เย็น 0-4°C",
        recommendedTempMin: 1.0,
        recommendedTempMax: 4.0,
      },
    ],
  },
  seafood: {
    supplierName: "บมจ. ไทยซีฟู้ด โคลด์เชน เซอร์วิส",
    invoiceNumber: "INV-TS-" + Math.floor(1000 + Math.random() * 9000),
    invoiceDate: new Date().toISOString(),
    confidence: 0.97,
    source: "SMART_PRESET",
    items: [
      {
        itemName: "เนื้อปลากะพงขาวหั่นชิ้น (แช่แข็ง)",
        category: "อาหารทะเล",
        quantity: 15.0,
        unit: "กก.",
        unitPrice: 220.0,
        lotNumber: `LOT-FSH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-01`,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        storageType: "แช่แข็ง -18°C",
        recommendedTempMin: -25.0,
        recommendedTempMax: -18.0,
      },
    ],
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: สกัดข้อมูลจากภาพ (AI Vision Extraction)
    if (action === "EXTRACT_INVOICE") {
      const { imageBase64, presetKey } = body;
      const apiKey = process.env.GEMINI_API_KEY;

      // หากมีการส่งภาพและมี GEMINI_API_KEY ให้เรียก Gemini Multimodal
      if (apiKey && imageBase64 && imageBase64.length > 50) {
        try {
          const prompt = `
คุณเป็นระบบ AI สำหรับอ่านเอกสารใบส่งของ/ใบแจ้งหนี้วัตถุดิบครัวโรงพยาบาล
กรุณาสกัดข้อมูลออกมาเป็น JSON ในรูปแบบนี้เท่านั้น:
{
  "supplierName": "ชื่อบริษัทซัพพลายเออร์",
  "invoiceNumber": "เลขที่ใบส่งของ",
  "items": [
    {
      "itemName": "ชื่อวัตถุดิบ",
      "quantity": 10.0,
      "unit": "กก./ฟอง/ลิตร",
      "unitPrice": 85.0,
      "storageType": "แช่เย็น 0-4°C หรือ แช่แข็ง -18°C หรือ อุณหภูมิห้อง",
      "expiryDays": 5
    }
  ]
}
`;
          // ตัด data:image/...;base64, ออก
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: prompt },
                      {
                        inlineData: {
                          mimeType: "image/jpeg",
                          data: cleanBase64,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  responseMimeType: "application/json",
                  temperature: 0.1,
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              const now = new Date();
              const items = parsed.items.map((it: any, idx: number) => ({
                itemName: it.itemName,
                quantity: Number(it.quantity) || 10,
                unit: it.unit || "กก.",
                unitPrice: Number(it.unitPrice) || 50,
                lotNumber: `LOT-${Date.now().toString().slice(-6)}-${idx + 1}`,
                expiryDate: new Date(
                  now.getTime() + (it.expiryDays || 5) * 24 * 60 * 60 * 1000
                ).toISOString(),
                storageType: it.storageType || "แช่เย็น 0-4°C",
              }));

              return NextResponse.json({
                success: true,
                extraction: {
                  supplierName: parsed.supplierName || "ซัพพลายเออร์ที่ตรวจพบ",
                  invoiceNumber: parsed.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
                  invoiceDate: now.toISOString(),
                  confidence: 0.95,
                  source: "GEMINI_AI",
                  items,
                },
              });
            }
          }
        } catch (aiErr) {
          console.error("Gemini API error, falling back to smart preset:", aiErr);
        }
      }

      // Fallback: ใช้ Smart Preset ตามประเภทใบส่งของ
      const selectedPreset = PRESET_INVOICES[presetKey] || PRESET_INVOICES.meat;
      return NextResponse.json({
        success: true,
        extraction: selectedPreset,
      });
    }

    // Action 2: ยืนยันบันทึกรับของเข้าคลังจริง (Touch-once Confirm)
    if (action === "CONFIRM_RECEIVE") {
      const {
        supplierName,
        invoiceNumber,
        receiverName,
        temperature,
        items,
        notes,
      } = body;

      // 1. หาหรือสร้าง Supplier
      let supplier = await prisma.supplier.findFirst({
        where: { name: supplierName },
      });
      if (!supplier) {
        supplier = await prisma.supplier.create({
          data: {
            name: supplierName,
            contact: "ซัพพลายเออร์จากใบส่งของ",
          },
        });
      }

      const createdLots = [];
      const now = new Date();

      for (const it of items) {
        // หา Item ในระบบ หรือจับคู่จากชื่อ
        let item = await prisma.item.findFirst({
          where: { name: { contains: it.itemName.slice(0, 6) } },
        });

        if (!item) {
          item = await prisma.item.findFirst();
        }

        if (!item) {
          continue;
        }

        // ตรวจสอบอุณหภูมิตามเกณฑ์ HACCP
        let tempStatus = "PASS";
        const temp = parseFloat(temperature);
        if (!isNaN(temp)) {
          if (item.storageType.includes("แช่เย็น") && (temp < 0 || temp > 4)) {
            tempStatus = "FAIL";
          } else if (item.storageType.includes("แช่แข็ง") && temp > -18) {
            tempStatus = "FAIL";
          }
        }

        const lotNumber =
          it.lotNumber ||
          `LOT-${item.code.replace("RAW-", "")}-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(10 + Math.random() * 89)}`;

        const lot = await prisma.lot.create({
          data: {
            lotNumber,
            itemId: item.id,
            supplierId: supplier.id,
            receivedDate: now,
            expiryDate: new Date(it.expiryDate),
            initialQty: parseFloat(it.quantity),
            remainingQty: parseFloat(it.quantity),
            unitCost: parseFloat(it.unitPrice),
            receivedTemp: isNaN(temp) ? null : temp,
            tempStatus,
            invoiceNumber,
            receiverName: receiverName || "เจ้าหน้าที่รับของ",
            notes: notes || `รับเข้าคลังมาตรฐาน HACCP (สถานะอุณหภูมิ: ${tempStatus})`,
            qrCode: lotNumber,
          },
          include: {
            item: true,
          },
        });

        // บันทึกธุรกรรมรับเข้า (Append-only)
        await prisma.stockTransaction.create({
          data: {
            type: "RECEIVE",
            itemId: item.id,
            lotId: lot.id,
            qty: parseFloat(it.quantity),
            unitCost: parseFloat(it.unitPrice),
            totalCost: parseFloat(it.quantity) * parseFloat(it.unitPrice),
            operatorName: receiverName || "เจ้าหน้าที่รับของ",
            operatorRole: "เจ้าหน้าที่ตรวจรับของ",
            method: "AI_INVOICE",
            notes: `รับจากใบแจ้งหนี้ #${invoiceNumber} อุณหภูมิ ${temperature}°C`,
          },
        });

        createdLots.push(lot);
      }

      return NextResponse.json({
        success: true,
        message: `บันทึกรับเข้าคลังเรียบร้อย ${createdLots.length} รายการ`,
        lots: createdLots,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Receive API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
