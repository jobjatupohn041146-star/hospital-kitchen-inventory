import { prisma } from "./prisma";

export interface LotAllocation {
  lotId: string;
  lotNumber: string;
  expiryDate: Date;
  allocatedQty: number;
  unitCost: number;
  totalCost: number;
  remainingAfter: number;
}

export interface FefoRecommendation {
  itemId: string;
  itemName: string;
  requestedQty: number;
  unit: string;
  canFulfill: boolean;
  totalAvailable: number;
  allocations: LotAllocation[];
  totalCost: number;
  averageUnitCost: number;
}

/**
 * คำนวณการเบิกจ่ายตามหลัก FEFO (First-Expired, First-Out)
 * แนะนำให้เบิกล็อตที่ใกล้หมดอายุก่อนเสมอ และไม่นำล็อตที่ถูกเรียกคืน (isRecalled) มาเบิก
 */
export async function calculateFefoAllocation(
  itemId: string,
  requestedQty: number
): Promise<FefoRecommendation> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      lots: {
        where: {
          remainingQty: { gt: 0 },
          isRecalled: false,
        },
        orderBy: {
          expiryDate: "asc", // เรียงจากหมดอายุก่อนขึ้นหน้า
        },
      },
    },
  });

  if (!item) {
    throw new Error(`Item with id ${itemId} not found`);
  }

  const totalAvailable = item.lots.reduce((acc, lot) => acc + lot.remainingQty, 0);
  const canFulfill = totalAvailable >= requestedQty;

  let qtyNeeded = requestedQty;
  const allocations: LotAllocation[] = [];
  let totalCost = 0;

  for (const lot of item.lots) {
    if (qtyNeeded <= 0) break;

    const takeQty = Math.min(lot.remainingQty, qtyNeeded);
    const cost = takeQty * lot.unitCost;

    allocations.push({
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      expiryDate: lot.expiryDate,
      allocatedQty: takeQty,
      unitCost: lot.unitCost,
      totalCost: cost,
      remainingAfter: lot.remainingQty - takeQty,
    });

    totalCost += cost;
    qtyNeeded -= takeQty;
  }

  return {
    itemId: item.id,
    itemName: item.name,
    requestedQty,
    unit: item.baseUnit,
    canFulfill,
    totalAvailable,
    allocations,
    totalCost,
    averageUnitCost: requestedQty > 0 ? totalCost / requestedQty : 0,
  };
}
