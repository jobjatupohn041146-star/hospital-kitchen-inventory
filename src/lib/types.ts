export type UserRole =
  | "RECEIVER"     // เจ้าหน้าที่รับของ
  | "CHEF"         // พ่อครัว/แม่ครัว
  | "DIETITIAN"    // นักโภชนาการ
  | "PURCHASER";   // หัวหน้าจัดซื้อ/หัวหน้าครัว

export interface RoleConfig {
  id: UserRole;
  name: string;
  badge: string;
  color: string;
  canViewPrices: boolean;
  canApprovePO: boolean;
  canReceive: boolean;
  canDispense: boolean;
  canRecall: boolean;
}

export const ROLES: Record<UserRole, RoleConfig> = {
  RECEIVER: {
    id: "RECEIVER",
    name: "เจ้าหน้าที่ตรวจรับของ",
    badge: "Receiving Staff",
    color: "bg-blue-600",
    canViewPrices: false,
    canApprovePO: false,
    canReceive: true,
    canDispense: false,
    canRecall: false,
  },
  CHEF: {
    id: "CHEF",
    name: "พ่อครัว / แม่ครัว",
    badge: "Kitchen Chef",
    color: "bg-amber-600",
    canViewPrices: false,
    canApprovePO: false,
    canReceive: false,
    canDispense: true,
    canRecall: false,
  },
  DIETITIAN: {
    id: "DIETITIAN",
    name: "นักโภชนาการ",
    badge: "Clinical Dietitian",
    color: "bg-emerald-600",
    canViewPrices: true,
    canApprovePO: false,
    canReceive: false,
    canDispense: true,
    canRecall: true,
  },
  PURCHASER: {
    id: "PURCHASER",
    name: "หัวหน้าจัดซื้อ / หัวหน้าครัว",
    badge: "Purchasing Lead",
    color: "bg-teal-700",
    canViewPrices: true,
    canApprovePO: true,
    canReceive: true,
    canDispense: true,
    canRecall: true,
  },
};

export interface ExtractedInvoiceItem {
  itemName: string;
  category?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lotNumber?: string;
  expiryDate?: string;
  storageType?: string;
  recommendedTempMin?: number;
  recommendedTempMax?: number;
}

export interface InvoiceExtractionResult {
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: ExtractedInvoiceItem[];
  confidence: number;
  source: "GEMINI_AI" | "SMART_PRESET";
}
