import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 เริ่มต้นล้างข้อมูลเก่าและใส่ข้อมูลตัวอย่างครัวโรงพยาบาล...");

  // ล้างข้อมูลตามลำดับ Foreign Key
  await prisma.stockTransaction.deleteMany({});
  await prisma.recipeItem.deleteMany({});
  await prisma.dailyDemandHistory.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.lot.deleteMany({});
  await prisma.dietType.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.supplier.deleteMany({});

  // 1. ซัพพลายเออร์
  const supp1 = await prisma.supplier.create({
    data: {
      name: "บจก. สดเจริญอาหารฟาร์ม (เนื้อสัตว์และไข่สด)",
      contact: "คุณสมชาย เจริญสุข",
      phone: "081-456-7890",
      address: "88 หมู่ 4 ถ.มิตรภาพ ต.หนองสาหร่าย จ.นครราชสีมา",
    },
  });

  const supp2 = await prisma.supplier.create({
    data: {
      name: "สหกรณ์ผักปลอดภัยเพื่อโรงพยาบาล",
      contact: "คุณวิภาวรรณ สดใส",
      phone: "089-123-4567",
      address: "123 ต.แม่ริม อ.แม่ริม จ.เชียงใหม่",
    },
  });

  const supp3 = await prisma.supplier.create({
    data: {
      name: "บมจ. ไทยซีฟู้ด โคลด์เชน เซอร์วิส",
      contact: "คุณเกรียงไกร มหาสมุทร",
      phone: "086-789-0123",
      address: "45 ถ.ท้ายบ้าน ต.ปากน้ำ จ.สมุทรปราการ",
    },
  });

  const supp4 = await prisma.supplier.create({
    data: {
      name: "บจก. สยามไรซ์ แอนด์ เกรนส์ (ข้าวสารและของแห้ง)",
      contact: "คุณประสิทธิ์ รวงทอง",
      phone: "082-345-6789",
      address: "12 หมู่ 2 ต.บางระจัน จ.สิงห์บุรี",
    },
  });

  // 2. วัตถุดิบ (Items)
  const itemChicken = await prisma.item.create({
    data: {
      code: "RAW-CHK-01",
      name: "อกไก่สดลอกหนัง (เกรดโรงพยาบาล)",
      category: "เนื้อสัตว์สด",
      baseUnit: "กก.",
      packUnit: "ลัง 10 กก.",
      packSize: 10.0,
      safetyStock: 30.0,
      storageType: "แช่เย็น 0-4°C",
      defaultTempMin: 0.0,
      defaultTempMax: 4.0,
      defaultSupplierId: supp1.id,
    },
  });

  const itemPork = await prisma.item.create({
    data: {
      code: "RAW-PRK-01",
      name: "เนื้อหมูสันในสไลซ์บาง",
      category: "เนื้อสัตว์สด",
      baseUnit: "กก.",
      packUnit: "ลัง 10 กก.",
      packSize: 10.0,
      safetyStock: 25.0,
      storageType: "แช่เย็น 0-4°C",
      defaultTempMin: 0.0,
      defaultTempMax: 4.0,
      defaultSupplierId: supp1.id,
    },
  });

  const itemFish = await prisma.item.create({
    data: {
      code: "RAW-FSH-01",
      name: "เนื้อปลากะพงขาวหั่นชิ้น (แช่แข็ง)",
      category: "อาหารทะเล",
      baseUnit: "กก.",
      packUnit: "กล่อง 5 กก.",
      packSize: 5.0,
      safetyStock: 15.0,
      storageType: "แช่แข็ง -18°C",
      defaultTempMin: -25.0,
      defaultTempMax: -18.0,
      defaultSupplierId: supp3.id,
    },
  });

  const itemEgg = await prisma.item.create({
    data: {
      code: "RAW-EGG-02",
      name: "ไข่ไก่สดคัดพิเศษ เบอร์ 2",
      category: "ไข่และผลิตภัณฑ์นม",
      baseUnit: "ฟอง",
      packUnit: "แผง 30 ฟอง",
      packSize: 30.0,
      safetyStock: 150.0,
      storageType: "อุณหภูมิห้อง",
      defaultTempMin: 18.0,
      defaultTempMax: 25.0,
      defaultSupplierId: supp1.id,
    },
  });

  const itemCabbage = await prisma.item.create({
    data: {
      code: "RAW-VEG-01",
      name: "ผักกาดขาวอินทรีย์ตัดแต่ง",
      category: "ผักสด",
      baseUnit: "กก.",
      packUnit: "ถุง 5 กก.",
      packSize: 5.0,
      safetyStock: 20.0,
      storageType: "แช่เย็น 0-4°C",
      defaultTempMin: 1.0,
      defaultTempMax: 4.0,
      defaultSupplierId: supp2.id,
    },
  });

  const itemRice = await prisma.item.create({
    data: {
      code: "RAW-RIC-01",
      name: "ข้าวหอมมะลิ 100% คัดพิเศษ",
      category: "ข้าวและธัญพืช",
      baseUnit: "กก.",
      packUnit: "กระสอบ 50 กก.",
      packSize: 50.0,
      safetyStock: 150.0,
      storageType: "อุณหภูมิห้อง",
      defaultSupplierId: supp4.id,
    },
  });

  const itemTofu = await prisma.item.create({
    data: {
      code: "RAW-TOFU-01",
      name: "เต้าหู้ไข่ไก่หลอด",
      category: "ของสด",
      baseUnit: "หลอด",
      packUnit: "แพ็ค 20 หลอด",
      packSize: 20.0,
      safetyStock: 40.0,
      storageType: "แช่เย็น 0-4°C",
      defaultTempMin: 0.0,
      defaultTempMax: 4.0,
      defaultSupplierId: supp1.id,
    },
  });

  // 3. ประเภทอาหารโรงพยาบาล (Diet Types)
  const dtRegular = await prisma.dietType.create({
    data: {
      code: "REGULAR",
      name: "อาหารทั่วไป (Normal Diet)",
      description: "อาหารธรรมดาสำหรับผู้ป่วยที่ไม่มีข้อจำกัดด้านโรค",
      currentPatientCount: 75,
    },
  });

  const dtDiabetic = await prisma.dietType.create({
    data: {
      code: "DIABETIC",
      name: "อาหารเบาหวาน (Diabetic DM)",
      description: "จำกัดคาร์โบไฮเดรตและน้ำตาล เน้นโปรตีนไม่ติดมันและผักใยอาหารสูง",
      currentPatientCount: 35,
    },
  });

  const dtLowSalt = await prisma.dietType.create({
    data: {
      code: "LOW_SODIUM",
      name: "อาหารโรคไต / จำกัดโซเดียม (Low Sodium)",
      description: "จำกัดเกลือและแร่ธาตุฟอสฟอรัส โพแทสเซียมตามแพทย์สั่ง",
      currentPatientCount: 25,
    },
  });

  const dtSoft = await prisma.dietType.create({
    data: {
      code: "SOFT_BLAND",
      name: "อาหารอ่อน / ปั่นผสม (Soft / Blenderized)",
      description: "สำหรับผู้ป่วยกลืนลำบาก ย่อยง่าย เนื้อสัตว์บดละเอียดหรือปั่นข้น",
      currentPatientCount: 20,
    },
  });

  const dtHalal = await prisma.dietType.create({
    data: {
      code: "HALAL",
      name: "อาหารฮาลาล (Halal Diet)",
      description: "ปรุงตามหลักศาสนาอิสลาม แยกภาชนะและพื้นที่ปรุงเข้มงวด",
      currentPatientCount: 15,
    },
  });

  // 4. สูตรอาหารมาตรฐาน (Recipe BOM - ปริมาณต่อผู้ป่วย 1 คนต่อวัน ใน 3 มื้อ)
  await prisma.recipeItem.createMany({
    data: [
      // Regular: อกไก่ 0.15 กก., ผักกาดขาว 0.12 กก., ข้าว 0.25 กก., ไข่ 1 ฟอง
      { dietTypeId: dtRegular.id, itemId: itemChicken.id, qtyPerPatient: 0.15 },
      { dietTypeId: dtRegular.id, itemId: itemCabbage.id, qtyPerPatient: 0.12 },
      { dietTypeId: dtRegular.id, itemId: itemRice.id, qtyPerPatient: 0.25 },
      { dietTypeId: dtRegular.id, itemId: itemEgg.id, qtyPerPatient: 1.0 },

      // Diabetic: อกไก่ 0.18 กก., ผักกาดขาว 0.18 กก., ข้าว 0.15 กก., ไข่ 1 ฟอง
      { dietTypeId: dtDiabetic.id, itemId: itemChicken.id, qtyPerPatient: 0.18 },
      { dietTypeId: dtDiabetic.id, itemId: itemCabbage.id, qtyPerPatient: 0.18 },
      { dietTypeId: dtDiabetic.id, itemId: itemRice.id, qtyPerPatient: 0.15 },
      { dietTypeId: dtDiabetic.id, itemId: itemEgg.id, qtyPerPatient: 1.0 },

      // Low Sodium: ปลากะพง 0.15 กก., ผักกาดขาว 0.10 กก., ข้าว 0.20 กก., เต้าหู้ 0.5 หลอด
      { dietTypeId: dtLowSalt.id, itemId: itemFish.id, qtyPerPatient: 0.15 },
      { dietTypeId: dtLowSalt.id, itemId: itemCabbage.id, qtyPerPatient: 0.10 },
      { dietTypeId: dtLowSalt.id, itemId: itemRice.id, qtyPerPatient: 0.20 },
      { dietTypeId: dtLowSalt.id, itemId: itemTofu.id, qtyPerPatient: 0.5 },

      // Soft: เต้าหู้ 1.0 หลอด, ไข่ 2 ฟอง, ข้าว 0.20 กก., อกไก่ 0.10 กก.
      { dietTypeId: dtSoft.id, itemId: itemTofu.id, qtyPerPatient: 1.0 },
      { dietTypeId: dtSoft.id, itemId: itemEgg.id, qtyPerPatient: 2.0 },
      { dietTypeId: dtSoft.id, itemId: itemRice.id, qtyPerPatient: 0.20 },
      { dietTypeId: dtSoft.id, itemId: itemChicken.id, qtyPerPatient: 0.10 },

      // Halal: อกไก่ 0.20 กก., ผักกาดขาว 0.15 กก., ข้าว 0.25 กก., ไข่ 1 ฟอง
      { dietTypeId: dtHalal.id, itemId: itemChicken.id, qtyPerPatient: 0.20 },
      { dietTypeId: dtHalal.id, itemId: itemCabbage.id, qtyPerPatient: 0.15 },
      { dietTypeId: dtHalal.id, itemId: itemRice.id, qtyPerPatient: 0.25 },
      { dietTypeId: dtHalal.id, itemId: itemEgg.id, qtyPerPatient: 1.0 },
    ],
  });

  // 5. สต๊อกและล็อต (Lots) - จัดสรรให้มีทั้งล็อตใกล้หมดอายุ (2 วัน) เพื่อทดสอบแดชบอร์ดเตือน
  const now = new Date();
  const d2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const d5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const d14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const d60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  // ล็อต 1 อกไก่ (ใกล้หมดอายุใน 2 วัน - FEFO ต้องเบิกตัวนี้ก่อน!)
  const lotChk1 = await prisma.lot.create({
    data: {
      lotNumber: "LOT-CHK-25690919-01",
      itemId: itemChicken.id,
      supplierId: supp1.id,
      receivedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      expiryDate: d2Days,
      initialQty: 40.0,
      remainingQty: 12.5,
      unitCost: 85.0,
      receivedTemp: 2.8,
      tempStatus: "PASS",
      invoiceNumber: "INV-SJ-8902",
      receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
      notes: "แช่ตู้เย็น CHILL-01 ชั้น 2",
      qrCode: "LOT-CHK-25690919-01",
    },
  });

  // ล็อต 2 อกไก่ (หมดอายุใน 5 วัน)
  const lotChk2 = await prisma.lot.create({
    data: {
      lotNumber: "LOT-CHK-25690921-02",
      itemId: itemChicken.id,
      supplierId: supp1.id,
      receivedDate: now,
      expiryDate: d5Days,
      initialQty: 50.0,
      remainingQty: 50.0,
      unitCost: 88.0,
      receivedTemp: 3.1,
      tempStatus: "PASS",
      invoiceNumber: "INV-SJ-9014",
      receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
      notes: "แช่ตู้เย็น CHILL-01 ชั้น 1",
      qrCode: "LOT-CHK-25690921-02",
    },
  });

  // ล็อต ผักกาดขาว (ใกล้หมดอายุใน 2 วัน)
  await prisma.lot.create({
    data: {
      lotNumber: "LOT-VEG-25690919-01",
      itemId: itemCabbage.id,
      supplierId: supp2.id,
      receivedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      expiryDate: d2Days,
      initialQty: 30.0,
      remainingQty: 8.0,
      unitCost: 35.0,
      receivedTemp: 3.5,
      tempStatus: "PASS",
      invoiceNumber: "INV-VG-4512",
      receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
      notes: "แช่ตู้เย็น VEG-CHILL",
      qrCode: "LOT-VEG-25690919-01",
    },
  });

  // ล็อต ปลากะพงแช่แข็ง (-19.5°C)
  await prisma.lot.create({
    data: {
      lotNumber: "LOT-FSH-25690915-01",
      itemId: itemFish.id,
      supplierId: supp3.id,
      receivedDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      expiryDate: d60Days,
      initialQty: 25.0,
      remainingQty: 10.0,
      unitCost: 220.0,
      receivedTemp: -19.5,
      tempStatus: "PASS",
      invoiceNumber: "INV-TS-7821",
      receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
      notes: "ตู้แช่แข็ง FREEZE-02",
      qrCode: "LOT-FSH-25690915-01",
    },
  });

  // ล็อต ไข่ไก่
  await prisma.lot.create({
    data: {
      lotNumber: "LOT-EGG-25690918-01",
      itemId: itemEgg.id,
      supplierId: supp1.id,
      receivedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      expiryDate: d14Days,
      initialQty: 300.0,
      remainingQty: 120.0,
      unitCost: 4.2,
      receivedTemp: 22.0,
      tempStatus: "PASS",
      invoiceNumber: "INV-SJ-8890",
      receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
      notes: "ชั้นวางของแห้ง DRY-A1",
      qrCode: "LOT-EGG-25690918-01",
    },
  });

  // ล็อต ข้าวสาร
  await prisma.lot.create({
    data: {
      lotNumber: "LOT-RIC-25690910-01",
      itemId: itemRice.id,
      supplierId: supp4.id,
      receivedDate: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
      expiryDate: d60Days,
      initialQty: 200.0,
      remainingQty: 110.0,
      unitCost: 42.0,
      receivedTemp: null,
      tempStatus: "PASS",
      invoiceNumber: "INV-SR-1102",
      receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
      notes: "คลังข้าวสาร RICE-ROOM",
      qrCode: "LOT-RIC-25690910-01",
    },
  });

  // ล็อต เต้าหู้ไข่
  await prisma.lot.create({
    data: {
      lotNumber: "LOT-TOFU-25690918-01",
      itemId: itemTofu.id,
      supplierId: supp1.id,
      receivedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      expiryDate: d5Days,
      initialQty: 60.0,
      remainingQty: 25.0,
      unitCost: 12.0,
      receivedTemp: 2.1,
      tempStatus: "PASS",
      invoiceNumber: "INV-SJ-8890",
      receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
      notes: "ตู้เย็น CHILL-02",
      qrCode: "LOT-TOFU-25690918-01",
    },
  });

  // 6. บันทึกประวัติการเบิกใช้ เพื่อให้พร้อมสำหรับระบบ Mock Recall ใน 1 นาที!
  await prisma.stockTransaction.create({
    data: {
      type: "DISPENSE",
      itemId: itemChicken.id,
      lotId: lotChk1.id,
      qty: 15.0,
      unitCost: 85.0,
      totalCost: 1275.0,
      menuName: "ต้มข่าไก่สูตรลดเค็ม (มื้อเที่ยง หอผู้ป่วยอายุรกรรม)",
      operatorName: "ป้าสมศรี (แม่ครัวเอก)",
      operatorRole: "พ่อครัว / แม่ครัว",
      method: "QR_SCAN",
      notes: "เบิกปรุงอาหารกลางวัน 75 ที่",
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
  });

  await prisma.stockTransaction.create({
    data: {
      type: "DISPENSE",
      itemId: itemChicken.id,
      lotId: lotChk1.id,
      qty: 12.5,
      unitCost: 85.0,
      totalCost: 1062.5,
      menuName: "อกไก่ตุ๋นเห็ดหอม (มื้อเย็น หอผู้ป่วยศัลยกรรม)",
      operatorName: "เชฟวิชัย",
      operatorRole: "พ่อครัว / แม่ครัว",
      method: "VOICE",
      notes: "สั่งการด้วยเสียงผ่านแท็บเล็ตครัว",
      createdAt: new Date(now.getTime() - 14 * 60 * 60 * 1000),
    },
  });

  // 7. สถิติการเบิกใช้ 14 วันย้อนหลัง (DailyDemandHistory)
  for (let i = 1; i <= 14; i++) {
    const histDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    await prisma.dailyDemandHistory.createMany({
      data: [
        { date: histDate, itemId: itemChicken.id, consumedQty: 26.0 + (i % 5) },
        { date: histDate, itemId: itemCabbage.id, consumedQty: 18.0 + (i % 4) },
        { date: histDate, itemId: itemRice.id, consumedQty: 35.0 + (i % 6) },
        { date: histDate, itemId: itemEgg.id, consumedQty: 120.0 + (i % 15) },
        { date: histDate, itemId: itemFish.id, consumedQty: 8.0 + (i % 3) },
        { date: histDate, itemId: itemTofu.id, consumedQty: 22.0 + (i % 5) },
      ],
    });
  }

  console.log("✅ Seed ข้อมูลเสร็จสมบูรณ์เรียบร้อย!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
