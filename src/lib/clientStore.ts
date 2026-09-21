// Client-side Local Storage & Demo Simulator for GitHub Pages (Offline / Static Hosting)

export interface MockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  baseUnit: string;
  packUnit: string;
  packSize: number;
  safetyStock: number;
  storageType: string;
  totalStock: number;
  isLowStock: boolean;
  lots: any[];
}

const INITIAL_ITEMS = [
  {
    id: "item-chk",
    code: "RAW-CHK-01",
    name: "อกไก่สดลอกหนัง (เกรดโรงพยาบาล)",
    category: "เนื้อสัตว์สด",
    baseUnit: "กก.",
    packUnit: "ลัง 10 กก.",
    packSize: 10,
    safetyStock: 30,
    storageType: "แช่เย็น 0-4°C",
    totalStock: 62.5,
    isLowStock: false,
    lots: [
      {
        id: "lot-chk-1",
        lotNumber: "LOT-CHK-25690919-01",
        receivedDate: "2026-09-19T08:00:00.000Z",
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        initialQty: 40,
        remainingQty: 12.5,
        unitCost: 85,
        receivedTemp: 2.8,
        tempStatus: "PASS",
        invoiceNumber: "INV-SJ-8902",
        receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
        isRecalled: false,
      },
      {
        id: "lot-chk-2",
        lotNumber: "LOT-CHK-25690921-02",
        receivedDate: "2026-09-21T08:00:00.000Z",
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        initialQty: 50,
        remainingQty: 50,
        unitCost: 88,
        receivedTemp: 3.1,
        tempStatus: "PASS",
        invoiceNumber: "INV-SJ-9014",
        receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
        isRecalled: false,
      },
    ],
  },
  {
    id: "item-veg",
    code: "RAW-VEG-01",
    name: "ผักกาดขาวอินทรีย์ตัดแต่ง",
    category: "ผักสด",
    baseUnit: "กก.",
    packUnit: "ถุง 5 กก.",
    packSize: 5,
    safetyStock: 20,
    storageType: "แช่เย็น 0-4°C",
    totalStock: 8,
    isLowStock: true,
    lots: [
      {
        id: "lot-veg-1",
        lotNumber: "LOT-VEG-25690919-01",
        receivedDate: "2026-09-19T08:00:00.000Z",
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        initialQty: 30,
        remainingQty: 8,
        unitCost: 35,
        receivedTemp: 3.5,
        tempStatus: "PASS",
        invoiceNumber: "INV-VG-4512",
        receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
        isRecalled: false,
      },
    ],
  },
  {
    id: "item-fsh",
    code: "RAW-FSH-01",
    name: "เนื้อปลากะพงขาวหั่นชิ้น (แช่แข็ง)",
    category: "อาหารทะเล",
    baseUnit: "กก.",
    packUnit: "กล่อง 5 กก.",
    packSize: 5,
    safetyStock: 15,
    storageType: "แช่แข็ง -18°C",
    totalStock: 10,
    isLowStock: true,
    lots: [
      {
        id: "lot-fsh-1",
        lotNumber: "LOT-FSH-25690915-01",
        receivedDate: "2026-09-15T08:00:00.000Z",
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        initialQty: 25,
        remainingQty: 10,
        unitCost: 220,
        receivedTemp: -19.5,
        tempStatus: "PASS",
        invoiceNumber: "INV-TS-7821",
        receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
        isRecalled: false,
      },
    ],
  },
  {
    id: "item-egg",
    code: "RAW-EGG-02",
    name: "ไข่ไก่สดคัดพิเศษ เบอร์ 2",
    category: "ไข่และผลิตภัณฑ์นม",
    baseUnit: "ฟอง",
    packUnit: "แผง 30 ฟอง",
    packSize: 30,
    safetyStock: 150,
    storageType: "อุณหภูมิห้อง",
    totalStock: 120,
    isLowStock: true,
    lots: [
      {
        id: "lot-egg-1",
        lotNumber: "LOT-EGG-25690918-01",
        receivedDate: "2026-09-18T08:00:00.000Z",
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        initialQty: 300,
        remainingQty: 120,
        unitCost: 4.2,
        receivedTemp: 22,
        tempStatus: "PASS",
        invoiceNumber: "INV-SJ-8890",
        receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
        isRecalled: false,
      },
    ],
  },
  {
    id: "item-ric",
    code: "RAW-RIC-01",
    name: "ข้าวหอมมะลิ 100% คัดพิเศษ",
    category: "ข้าวและธัญพืช",
    baseUnit: "กก.",
    packUnit: "กระสอบ 50 กก.",
    packSize: 50,
    safetyStock: 150,
    storageType: "อุณหภูมิห้อง",
    totalStock: 110,
    isLowStock: true,
    lots: [
      {
        id: "lot-ric-1",
        lotNumber: "LOT-RIC-25690910-01",
        receivedDate: "2026-09-10T08:00:00.000Z",
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        initialQty: 200,
        remainingQty: 110,
        unitCost: 42,
        receivedTemp: null,
        tempStatus: "PASS",
        invoiceNumber: "INV-SR-1102",
        receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
        isRecalled: false,
      },
    ],
  },
  {
    id: "item-tofu",
    code: "RAW-TOFU-01",
    name: "เต้าหู้ไข่ไก่หลอด",
    category: "ของสด",
    baseUnit: "หลอด",
    packUnit: "แพ็ค 20 หลอด",
    packSize: 20,
    safetyStock: 40,
    storageType: "แช่เย็น 0-4°C",
    totalStock: 25,
    isLowStock: true,
    lots: [
      {
        id: "lot-tofu-1",
        lotNumber: "LOT-TOFU-25690918-01",
        receivedDate: "2026-09-18T08:00:00.000Z",
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        initialQty: 60,
        remainingQty: 25,
        unitCost: 12,
        receivedTemp: 2.1,
        tempStatus: "PASS",
        invoiceNumber: "INV-SJ-8890",
        receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
        isRecalled: false,
      },
    ],
  },
];

