# 🏥 ระบบสต๊อกครัวโรงพยาบาล "Touch-once" (Hospital Kitchen Inventory PWA)

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Next.js%2014-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Database-Prisma%20%7C%20SQLite-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Standard-HACCP%20%26%20FEFO-0D9488?style=for-the-badge" alt="HACCP" />
  <img src="https://img.shields.io/badge/Audit-JCI%201--Min%20Recall-amber?style=for-the-badge" alt="JCI" />
  <img src="https://img.shields.io/badge/Privacy-PDPA%20Compliant-blue?style=for-the-badge" alt="PDPA" />
</p>

---

ระบบบริหารจัดการคลังวัตถุดิบและต้นทุนอาหารสำหรับครัวโรงพยาบาล ออกแบบตามแนวคิด **"Touch-once, Type-never"** ผสานงานออกแบบการ์ดลอยระดับ **Figma (Modern Healthcare Glassmorphism)**, แสงนีออนเรืองแสงตามสถานะ, ระบบ Pop-up อัจฉริยะ 5 รูปแบบ และโครงสร้าง Git / GitHub CI/CD เต็มรูปแบบ

---

## 🌟 5 โมดูลระบบ & Pop-up สุดตระการตา

### 1. แดชบอร์ดสรุปเช้าวัน (Morning Dashboard - `/`)
- การ์ดลอยแบบ 3D Glassmorphism (`backdrop-blur-md`)
- สรุปต้นทุน 24 ชม. และต้นทุนเฉลี่ยต่อผู้ป่วยต่อวัน (฿/คน/วัน)
- **FEFO 3-Day Alert:** กล่องไฟเตือนสถานะสีอำพัน แจ้งเตือนล็อตที่ต้องรีบใช้ใน 48–72 ชม.
- แถบตรวจสอบระดับสต๊อกเทียบเกณฑ์ Safety Stock

### 2. โต๊ะรับของ AI & จุดตรวจวิกฤต HACCP (Inbound Receiving - `/receive`)
- **Touch-once:** ถ่ายรูปใบแจ้งหนี้ หรือกดเลือกตัวอย่างจำลองสำหรับ Workshop
- **AI Extraction:** สกัดข้อมูลสินค้า, จำนวน, ราคา, เลขล็อต, และวันหมดอายุอัตโนมัติ (รองรับ Gemini Vision API)
- **จุดตรวจวิกฤต HACCP:** ตรวจสอบอุณหภูมิตอนรับสินค้า (แช่เย็น 0–4°C, แช่แข็ง -18°C) พร้อมไฟเตือนเขียว/แดง
- พิมพ์ฉลาก QR Code ประจำล็อตติดกล่องทันทีที่แตะยืนยัน

### 3. เบิกจ่าย FEFO & Voice Waveform Modal (`/dispense`)
- **🎙️ Pop-up คลื่นเสียงภาษาไทย (Voice Waveform Modal):** ป็อปอัปแสดงคลื่นเสียงนีออนแบบ Siri/ChatGPT ขณะพูดสั่งการ เช่น *"เบิกอกไก่ 5 กิโล"* พร้อมระบบ SpeechSynthesis อ่านทวนเสียงภาษาไทย
- **FEFO Allocation:** ระบบเลือกตัดยอดออกจากล็อตที่หมดอายุก่อนเสมอ ป้องกันของเน่าเสียค้างสต๊อก
- **⚖️ 3D Smart Scale OLED Modal:** ป็อปอัปจำลองเครื่องชั่งน้ำหนักดิจิทัลหน้าจอ OLED เขียวนีออน พร้อมส่งน้ำหนักเข้าฟอร์มแบบเรียลไทม์

### 4. สมองจัดซื้อและออกใบสั่งซื้อ (`/procurement`)
- **PDPA Compliant:** ใช้เฉพาะยอดรวมเตียงผู้ป่วยตามประเภทอาหาร ไม่บันทึกชื่อหรือ HN คนไข้
- คำนวณความต้องการวัตถุดิบจาก **ผู้ป่วย 5 กลุ่มอาหาร × สูตรอาหารมาตรฐาน (BOM)** หรือสถิติเบิก 14 วัน
- ปัดเศษตามขนาดแพ็ค (Pack Rounding) เช่น ปัดเป็นลัง 10 กก. หรือแผง 30 ฟอง
- **📑 Pop-up อนุมัติสั่งซื้อ (PO Approval Modal):** แสดงตราประทับนูน "APPROVED" สีมรกตเรืองแสง พร้อมสรุปยอดเงินและพิมพ์เอกสาร PO

### 5. ตามรอยล็อต & เรียกคืนใน 1 นาที (`/traceability`)
- ตรวจสอบย้อนกลับประวัติล็อตได้ภายในเวลา **< 0.05 วินาที** (ผ่านเกณฑ์ JCI Recall in 1 minute)
- **🏆 Pop-up ใบรับรองผลตรวจ JCI (Recall Certificate Modal):** แสดงใบรับรองผลตรวจมาตรฐานสากล ตราประทับทองคำ "JCI / HA INSPECTION PASSED" พร้อมเอฟเฟกต์ Confetti
- ปุ่ม **"สั่งระงับและกักกันล็อต (Lock Stock)"** ตัดล็อตออกจากระบบเบิกจ่ายได้ทันที

---

## 👥 สลับบทบาทผู้ใช้งาน (Quick Role Switcher)
มีแถบสลับบทบาทบน Header สำหรับทดสอบ 4 มิติงาน:
1. **เจ้าหน้าที่ตรวจรับของ (Receiving Staff):** เน้นการสกัดใบเสร็จและตรวจอุณหภูมิ HACCP (ซ่อนราคาซื้อ)
2. **พ่อครัว / แม่ครัว (Kitchen Chef):** เน้นการเบิกจ่าย FEFO และสั่งการด้วยเสียง
3. **นักโภชนาการ (Clinical Dietitian):** ดูแลสูตรอาหาร คำนวณสารอาหาร และรายงานเรียกคืน
4. **หัวหน้าฝ่ายจัดซื้อ (Purchasing Lead):** สิทธิ์ดูตัวเลขทางการเงินและอนุมัติใบสั่งซื้อ PO

---

## 🚀 วิธีการเริ่มต้นใช้งาน (Quick Start)

1. **ติดตั้ง Dependencies:**
   ```bash
   npm install
   ```

2. **สร้างฐานข้อมูลและโหลดข้อมูลจำลอง:**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

3. **รันเซิร์ฟเวอร์สำหรับพัฒนา:**
   ```bash
   npm run dev
   ```
   เปิดใช้งานที่: **http://localhost:3000**

---

## 🐙 โครงสร้าง Git & GitHub CI/CD

- **GitHub Actions (`.github/workflows/ci.yml`):** ตรวจสอบ Lint, Typecheck, และ Build ทุกครั้งที่มีการ Push / PR
- **Issue Templates (`.github/ISSUE_TEMPLATE/`):** แบบฟอร์มแจ้งบั๊กและเสนอแนะฟีเจอร์สำหรับครัวโรงพยาบาล
- **Master Agent Prompts (`AGENT_PROMPTS.md`):** รวบรวม Prompt สำหรับนำไปสั่งงานต่อใน Antigravity 2.0, Claude Code, และ Cursor
