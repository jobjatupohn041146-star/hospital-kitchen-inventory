import { prisma } from "./prisma";

export interface DemandCalculationItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  baseUnit: string;
  packUnit: string;
  packSize: number;
  currentStock: number;
  safetyStock: number;
  calculatedDailyDemand: number;
  calculationMethod: "RECIPE_BOM" | "14_DAY_AVG";
  netRequired: number;
  packsToOrder: number;
  totalOrderQty: number;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  supplierId: string | null;
  supplierName: string;
}

export interface SupplierPurchaseOrderGroup {
  supplierId: string;
  supplierName: string;
  supplierPhone?: string | null;
  items: DemandCalculationItem[];
  totalEstimatedAmount: number;
  itemCount: number;
}

/**
 * คำนวณความต้องการวัตถุดิบและสร้างยอดสั่งซื้อพรุ่งนี้
 */
export async function calculateTomorrowPurchaseOrders(
  patientCountsOverride?: Record<string, number>
): Promise<{
  groups: SupplierPurchaseOrderGroup[];
  grandTotal: number;
  totalItemsToOrder: number;
}> {
  // 1. ดึงประเภทอาหารและยอดผู้ป่วย
  const dietTypes = await prisma.dietType.findMany({
    include: {
      recipeItems: true,
    },
  });

  const patientCounts: Record<string, number> = {};
  for (const dt of dietTypes) {
    patientCounts[dt.id] =
      patientCountsOverride && patientCountsOverride[dt.id] !== undefined
        ? patientCountsOverride[dt.id]
        : dt.currentPatientCount;
  }

  // 2. ดึงรายการวัตถุดิบพร้อมล็อตคงเหลือ และซัพพลายเออร์
  const items = await prisma.item.findMany({
    include: {
      supplier: true,
      lots: {
        where: {
          remainingQty: { gt: 0 },
          isRecalled: false,
        },
      },
      recipeItems: true,
      demandHistory: {
        orderBy: { date: "desc" },
        take: 14,
      },
    },
  });

  const calculationResults: DemandCalculationItem[] = [];

  for (const item of items) {
    // คำนวณสต๊อกคงเหลือปัจจุบัน
    const currentStock = item.lots.reduce((sum, l) => sum + l.remainingQty, 0);

    // ต้นทุนล่าสุด
    const latestLot = item.lots.length > 0 ? item.lots[0] : null;
    const estimatedUnitCost = latestLot ? latestLot.unitCost : 0;

    // คำนวณความต้องการจาก Recipe BOM
    let demandFromRecipe = 0;
    let hasRecipeConfigured = false;

    for (const rItem of item.recipeItems) {
      const pCount = patientCounts[rItem.dietTypeId] || 0;
      demandFromRecipe += pCount * rItem.qtyPerPatient;
      hasRecipeConfigured = true;
    }

    let dailyDemand = demandFromRecipe;
    let method: "RECIPE_BOM" | "14_DAY_AVG" = "RECIPE_BOM";

    // หากไม่มีการผูกสูตรอาหาร ให้ใช้ค่าเฉลี่ย 14 วันย้อนหลัง
    if (!hasRecipeConfigured || dailyDemand <= 0) {
      if (item.demandHistory.length > 0) {
        const totalHist = item.demandHistory.reduce((sum, h) => sum + h.consumedQty, 0);
        dailyDemand = totalHist / item.demandHistory.length;
        method = "14_DAY_AVG";
      } else {
        dailyDemand = item.safetyStock * 0.5; // fallback ถ้าไม่มีประวัติ
      }
    }

    // คำนวณยอดที่ต้องสั่ง = (ที่ต้องใช้ + safety stock) - คงเหลือปัจจุบัน
    const netRequired = Math.max(0, dailyDemand + item.safetyStock - currentStock);

    // ปัดเศษตามขนาดแพ็ค (Pack Size)
    const packSize = item.packSize > 0 ? item.packSize : 1.0;
    const packsToOrder = netRequired > 0 ? Math.ceil(netRequired / packSize) : 0;
    const totalOrderQty = packsToOrder * packSize;
    const estimatedTotalCost = totalOrderQty * estimatedUnitCost;

    calculationResults.push({
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      category: item.category,
      baseUnit: item.baseUnit,
      packUnit: item.packUnit,
      packSize: item.packSize,
      currentStock,
      safetyStock: item.safetyStock,
      calculatedDailyDemand: Math.round(dailyDemand * 10) / 10,
      calculationMethod: method,
      netRequired: Math.round(netRequired * 10) / 10,
      packsToOrder,
      totalOrderQty,
      estimatedUnitCost,
      estimatedTotalCost,
      supplierId: item.supplier ? item.supplier.id : null,
      supplierName: item.supplier ? item.supplier.name : "ซัพพลายเออร์ทั่วไป",
    });
  }

  // 3. กรองเฉพาะรายการที่ต้องสั่ง (totalOrderQty > 0) และจัดกลุ่มแยกซัพพลายเออร์
  const supplierMap: Record<string, SupplierPurchaseOrderGroup> = {};

  for (const res of calculationResults) {
    if (res.totalOrderQty <= 0) continue;

    const suppKey = res.supplierId || "UNKNOWN";
    if (!supplierMap[suppKey]) {
      supplierMap[suppKey] = {
        supplierId: res.supplierId || "UNKNOWN",
        supplierName: res.supplierName,
        items: [],
        totalEstimatedAmount: 0,
        itemCount: 0,
      };
    }

    supplierMap[suppKey].items.push(res);
    supplierMap[suppKey].totalEstimatedAmount += res.estimatedTotalCost;
    supplierMap[suppKey].itemCount += 1;
  }

  const groups = Object.values(supplierMap);
  const grandTotal = groups.reduce((sum, g) => sum + g.totalEstimatedAmount, 0);
  const totalItemsToOrder = groups.reduce((sum, g) => sum + g.itemCount, 0);

  return {
    groups,
    grandTotal,
    totalItemsToOrder,
  };
}