const INITIAL_DIET_TYPES = [
  { id: "dt-reg", code: "REGULAR", name: "อาหารทั่วไป (Normal Diet)", description: "อาหารธรรมดาสำหรับผู้ป่วยทั่วไป", currentPatientCount: 75 },
  { id: "dt-dm", code: "DIABETIC", name: "อาหารเบาหวาน (Diabetic DM)", description: "จำกัดคาร์โบไฮเดรตและน้ำตาล", currentPatientCount: 35 },
  { id: "dt-na", code: "LOW_SODIUM", name: "อาหารโรคไต / จำกัดโซเดียม", description: "จำกัดเกลือและแร่ธาตุตามแพทย์สั่ง", currentPatientCount: 25 },
  { id: "dt-soft", code: "SOFT_BLAND", name: "อาหารอ่อน / ปั่นผสม (Soft)", description: "กลืนง่าย ย่อยง่าย เนื้อสัตว์บดละเอียด", currentPatientCount: 20 },
  { id: "dt-halal", code: "HALAL", name: "อาหารฮาลาล (Halal Diet)", description: "ปรุงตามหลักศาสนาอิสลามเคร่งครัด", currentPatientCount: 15 },
];

export const clientStore = {
  getItems: (): any[] => {
    if (typeof window === "undefined") return INITIAL_ITEMS;
    const s = localStorage.getItem("hospital_client_items");
    return s ? JSON.parse(s) : INITIAL_ITEMS;
  },
  saveItems: (items: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hospital_client_items", JSON.stringify(items));
    }
  },
  getDietTypes: () => {
    if (typeof window === "undefined") return INITIAL_DIET_TYPES;
    const s = localStorage.getItem("hospital_client_diets");
    return s ? JSON.parse(s) : INITIAL_DIET_TYPES;
  },
  saveDietTypes: (diets: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hospital_client_diets", JSON.stringify(diets));
    }
  },
  reset: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hospital_client_items");
      localStorage.removeItem("hospital_client_diets");
    }
  },

  // Dashboard Summary
  getInventoryData: () => {
    const items = clientStore.getItems();
    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const expiringLots: any[] = [];
    items.forEach((it: any) => {
      it.lots.forEach((lot: any) => {
        if (new Date(lot.expiryDate) <= threeDays && lot.remainingQty > 0 && !lot.isRecalled) {
          expiringLots.push({ ...lot, item: it });
        }
      });
    });

    const lowStockItems = items.filter((it: any) => it.isLowStock);
    const diets = clientStore.getDietTypes();
    const totalPatients = diets.reduce((s: number, d: any) => s + d.currentPatientCount, 0);

    return {
      success: true,
      items,
      expiringLots,
      lowStockItemsCount: lowStockItems.length,
      expiringLotsCount: expiringLots.length,
      recentTransactions: [
        {
          id: "tx-1",
          type: "DISPENSE",
          qty: 12.5,
          unitCost: 85,
          totalCost: 1062.5,
          menuName: "ต้มข่าไก่สูตรลดเค็ม (มื้อเที่ยง หอผู้ป่วยอายุรกรรม)",
          operatorName: "ป้าสมศรี (แม่ครัวเอก)",
          operatorRole: "พ่อครัว / แม่ครัว",
          method: "QR_SCAN",
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          item: items[0],
        },
        {
          id: "tx-2",
          type: "RECEIVE",
          qty: 40,
          unitCost: 85,
          totalCost: 3400,
          menuName: "รับเข้าคลังมาตรฐาน HACCP",
          operatorName: "นายประสิทธิ์",
          operatorRole: "เจ้าหน้าที่ตรวจรับของ",
          method: "AI_INVOICE",
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          item: items[0],
        }
      ],
      metrics: {
        totalTodayCost: 2337.5,
        totalPatients,
        costPerPatient: Math.round((2337.5 / totalPatients) * 100) / 100,
        activeLotsCount: 8,
      }
    };
  },

  // Inbound Receiving Preset
  extractInvoice: (presetKey: string) => {
    const presets: Record<string, any> = {
      meat: {
        supplierName: "บจก. สดเจริญอาหารฟาร์ม (เนื้อสัตว์และไข่สด)",
        invoiceNumber: "INV-SJ-8905",
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
        ],
      },
      veg: {
        supplierName: "สหกรณ์ผักปลอดภัยเพื่อโรงพยาบาล",
        invoiceNumber: "INV-VG-4519",
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
        invoiceNumber: "INV-TS-7829",
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
    return presets[presetKey] || presets.meat;
  },

  // Confirm Inbound Receive
  confirmReceive: (payload: any) => {
    const items = clientStore.getItems();
    const createdLots: any[] = [];

    payload.items.forEach((it: any) => {
      let target = items.find((x: any) => x.name.includes(it.itemName.slice(0, 5))) || items[0];
      const newLot = {
        id: `lot-${Date.now()}-${Math.random()}`,
        lotNumber: it.lotNumber,
        receivedDate: new Date().toISOString(),
        expiryDate: it.expiryDate,
        initialQty: it.quantity,
        remainingQty: it.quantity,
        unitCost: it.unitPrice,
        receivedTemp: parseFloat(payload.temperature) || 2.5,
        tempStatus: "PASS",
        invoiceNumber: payload.invoiceNumber,
        receiverName: payload.receiverName,
        isRecalled: false,
        item: target,
      };
      target.lots.unshift(newLot);
      target.totalStock += it.quantity;
      createdLots.push(newLot);
    });

    clientStore.saveItems(items);
    return {
      success: true,
      message: `รับเข้าคลังเรียบร้อย ${createdLots.length} รายการ`,
      lots: createdLots,
    };
  },

  // Calculate FEFO
  calculateFefo: (itemId: string, requestedQty: number) => {
    const items = clientStore.getItems();
    const item = items.find((x: any) => x.id === itemId) || items[0];
    const availableLots = item.lots
      .filter((l: any) => l.remainingQty > 0 && !l.isRecalled)
      .sort((a: any, b: any) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    let needed = requestedQty;
    const allocations: any[] = [];
    let totalCost = 0;

    for (const lot of availableLots) {
      if (needed <= 0) break;
      const take = Math.min(lot.remainingQty, needed);
      allocations.push({
        lotId: lot.id,
        lotNumber: lot.lotNumber,
        expiryDate: lot.expiryDate,
        allocatedQty: take,
        unitCost: lot.unitCost,
        totalCost: take * lot.unitCost,
        remainingAfter: lot.remainingQty - take,
      });
      totalCost += take * lot.unitCost;
      needed -= take;
    }

    const totalAvailable = item.lots.reduce((s: number, l: any) => s + l.remainingQty, 0);

    return {
      itemId: item.id,
      itemName: item.name,
      requestedQty,
      unit: item.baseUnit,
      canFulfill: totalAvailable >= requestedQty,
      totalAvailable,
      allocations,
      totalCost,
      averageUnitCost: requestedQty > 0 ? totalCost / requestedQty : 0,
    };
  },

  // Confirm Dispense
  confirmDispense: (payload: any) => {
    const items = clientStore.getItems();
    const item = items.find((x: any) => x.id === payload.itemId) || items[0];
    const fefo = clientStore.calculateFefo(item.id, payload.requestedQty);

    fefo.allocations.forEach((alloc: any) => {
      const lot = item.lots.find((l: any) => l.id === alloc.lotId);
      if (lot) {
        lot.remainingQty = alloc.remainingAfter;
      }
    });
    item.totalStock = Math.max(0, item.totalStock - payload.requestedQty);
    clientStore.saveItems(items);

    return {
      success: true,
      message: `ตัดยอดสต๊อกสำเร็จ ${payload.requestedQty} ${item.baseUnit} เรียบร้อยแล้ว`,
      allocations: fefo.allocations,
      totalCost: fefo.totalCost,
      item,
    };
  },

  // Forecast & PO
  getForecast: (patientCountsOverride?: Record<string, number>) => {
    const diets = clientStore.getDietTypes();
    const items = clientStore.getItems();

    const counts: Record<string, number> = {};
    diets.forEach((d: any) => {
      counts[d.id] = patientCountsOverride && patientCountsOverride[d.id] !== undefined
        ? patientCountsOverride[d.id]
        : d.currentPatientCount;
    });

    const groups = [
      {
        supplierId: "supp-1",
        supplierName: "บจก. สดเจริญอาหารฟาร์ม (เนื้อสัตว์และไข่สด)",
        itemCount: 2,
        totalEstimatedAmount: 3840,
        items: [
          {
            itemId: items[0].id,
            itemName: items[0].name,
            packUnit: items[0].packUnit,
            packSize: items[0].packSize,
            baseUnit: items[0].baseUnit,
            packsToOrder: 3,
            totalOrderQty: 30,
            calculatedDailyDemand: 26.5,
            currentStock: items[0].totalStock,
            safetyStock: items[0].safetyStock,
            calculationMethod: "RECIPE_BOM",
            estimatedTotalCost: 2550,
          },
          {
            itemId: items[3].id,
            itemName: items[3].name,
            packUnit: items[3].packUnit,
            packSize: items[3].packSize,
            baseUnit: items[3].baseUnit,
            packsToOrder: 5,
            totalOrderQty: 150,
            calculatedDailyDemand: 165,
            currentStock: items[3].totalStock,
            safetyStock: items[3].safetyStock,
            calculationMethod: "RECIPE_BOM",
            estimatedTotalCost: 630,
          }
        ]
      },
      {
        supplierId: "supp-2",
        supplierName: "สหกรณ์ผักปลอดภัยเพื่อโรงพยาบาล",
        itemCount: 1,
        totalEstimatedAmount: 1050,
        items: [
          {
            itemId: items[1].id,
            itemName: items[1].name,
            packUnit: items[1].packUnit,
            packSize: items[1].packSize,
            baseUnit: items[1].baseUnit,
            packsToOrder: 6,
            totalOrderQty: 30,
            calculatedDailyDemand: 22.5,
            currentStock: items[1].totalStock,
            safetyStock: items[1].safetyStock,
            calculationMethod: "RECIPE_BOM",
            estimatedTotalCost: 1050,
          }
        ]
      }
    ];

    return {
      success: true,
      dietTypes: diets,
      groups,
      grandTotal: 4890,
      totalItemsToOrder: 3,
    };
  },

  // Recall Dossier
  getRecentLots: () => {
    const items = clientStore.getItems();
    const lots: any[] = [];
    items.forEach((it: any) => {
      it.lots.forEach((l: any) => {
        lots.push({
          lotNumber: l.lotNumber,
          itemName: it.name,
          receivedDate: l.receivedDate,
          remainingQty: l.remainingQty,
          unit: it.baseUnit,
          isRecalled: l.isRecalled || false,
        });
      });
    });
    return lots;
  },

  getRecallDossier: (lotNumber: string) => {
    const items = clientStore.getItems();
    let targetItem: any = null;
    let targetLot: any = null;

    for (const it of items) {
      const found = it.lots.find((l: any) => l.lotNumber === lotNumber);
      if (found) {
        targetItem = it;
        targetLot = found;
        break;
      }
    }

    if (targetLot && targetItem) {
      return {
        success: true,
        summary: {
          lotNumber: targetLot.lotNumber,
          itemName: targetItem.name,
          itemCode: targetItem.code,
          category: targetItem.category,
          supplierName: "บจก. สดเจริญอาหารฟาร์ม (ซัพพลายเออร์หลัก)",
          supplierContact: "คุณสมชาย เจริญสุข โทร 081-456-7890",
          invoiceNumber: targetLot.invoiceNumber || "INV-GEN-9901",
          receivedDate: targetLot.receivedDate,
          expiryDate: targetLot.expiryDate,
          receivedTemp: `${targetLot.receivedTemp} °C`,
          tempStatus: targetLot.tempStatus || "PASS",
          receiverName: targetLot.receiverName || "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
          initialQty: targetLot.initialQty,
          remainingQty: targetLot.remainingQty,
          totalDispensed: targetLot.initialQty - targetLot.remainingQty,
          unit: targetItem.baseUnit,
          isRecalled: targetLot.isRecalled || false,
          recallReason: targetLot.recallReason || null,
          recalledAt: targetLot.recalledAt || null,
          affectedMenus: [
            {
              menuName: `เมนูปรุงสดประจำวัน (${targetItem.name})`,
              qtyUsed: Math.max(0, targetLot.initialQty - targetLot.remainingQty),
              unit: targetItem.baseUnit,
              usedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
              operatorName: "ป้าสมศรี (แม่ครัวเอก)",
              method: "QR_SCAN",
              notes: "เบิกปรุงอาหารกลางวันหอผู้ป่วย",
            },
          ],
        },
      };
    }

    return {
      success: true,
      summary: {
        lotNumber: lotNumber || "LOT-CHK-25690919-01",
        itemName: "อกไก่สดลอกหนัง (เกรดโรงพยาบาล)",
        itemCode: "RAW-CHK-01",
        category: "เนื้อสัตว์สด",
        supplierName: "บจก. สดเจริญอาหารฟาร์ม (เนื้อสัตว์และไข่สด)",
        supplierContact: "คุณสมชาย เจริญสุข โทร 081-456-7890",
        invoiceNumber: "INV-SJ-8902",
        receivedDate: "2026-09-19T08:00:00.000Z",
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        receivedTemp: "2.8 °C",
        tempStatus: "PASS",
        receiverName: "นายประสิทธิ์ (เจ้าหน้าที่รับของ)",
        initialQty: 40,
        remainingQty: 12.5,
        totalDispensed: 27.5,
        unit: "กก.",
        isRecalled: false,
        recallReason: null,
        recalledAt: null,
        affectedMenus: [
          {
            menuName: "ต้มข่าไก่สูตรลดเค็ม (มื้อเที่ยง หอผู้ป่วยอายุรกรรม)",
            qtyUsed: 15,
            unit: "กก.",
            usedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            operatorName: "ป้าสมศรี (แม่ครัวเอก)",
            method: "QR_SCAN",
            notes: "เบิกปรุงอาหารกลางวัน 75 ที่",
          },
          {
            menuName: "อกไก่ตุ๋นเห็ดหอม (มื้อเย็น หอผู้ป่วยศัลยกรรม)",
            qtyUsed: 12.5,
            unit: "กก.",
            usedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
            operatorName: "เชฟวิชัย",
            method: "VOICE",
            notes: "สั่งการด้วยเสียงผ่านแท็บเล็ตครัว",
          },
        ],
      },
    };
  },

  triggerRecall: (lotNumber: string, reason: string) => {
    const items = clientStore.getItems();
    let found = false;
    for (const it of items) {
      for (const l of it.lots) {
        if (l.lotNumber === lotNumber) {
          l.isRecalled = true;
          l.recallReason = reason;
          l.recalledAt = new Date().toISOString();
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (found) {
      clientStore.saveItems(items);
    }
    return {
      success: true,
      message: `ระงับและกักกันล็อต ${lotNumber} เรียบร้อยแล้ว (ล็อคสต๊อกคงเหลือ 100%)`,
    };
  },
};
