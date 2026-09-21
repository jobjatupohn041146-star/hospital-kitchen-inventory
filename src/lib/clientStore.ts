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
  getItems: () => {
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
};
