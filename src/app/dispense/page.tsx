"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRole } from "@/components/RoleContext";
import { formatThaiDate } from "@/lib/dateUtils";
import SmartScaleModal from "@/components/SmartScaleModal";
import VoiceWaveModal from "@/components/VoiceWaveModal";
import { clientStore } from "@/lib/clientStore";
import {
  Mic,
  MicOff,
  QrCode,
  Scale,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Volume2,
  Package,
  Layers,
  Camera,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";

function DispenseContent() {
  const searchParams = useSearchParams();
  const preSelectedItemId = searchParams.get("itemId");
  const { roleConfig, showToast } = useRole();

  // State
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [dispenseQty, setDispenseQty] = useState<number>(5.0);
  const [menuName, setMenuName] = useState<string>("ต้มจืดไก่ใส่ฟัก (มื้อกลางวัน)");
  const [fefoRecommendation, setFefoRecommendation] = useState<any>(null);
  const [loadingFefo, setLoadingFefo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice recognition states
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const [voiceVoicePrompt, setVoiceVoicePrompt] = useState<string | null>(null);

  // Smart Scale simulator modal
  const [isScaleOpen, setIsScaleOpen] = useState(false);

  // QR Scanner modal
  const [isQrScanning, setIsQrScanning] = useState(false);

  // Success summary
  const [dispenseSuccess, setDispenseSuccess] = useState<any>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.items);
          if (preSelectedItemId) {
            setSelectedItemId(preSelectedItemId);
          } else if (json.items.length > 0) {
            setSelectedItemId(json.items[0].id);
          }
          return;
        }
      }
    } catch (e) {
      console.warn("fetchItems API error, fallback to clientStore:", e);
    }
    const cItems = clientStore.getItems();
    setItems(cItems);
    if (preSelectedItemId) {
      setSelectedItemId(preSelectedItemId);
    } else if (cItems.length > 0) {
      setSelectedItemId(cItems[0].id);
    }
  };

  // เมื่อเปลี่ยน item หรือจำนวน ให้คำนวณ FEFO ใหม่
  useEffect(() => {
    if (selectedItemId && dispenseQty > 0) {
      checkFefo(selectedItemId, dispenseQty);
    }
  }, [selectedItemId, dispenseQty]);

  const checkFefo = async (itemId: string, qty: number) => {
    try {
      setLoadingFefo(true);
      const res = await fetch("/api/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHECK_FEFO",
          itemId,
          requestedQty: qty,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setFefoRecommendation(data.recommendation);
          setLoadingFefo(false);
          return;
        }
      }
    } catch (e) {
      console.warn("checkFefo API error, fallback to clientStore:", e);
    }
    const cFefo = clientStore.calculateFefo(itemId, qty);
    setFefoRecommendation(cFefo);
    setLoadingFefo(false);
  };

  // Text-to-Speech อ่านทวนภาษาไทย
  const speakThai = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "th-TH";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // จัดการคำสั่งเสียงด้วย Web Speech API
  const handleStartVoice = () => {
    setIsVoiceModalOpen(true);
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser ไม่รองรับ Web Speech API ให้ใช้ Voice Simulator สำรอง
      handleSimulateVoice("เบิกอกไก่ 5 กิโล");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "th-TH";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript("กำลังฟังเสียง... (เช่น 'เบิกไก่ 5 กิโล')");
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(`"${transcript}"`);
        setIsListening(false);
        processVoiceCommand(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        showToast("รับเสียงไม่สำเร็จ: ใช้ระบบจำลองเสียงแทน");
        handleSimulateVoice("เบิกอกไก่ 5 กิโล");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      handleSimulateVoice("เบิกอกไก่ 5 กิโล");
    }
  };

  // จำลองคำสั่งเสียงด่วนสำหรับ Workshop/Demo
  const handleSimulateVoice = (sampleText: string) => {
    setIsVoiceModalOpen(true);
    setVoiceTranscript(`"${sampleText}" (โหมดสาธิต)`);
    processVoiceCommand(sampleText);
  };

  const processVoiceCommand = async (text: string) => {
    try {
      const res = await fetch("/api/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PARSE_VOICE",
          text,
        }),
      });
      const data = await res.json();
      if (data.success && data.parsed) {
        setSelectedItemId(data.parsed.item.id);
        setDispenseQty(data.parsed.quantity);
        setVoiceVoicePrompt(data.parsed.speechResponse);
        speakThai(data.parsed.speechResponse);
        showToast(`แปลเสียงสำเร็จ: ${data.parsed.item.name} ${data.parsed.quantity} ${data.parsed.unit}`);
      } else {
        showToast(data.message || "ไม่เข้าใจคำสั่งเสียง");
      }
    } catch (err: any) {
      showToast("ประมวลผลคำสั่งเสียงขัดข้อง: " + err.message);
    }
  };

  // แตะยืนยันตัดยอด (Execute FEFO Dispense)
  const handleConfirmDispense = async (method = "MANUAL") => {
    if (!selectedItemId || dispenseQty <= 0) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONFIRM_DISPENSE",
          itemId: selectedItemId,
          requestedQty: dispenseQty,
          menuName,
          operatorName: roleConfig.name,
          operatorRole: roleConfig.name,
          method,
          notes: `เบิกตัดตามหลัก FEFO สำหรับ ${menuName}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDispenseSuccess(data);
          showToast(data.message);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
          fetchItems();
          setIsSubmitting(false);
          return;
        }
      }
    } catch (e: any) {
      console.warn("Dispense API error, fallback to clientStore:", e);
    }
    const cRes = clientStore.confirmDispense({
      itemId: selectedItemId,
      requestedQty: dispenseQty,
    });
    setDispenseSuccess(cRes);
    showToast(cRes.message);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    fetchItems();
    setIsSubmitting(false);
  };

  const selectedItem = items.find((it) => it.id === selectedItemId);

  return (
    <div className="space-y-4 pb-8">
      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span>เบิกจ่ายตามหลัก FEFO</span>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
            First-Expired First-Out
          </span>
        </h1>
        <p className="text-xs text-slate-500">
          สแกน QR หรือสั่งด้วยเสียง • ระบบบังคับหยิบล็อตใกล้หมดอายุก่อนเสมอ
        </p>
      </div>

      {/* Input Method Selector (Voice, QR, Scale) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>เลือกวิธีระบุรายการเบิก (Touch-once)</span>
        </div>

        {/* 3 Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {/* Voice Button */}
          <button
            onClick={handleStartVoice}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
              isListening
                ? "bg-red-50 border-red-400 text-red-700 animate-pulse"
                : "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100"
            }`}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-red-600 animate-bounce" />
            ) : (
              <Mic className="w-5 h-5 text-teal-700" />
            )}
            <span className="text-xs font-bold">
              {isListening ? "กำลังฟัง..." : "เบิกด้วยเสียง"}
            </span>
            <span className="text-[9px] text-teal-600">ไทย (th-TH)</span>
          </button>

          {/* Smart Scale Button */}
          <button
            onClick={() => setIsScaleOpen(true)}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-800 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <Scale className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-bold">จำลองตาชั่ง</span>
            <span className="text-[9px] text-emerald-600">Smart Scale</span>
          </button>

          {/* QR Code Barcode Button */}
          <button
            onClick={() => {
              if (items.length > 0) {
                // สำหรับ demo เลือก item ถัดไปเพื่อจำลองการสแกน QR ติดกล่อง
                const nextIdx = (items.findIndex(it => it.id === selectedItemId) + 1) % items.length;
                setSelectedItemId(items[nextIdx].id);
                showToast(`จำลองสแกน QR: ${items[nextIdx].name}`);
              }
            }}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <QrCode className="w-5 h-5 text-slate-700" />
            <span className="text-xs font-bold">สแกน QR</span>
            <span className="text-[9px] text-slate-500">แตะจำลองสแกน</span>
          </button>
        </div>

        {/* Voice Transcript Display */}
        {voiceTranscript && (
          <div className="bg-teal-900 text-teal-50 rounded-xl p-3 text-xs space-y-1 animate-in fade-in">
            <div className="flex items-center justify-between text-[10px] text-teal-300">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-teal-400" />
                คำสั่งเสียงที่ตรวจพบ:
              </span>
            </div>
            <div className="font-medium text-sm text-teal-100">{voiceTranscript}</div>
            {voiceVoicePrompt && (
              <div className="text-[11px] text-emerald-300 pt-1 border-t border-teal-800">
                AI อ่านทวน: {voiceVoicePrompt}
              </div>
            )}
          </div>
        )}

        {/* Quick Voice Demo Buttons for Workshop */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pt-1">
          <span className="text-slate-400 whitespace-nowrap">ตัวอย่างเสียง:</span>
          <button
            onClick={() => handleSimulateVoice("เบิกอกไก่ 5 กิโล")}
            className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 text-slate-700 rounded-full whitespace-nowrap border border-slate-200"
          >
            "เบิกอกไก่ 5 กิโล"
          </button>
          <button
            onClick={() => handleSimulateVoice("เบิกผักกาดขาว 8 กิโล")}
            className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 text-slate-700 rounded-full whitespace-nowrap border border-slate-200"
          >
            "เบิกผักกาดขาว 8 กิโล"
          </button>
          <button
            onClick={() => handleSimulateVoice("เบิกเต้าหู้ 15 หลอด")}
            className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 text-slate-700 rounded-full whitespace-nowrap border border-slate-200"
          >
            "เบิกเต้าหู้ 15 หลอด"
          </button>
        </div>
      </div>

      {/* Form: Item & Quantity Selection */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">วัตถุดิบที่จะเบิก:</label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          >
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} (คงเหลือ: {it.totalStock} {it.baseUnit})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">จำนวนที่เบิก:</label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={dispenseQty}
                onChange={(e) => setDispenseQty(parseFloat(e.target.value) || 0)}
                className="w-full font-mono text-base font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                {selectedItem?.baseUnit || "กก."}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">เมนูอาหาร:</label>
            <input
              type="text"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="เช่น ต้มข่าไก่ มื้อเที่ยง"
            />
          </div>
        </div>
      </div>

      {/* FEFO Allocation Preview Card */}
      {fefoRecommendation && (
        <div className="bg-white rounded-2xl p-4 border border-teal-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  ระบบเลือกจัดสรรล็อตตาม FEFO อัตโนมัติ
                </h3>
                <p className="text-[10px] text-slate-400">
                  ตัดจากล็อตใกล้หมดอายุก่อน เพื่อป้องกันของค้างสต๊อกเสียทิ้ง
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                fefoRecommendation.canFulfill
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {fefoRecommendation.canFulfill ? "สต๊อกพร้อมจ่าย" : "สต๊อกไม่พอ"}
            </span>
          </div>

          {/* Lot Allocations List */}
          <div className="space-y-2">
            {fefoRecommendation.allocations.map((alloc: any, idx: number) => (
              <div
                key={alloc.lotId}
                className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-1"
              >
                <div className="flex justify-between items-center font-semibold text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-[11px]">{alloc.lotNumber}</span>
                  </div>
                  <span className="font-bold text-teal-800">
                    เบิก: {alloc.allocatedQty} {fefoRecommendation.unit}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 pl-6">
                  <span>
                    หมดอายุ: <strong>{formatThaiDate(alloc.expiryDate)}</strong> (ล็อตนี้เหลือก่อนเบิก {alloc.allocatedQty + alloc.remainingAfter} {fefoRecommendation.unit})
                  </span>
                  {roleConfig.canViewPrices && (
                    <span>ต้นทุน: ฿{alloc.totalCost.toFixed(1)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => handleConfirmDispense(voiceTranscript ? "VOICE" : "MANUAL")}
            disabled={!fefoRecommendation.canFulfill || isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {isSubmitting
                ? "กำลังตัดยอด..."
                : `ยืนยันตัดสต๊อก ${dispenseQty} ${fefoRecommendation.unit} (Touch-once)`}
            </span>
          </button>
        </div>
      )}

      {/* Success Modal / Card */}
      {dispenseSuccess && (
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-md space-y-3 text-center animate-in fade-in">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              ตัดจ่ายตามเกณฑ์ FEFO สำเร็จเรียบร้อย!
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              วัตถุดิบ: {dispenseSuccess.item?.name} • เมนู: {menuName}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-xs text-left space-y-1 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold">สรุปการตัดสต๊อก:</div>
            {dispenseSuccess.allocations?.map((a: any) => (
              <div key={a.lotId} className="flex justify-between text-[11px]">
                <span className="font-mono">{a.lotNumber}</span>
                <span className="font-bold text-slate-700">
                  {a.allocatedQty} {dispenseSuccess.item?.baseUnit} (เหลือ {a.remainingAfter})
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setDispenseSuccess(null);
              setVoiceTranscript("");
              setVoiceVoicePrompt(null);
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl active:scale-95 transition"
          >
            ทำรายการเบิกถัดไป
          </button>
        </div>
      )}

      {/* Smart Scale Modal */}
      <SmartScaleModal
        isOpen={isScaleOpen}
        onClose={() => setIsScaleOpen(false)}
        onConfirmWeight={(w) => {
          setDispenseQty(w);
          showToast(`รับค่าน้ำหนักจากเครื่องชั่ง: ${w} กก.`);
        }}
        initialWeight={dispenseQty}
        itemName={selectedItem?.name}
        unit={selectedItem?.baseUnit}
      />

      {/* Voice Waveform Siri/ChatGPT Style Modal */}
      <VoiceWaveModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        isListening={isListening}
        transcript={voiceTranscript}
        speechResponse={voiceVoicePrompt}
        onConfirm={() => {
          setIsVoiceModalOpen(false);
          handleConfirmDispense("VOICE");
        }}
        onRetry={() => {
          handleStartVoice();
        }}
      />
    </div>
  );
}

export default function DispensePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-2">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">กำลังโหลดหน้าเบิกจ่าย FEFO...</p>
        </div>
      }
    >
      <DispenseContent />
    </Suspense>
  );
}

