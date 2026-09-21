# Master Agent Prompts: ระบบสต๊อกครัวโรงพยาบาล Touch-once (3 Platforms)

เอกสารคำสั่งสำหรับนำไปสั่งการ AI Coding Agents ใน 3 แพลตฟอร์มชั้นนำ เพื่อพัฒนาระบบบริหารจัดการคลังวัตถุดิบครัวโรงพยาบาลตามมาตรฐาน HACCP, FEFO, PDPA และการตรวจรับรอง JCI / HA

---

## 1. แพลตฟอร์ม: Google Antigravity 2.0 (System & Full-stack Architecture)

คัดลอก Prompt ด้านล่างนี้ไปวางใน Antigravity:

```markdown
ROLE: ผู้ออกแบบและพัฒนาระบบ inventory สำหรับครัวโรงพยาบาลที่เชี่ยวชาญมาตรฐาน HACCP, FIFO/FEFO, การคำนวณสูตรอาหารตามประเภทผู้ป่วย และความปลอดภัยข้อมูล PDPA

OBJECTIVE: พัฒนาและต่อยอดเว็บแอปพลิเคชันมือถือ (Mobile-first PWA) สำหรับครัวโรงพยาบาลในแนวคิด "Touch-once, Type-never" ที่ผู้ปฏิบัติงานไม่ต้องพิมพ์ข้อความ บันทึกการรับเข้าด้วย AI ตรวจสอบอุณหภูมิตามจุดวิกฤต HACCP, เบิกจ่ายวัตถุดิบอัตโนมัติตามวันหมดอายุก่อน (FEFO) ด้วยการสแกน QR และคำสั่งเสียงภาษาไทย, คำนวณความต้องการวัตถุดิบจากยอดผู้ป่วยรายประเภทอาหารคูณสูตรอาหาร (Standard Recipe BOM) เพื่อออกใบสั่งซื้อประจำวัน (PO) ปัดเศษตามขนาดแพ็ค พร้อมระบบตามรอยล็อตและจำลองการเรียกคืนฉุกเฉิน (Mock Recall) ภายใน 1 นาที สำหรับตอบโจทย์ผู้ตรวจ JCI

CONTEXT & CONSTRAINTS:
1. ผู้ใช้งาน: เจ้าหน้าที่รับของ, พ่อครัว/แม่ครัว, นักโภชนาการ, หัวหน้าฝ่ายจัดซื้อ
2. กฎหมาย PDPA: ห้ามจัดเก็บชื่อหรือ HN ของผู้ป่วยในระบบคลัง ใช้เฉพาะผลรวมจำนวนเตียงผู้ป่วยตามประเภทอาหาร (เช่น อาหารทั่วไป, อาหารเบาหวาน, อาหารโรคไต/จำกัดเกลือ, อาหารอ่อน/ปั่นผสม, อาหารฮาลาล)
3. มาตรฐาน HACCP: สินค้าแช่เย็นต้องตรวจวัดอุณหภูมิให้อยู่ในช่วง 0-4°C และสินค้าแช่แข็งต้องไม่เกิน -18°C หากเกินเกณฑ์ต้องแจ้งเตือนปฏิเสธหรือติดแท็กความเสี่ยง
4. รูปแบบเวลา: แสดงผลวันที่และเวลาเป็นภาษาไทย พ.ศ. พร้อมระบบประทับเวลาแบบ Append-only Audit Trail
5. UI/UX: ธีมสีเขียวนกเป็ดน้ำ (Teal Healthcare), รองรับ Touch interaction, มีแถบ Quick Role Switcher เพื่อสลับบทบาทในการสาธิตเดโม

TECH STACK & DELIVERABLES:
- Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma ORM กับ SQLite
- โมดูลรับของ AI Vision (เชื่อมต่อ Gemini API พร้อม Smart Preset สำรอง)
- โมดูลเบิกจ่าย FEFO รองรับ Web Speech API ภาษาไทย (th-TH), Text-to-Speech อ่านทวน และ Smart Scale Bridge Simulator
- ระบบคำนวณยอดสั่งซื้อพรุ่งนี้แยกตามซัพพลายเออร์และพิมพ์ใบ PO
- เครื่องมือ 1-Minute Mock Recall พร้อมสรุปเมนูที่นำไปประกอบอาหาร
```

---

## 2. แพลตฟอร์ม: Claude Code (Deep Algorithmic & Test-Driven Verification)

คัดลอก Prompt ด้านล่างนี้ไปสั่งใน Terminal ของ Claude Code:

```markdown
You are a senior systems engineer specializing in food traceability, algorithmic inventory management, and precision hospital catering calculations.

TASK:
Audit, optimize, and test the core calculation engines of this hospital kitchen inventory system:

1. FEFO ALLOCATION ENGINE (src/lib/fefo.ts):
   - Verify that lot allocation strictly orders lots by `expiryDate ASC` and never allocates from lots marked with `isRecalled: true`.
   - Ensure unit costs are accurately weighted across multi-lot allocations and that remaining quantities decrement atomically without race conditions.

2. DEMAND & PACK-ROUNDING ENGINE (src/lib/demandEngine.ts):
   - Verify the demand formula: Demand = Sum(PatientCount[Diet] * QtyPerPatient[Diet, Item])
   - Ensure fallback to 14-day rolling moving average when no recipe BOM is bound.
   - Verify net purchase formula: Net = Max(0, Demand + SafetyStock - CurrentStock)
   - Ensure ceil-rounding to pack units: PacksToOrder = Ceil(Net / PackSize), TotalOrderQty = PacksToOrder * PackSize
   - Group purchase orders strictly by supplier and calculate correct financial totals.

3. 1-MINUTE RECALL & AUDIT TRAIL ENGINE (src/lib/prisma.ts & routes):
   - Ensure all inventory deductions are recorded in `StockTransaction` with immutable append-only logs.
   - Verify that triggering a lot recall immediately locks the lot from all subsequent dispense queries.

Write comprehensive automated Jest / Vitest test suites verifying these mathematical and traceability invariants.
```

---

## 3. แพลตฟอร์ม: Cursor / GitHub Copilot (UI & Hardware Integration)

คัดลอก Prompt ด้านล่างนี้ไปวางใน Cursor Composer หรือ Chat:

```markdown
Refine and enhance the frontend components of this Next.js Mobile-first Hospital Kitchen PWA:

1. CAMERA & QR SCANNER:
   - Enhance the HTML5 QR scanner in `src/app/dispense/page.tsx` with haptic feedback (navigator.vibrate) and audio beep when a lot QR code is successfully decoded.
   - Provide visual bounding boxes over recognized barcodes.

2. SMART SCALE HARDWARE BRIDGE (Web Serial / Web Bluetooth):
   - In `src/components/SmartScaleModal.tsx`, integrate standard Web Serial API (`navigator.serial`) and Web Bluetooth API (`navigator.bluetooth`) protocols for reading continuous weight strings (e.g., standard NCI / Mettler Toledo Toledo protocol "ST,GS,+0005.00kg").
   - Maintain the existing interactive software slider simulator as an automatic fallback when no physical USB/Bluetooth scale is connected.

3. THAI SPEECH TUNING:
   - Expand the Thai NLP parser in `src/app/api/dispense/route.ts` to recognize colloquial hospital kitchen phrases (เช่น "เอาไก่ห้าโล", "เบิกเต้าหู้สองแถว", "ขอกะหล่ำสิบกิโล").
   - Ensure clean TTS audio playback with `window.speechSynthesis`.
```
