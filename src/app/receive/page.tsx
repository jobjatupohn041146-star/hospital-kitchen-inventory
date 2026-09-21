"use client";

import React, { useState, useRef } from "react";
import { useRole } from "@/components/RoleContext";
import { formatThaiDate } from "@/lib/dateUtils";
import {
  Camera,
  Upload,
  Thermometer,
  ShieldCheck,
  CheckCircle,
  AlertOctagon,
  Sparkles,
  QrCode,
  Printer,
  RotateCcw,
  ArrowRight,
  FileText,
} from "lucide-react";
import confetti from "canvas-confetti";
import { clientStore } from "@/lib/clientStore";

export default function ReceivePage() {
  const { roleConfig, showToast } = useRole();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);

  // HACCP inputs
  const [temperature, setTemperature] = useState<string>("2.5");
  const [receiverName, setReceiverName] = useState<string>("เจ้าหน้าที่รับของ");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedLots, setSavedLots] = useState<any[] | null>(null);

  // คำนวณสถานะ HACCP ตามอุณหภูมิที่วัดได้
  const tempVal = parseFloat(temperature);
  const isChilled = extractionResult?.items?.[0]?.storageType?.includes("แช่เย็น");
  const isFrozen = extractionResult?.items?.[0]?.storageType?.includes("แช่แข็ง");

  let haccpStatus: "PASS" | "WARN" | "FAIL" = "PASS";
  let haccpMessage = "อุณหภูมิผ่านเกณฑ์มาตรฐาน HACCP";

  if (!isNaN(tempVal)) {
    if (isChilled) {
      if (tempVal < 0 || tempVal > 4.0) {
        haccpStatus = "FAIL";
        haccpMessage = "อุณหภูมิเกินเกณฑ์แช่เย็น (ต้องอยู่ระหว่าง 0°C ถึง 4°C)";
      }
    } else if (isFrozen) {
      if (tempVal > -18.0) {
        haccpStatus = "FAIL";
        haccpMessage = "อุณหภูมิสูงกว่าเกณฑ์แช่แข็ง (ต้องไม่เกิน -18°C)";
      }
    }
  }

  // เลือกตัวอย่างใบส่งของจำลอง (Smart Preset) สำหรับ Demo/Workshop
  const handleSelectPreset = async (presetKey: string) => {
    setIsExtracting(true);
    setSavedLots(null);
    try {
      const res = await fetch("/api/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EXTRACT_INVOICE",
          presetKey,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setExtractionResult(data.extraction);
          if (presetKey === "seafood") {
            setTemperature("-19.5");
          } else {
            setTemperature("2.8");
          }
          showToast("AI สกัดข้อมูลใบส่งของเรียบร้อยแล้ว");
          setIsExtracting(false);
          return;
        }
      }
    } catch (e: any) {
      console.warn("API error, fallback to clientStore:", e);
    }
    // Fallback for static hosting / GitHub Pages
    const presetData = clientStore.extractInvoice(presetKey);
    setExtractionResult(presetData);
    if (presetKey === "seafood") {
      setTemperature("-19.5");
    } else {
      setTemperature("2.8");
    }
    showToast("AI สกัดข้อมูลใบส่งของเรียบร้อยแล้ว");
    setIsExtracting(false);
  };

  // จัดการอัปโหลดหรือถ่ายภาพใบส่งของ
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setIsExtracting(true);
      setSavedLots(null);

      try {
        const res = await fetch("/api/receive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "EXTRACT_INVOICE",
            imageBase64: base64,
            presetKey: "meat",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setExtractionResult(data.extraction);
            showToast("AI วิเคราะห์ภาพใบส่งของสำเร็จ");
            setIsExtracting(false);
            return;
          }
        }
      } catch (err: any) {
        console.warn("Image upload API error, fallback to preset:", err);
      }
      const fallbackPreset = clientStore.extractInvoice("meat");
      setExtractionResult(fallbackPreset);
      showToast("AI วิเคราะห์ภาพใบส่งของสำเร็จ (โหมดสาธิต)");
      setIsExtracting(false);
    };
    reader.readAsDataURL(file);
  };

  // แตะยืนยันรับเข้าคลังใน 1 ท่า (Touch-once Confirm)
  const handleConfirmReceive = async () => {
    if (!extractionResult) return;

    if (haccpStatus === "FAIL") {
      const proceed = confirm(
        `คำเตือน: ${haccpMessage}\nต้องการปฏิเสธสินค้าหรือยืนยันรับเข้าพร้อมบันทึกเป็นเหตุการณ์เสี่ยง?`
      );
      if (!proceed) return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONFIRM_RECEIVE",
          supplierName: extractionResult.supplierName,
          invoiceNumber: extractionResult.invoiceNumber,
          receiverName,
          temperature,
          items: extractionResult.items,
          notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSavedLots(data.lots);
          setExtractionResult(null);
          setImagePreview(null);
          showToast(data.message);
          confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
          setIsSubmitting(false);
          return;
        }
      }
    } catch (e: any) {
      console.warn("Receive API error, using clientStore:", e);
    }

    // Fallback to clientStore
    const clientRes = clientStore.confirmReceive({
      supplierName: extractionResult.supplierName,
      invoiceNumber: extractionResult.invoiceNumber,
      receiverName,
      temperature,
      items: extractionResult.items,
      notes,
    });
    setSavedLots(clientRes.lots);
    setExtractionResult(null);
    setImagePreview(null);
    showToast(clientRes.message);
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>โต๊ะรับของ AI & HACCP</span>
            <span className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-800 font-bold rounded-full">
              Touch-once
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            สกัดใบส่งของด้วย AI • ตรวจวัดอุณหภูมิ • พิมพ์ QR ฉลากล็อต
          </p>
        </div>
      </div>

      {/* Step 1: Image Capture or Demo Preset Selection */}
      {!extractionResult && !savedLots && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-teal-600" />
            <span>1. ถ่ายรูปใบส่งของ หรือเลือกตัวอย่างสำหรับ Demo</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                แตะเพื่อเปิดกล้อง หรือเลือกรูปภาพ
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                รองรับใบแจ้งหนี้ / ใบส่งสินค้าทุกชนิด
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Demo Presets Bar */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                โหมด Workshop: เลือกตัวอย่างใบส่งของจำลอง
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => handleSelectPreset("meat")}
                disabled={isExtracting}
                className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition active:scale-95"
              >
                <div className="text-lg mb-1">🍗</div>
                <div className="font-bold text-slate-800 text-[11px]">ไก่/หมูสด</div>
                <div className="text-[9px] text-slate-400">บจก. สดเจริญ</div>
              </button>

              <button
                onClick={() => handleSelectPreset("veg")}
                disabled={isExtracting}
                className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition active:scale-95"
              >
                <div className="text-lg mb-1">🥬</div>
                <div className="font-bold text-slate-800 text-[11px]">ผักกาดขาว</div>
                <div className="text-[9px] text-slate-400">สหกรณ์ผัก</div>
              </button>

              <button
                onClick={() => handleSelectPreset("seafood")}
                disabled={isExtracting}
                className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition active:scale-95"
              >
                <div className="text-lg mb-1">🐟</div>
                <div className="font-bold text-slate-800 text-[11px]">ปลากะพง</div>
                <div className="text-[9px] text-slate-400">ไทยซีฟู้ด</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extracting Loading Indicator */}
      {isExtracting && (
        <div className="bg-white rounded-2xl p-6 border border-teal-200 shadow-sm text-center space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="w-12 h-12 border-3 border-teal-200 border-t-teal-700 rounded-full animate-spin" />
            <Sparkles className="w-5 h-5 text-amber-500 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              AI กำลังอ่านและสกัดรายการจากใบส่งของ...
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              ตรวจสอบรายการสินค้า, จำนวน, ราคา, และเลขล็อตอัตโนมัติ
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Review Extracted Data & HACCP Temp Check */}
      {extractionResult && (
        <div className="space-y-3">
          {/* Supplier & Invoice Card */}
          <div className="bg-white rounded-2xl p-4 border border-teal-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {extractionResult.source === "GEMINI_AI" ? "Gemini Multimodal AI" : "Smart Preset"}
              </span>
              <span className="text-slate-400 text-[10px]">
                เลขที่: {extractionResult.invoiceNumber}
              </span>
            </div>
            <div className="font-bold text-slate-800 text-sm">
              {extractionResult.supplierName}
            </div>
          </div>

          {/* Extracted Items */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>รายการที่สกัดได้ ({extractionResult.items.length} รายการ)</span>
              <span className="text-[10px] text-slate-400">ระบบสร้างเลขล็อตให้อัตโนมัติ</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {extractionResult.items.map((it: any, idx: number) => (
                <div key={idx} className="py-2.5 space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{it.itemName}</span>
                    <span className="font-bold text-teal-700">
                      {it.quantity} {it.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1 rounded">
                      {it.lotNumber}
                    </span>
                    <span>
                      {roleConfig.canViewPrices ? `฿${it.unitPrice}/${it.unit}` : "•••"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>การจัดเก็บ: {it.storageType}</span>
                    <span>•</span>
                    <span>หมดอายุ: {formatThaiDate(it.expiryDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HACCP Temperature Check (Critical Control Point) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    จุดตรวจวิกฤต HACCP (อุณหภูมิตอนรับสินค้า)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    แช่เย็น 0 ถึง 4°C | แช่แข็ง -18°C ลงไป
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full text-center font-mono text-xl font-bold py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    placeholder="เช่น 2.5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">
                    °C
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-1">
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    haccpStatus === "PASS"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-red-50 border-red-300 text-red-800"
                  }`}
                >
                  {haccpStatus === "PASS" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <div className="text-[10px] leading-tight font-medium">
                    {haccpMessage}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Temp Preset buttons */}
            <div className="flex gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => setTemperature("2.5")}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
              >
                แช่เย็นปกติ 2.5°C
              </button>
              <button
                type="button"
                onClick={() => setTemperature("-19.0")}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
              >
                แช่แข็ง -19.0°C
              </button>
              <button
                type="button"
                onClick={() => setTemperature("6.5")}
                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg"
              >
                ทดสอบอุณหภูมิเกิน 6.5°C
              </button>
            </div>
          </div>

          {/* Action Buttons: Touch-once Confirm */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setExtractionResult(null);
                setImagePreview(null);
              }}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs active:scale-95 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmReceive}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-800/20 active:scale-95 transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isSubmitting ? "กำลังบันทึก..." : "ยืนยันรับของเข้าคลัง (Touch-once)"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success Screen & Print QR Labels */}
      {savedLots && savedLots.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-4 text-center animate-in fade-in">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-800">
              รับเข้าคลังสำเร็จ {savedLots.length} รายการ
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ประทับเวลา พ.ศ. และสร้างรหัสฉลาก QR ประจำล็อตเรียบร้อยแล้ว
            </p>
          </div>

          {/* QR Labels to Print */}
          <div className="space-y-3 pt-2">
            {savedLots.map((lot: any) => (
              <div
                key={lot.id}
                className="border-2 border-dashed border-teal-400 bg-teal-50/50 rounded-xl p-3 text-left space-y-2 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] text-teal-800 font-bold">
                      โรงพยาบาล • ฉลากวัตถุดิบ HACCP
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {lot.item?.name || "วัตถุดิบ"}
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    TEMP: {lot.receivedTemp || "-"}°C ({lot.tempStatus})
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-teal-200/60">
                  <div className="space-y-0.5">
                    <div className="font-mono font-bold text-slate-800">
                      LOT: {lot.lotNumber}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      จำนวน: <strong>{lot.initialQty} {lot.item?.baseUnit}</strong>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      หมดอายุ: <strong>{formatThaiDate(lot.expiryDate)}</strong>
                    </div>
                  </div>

                  <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              พิมพ์ฉลาก QR ติดกล่อง
            </button>
            <button
              onClick={() => {
                setSavedLots(null);
                setExtractionResult(null);
              }}
              className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              รับของบิลถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
