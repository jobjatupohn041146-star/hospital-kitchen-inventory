"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/RoleContext";
import { formatThaiDate, formatThaiDateTime } from "@/lib/dateUtils";
import RecallCertificateModal from "@/components/RecallCertificateModal";
import {
  Search,
  AlertOctagon,
  ShieldCheck,
  Building,
  Clock,
  Utensils,
  CheckCircle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Timer,
  Layers,
  ArrowRight,
  ShieldAlert,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function TraceabilityPage() {
  const { roleConfig, showToast } = useRole();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recentLots, setRecentLots] = useState<any[]>([]);
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recallReason, setRecallReason] = useState<string>("แจ้งเตือนปนเปื้อนจากผู้ผลิต (ซัพพลายเออร์ส่งหนังสือด่วน)");
  const [isQuarantining, setIsQuarantining] = useState(false);
  const [searchDurationMs, setSearchDurationMs] = useState<number | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    fetchRecentLots();
  }, []);

  const fetchRecentLots = async () => {
    try {
      const res = await fetch("/api/recall");
      const data = await res.json();
      if (data.success && data.recentLots) {
        setRecentLots(data.recentLots);
        // Default select lot 1 (อกไก่ ที่มีประวัติเบิกไปทำต้มข่าไก่)
        if (data.recentLots.length > 0) {
          executeRecallSearch(data.recentLots[0].lotNumber);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeRecallSearch = async (lotQuery: string) => {
    if (!lotQuery) return;
    setLoading(true);
    const startTime = performance.now();

    try {
      const res = await fetch(`/api/recall?q=${encodeURIComponent(lotQuery)}`);
      const data = await res.json();
      const endTime = performance.now();
      setSearchDurationMs(Math.round(endTime - startTime));

      if (data.success) {
        setSelectedDossier(data.summary);
      } else {
        setSelectedDossier(null);
        showToast(data.message || "ไม่พบข้อมูลล็อต");
      }
    } catch (e: any) {
      showToast("ค้นหาไม่สำเร็จ: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ดำเนินการระงับล็อตฉุกเฉิน (Recall Quarantine)
  const handleTriggerRecall = async () => {
    if (!selectedDossier) return;

    const confirmAction = confirm(
      `ยืนยันคำสั่งกักกันและเรียกคืนล็อต: ${selectedDossier.lotNumber}?\nระบบจะล็อคสต๊อกคงเหลือทันทีเพื่อไม่ให้ใครเบิกใช้ได้อีก`
    );
    if (!confirmAction) return;

    try {
      setIsQuarantining(true);
      const res = await fetch("/api/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TRIGGER_RECALL",
          lotId: selectedDossier.lotNumber,
          reason: recallReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        executeRecallSearch(selectedDossier.lotNumber);
        fetchRecentLots();
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (e: any) {
      showToast("สั่งระงับไม่สำเร็จ: " + e.message);
    } finally {
      setIsQuarantining(false);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span>ตามรอยล็อต & เรียกคืนสินค้า (Mock Recall)</span>
          <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-full">
            JCI 1-Minute Target
          </span>
        </h1>
        <p className="text-xs text-slate-500">
          ตรวจสอบย้อนกลับทันที: รับจากใคร • คงเหลือเท่าไร • ปรุงเข้าเมนูใดบ้าง
        </p>
      </div>

      {/* Search & Lot Selector Box */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeRecallSearch(searchQuery);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="พิมพ์หรือสแกนเลขล็อต เช่น LOT-CHK-..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1 px-3 py-1 bg-teal-700 text-white rounded-lg text-xs font-bold hover:bg-teal-800 active:scale-95 transition"
          >
            ค้นหา
          </button>
        </form>

        {/* Quick Lot Chips */}
        <div className="space-y-1 pt-1">
          <div className="text-[10px] text-slate-400 font-medium">
            แตะเลือกล็อตตัวอย่างสำหรับทดสอบ Mock Recall:
          </div>
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            {recentLots.slice(0, 4).map((lt) => (
              <button
                key={lt.id}
                onClick={() => {
                  setSearchQuery(lt.lotNumber);
                  executeRecallSearch(lt.lotNumber);
                }}
                className={`px-2 py-1 rounded-lg border font-mono transition ${
                  selectedDossier?.lotNumber === lt.lotNumber
                    ? "bg-teal-700 text-white border-teal-700 font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50"
                }`}
              >
                {lt.lotNumber} ({lt.item?.name?.slice(0, 10)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Traceability Speed Metric */}
      {searchDurationMs !== null && selectedDossier && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">
                สืบย้อนรอยสำเร็จครบถ้วน (Full Traceability Achieved)
              </span>
              <div className="text-[10px] text-emerald-700">
                เวลาที่ใช้ในการประมวลผล: <strong>{(searchDurationMs / 1000).toFixed(3)} วินาที</strong> (เกณฑ์มาตรฐาน JCI คือไม่เกิน 2 ชั่วโมง)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dossier Card */}
      {selectedDossier && (
        <div className="space-y-3 animate-in fade-in">
          {/* Status Alert Banner */}
          {selectedDossier.isRecalled && (
            <div className="bg-red-600 text-white rounded-2xl p-4 shadow-md space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <span>ล็อตนี้ถูกระงับการใช้งานและเรียกคืน (RECALLED)</span>
              </div>
              <p className="text-xs text-red-100">
                เหตุผล: {selectedDossier.recallReason}
              </p>
              <p className="text-[10px] text-red-200">
                สั่งระงับเมื่อ: {formatThaiDateTime(selectedDossier.recalledAt)}
              </p>
            </div>
          )}

          {/* Section 1: Inbound Receiving Data */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-700" />
                <h2 className="text-xs font-bold text-slate-800">
                  1. ข้อมูลการรับเข้า (Inbound Receiving Origin)
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {selectedDossier.lotNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">วัตถุดิบ</span>
                <strong className="text-slate-800">{selectedDossier.itemName}</strong>
                <span className="text-[10px] text-slate-500 block">รหัส: {selectedDossier.itemCode}</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">ซัพพลายเออร์ผู้ส่งมอบ</span>
                <strong className="text-slate-800">{selectedDossier.supplierName}</strong>
                <span className="text-[10px] text-slate-500 block">{selectedDossier.supplierContact}</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">วันที่รับเข้า & ผู้รับ</span>
                <span className="font-medium text-slate-800">{formatThaiDate(selectedDossier.receivedDate)}</span>
                <span className="text-[10px] text-slate-500 block">{selectedDossier.receiverName}</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">อุณหภูมิตอนรับ (HACCP)</span>
                <span className="font-bold text-slate-800">{selectedDossier.receivedTemp}</span>
                <span className="text-[10px] text-emerald-700 font-bold block">
                  สถานะ: {selectedDossier.tempStatus}
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100">
              <span className="text-slate-500">
                รับเข้าทั้งหมด: <strong>{selectedDossier.initialQty} {selectedDossier.unit}</strong>
              </span>
              <span className="text-slate-500">
                สต๊อกยังเหลือในคลัง: <strong className="text-amber-700">{selectedDossier.remainingQty} {selectedDossier.unit}</strong>
              </span>
            </div>
          </div>

          {/* Section 2: Patient Menus and Food Preparation Trace */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-700" />
                <h2 className="text-xs font-bold text-slate-800">
                  2. เมนูอาหารผู้ป่วยที่ใช้วัตถุดิบล็อตนี้ ({selectedDossier.affectedMenus.length} เมนู)
                </h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                ใช้ไปแล้ว {selectedDossier.totalDispensed} {selectedDossier.unit}
              </span>
            </div>

            {selectedDossier.affectedMenus.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                ยังไม่มีการเบิกใช้ล็อตนี้ไปปรุงอาหาร (คงเหลือเต็มจำนวนในตู้เก็บ)
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDossier.affectedMenus.map((menu: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span>{menu.menuName}</span>
                      <span className="text-emerald-700">
                        {menu.qtyUsed} {menu.unit}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>ปรุงโดย: {menu.operatorName}</span>
                      <span className="text-[10px] text-slate-400">
                        {formatThaiDateTime(menu.usedAt)}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      วิธีเบิก: {menu.method} • {menu.notes}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Actions & Quarantine Button */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-800">
              การจัดการเรียกคืนและรายงาน (Recall Action Plan)
            </div>

            {!selectedDossier.isRecalled ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={recallReason}
                  onChange={(e) => setRecallReason(e.target.value)}
                  placeholder="ระบุเหตุผลการระงับและเรียกคืน"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />

                <button
                  onClick={handleTriggerRecall}
                  disabled={isQuarantining}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>
                    {isQuarantining ? "กำลังสั่งระงับ..." : "สั่งระงับการใช้และกักกันล็อตนี้ทันที (Lock Stock)"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-center">
                สต๊อกล็อตนี้ถูกกักกันแล้ว และตัดออกจากรายการที่สามารถเบิกใช้ได้ในระบบ
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="flex-1 py-2.5 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition"
              >
                <Award className="w-4 h-4" />
                <span>เปิดใบรับรองผลตรวจ JCI</span>
              </button>

              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JCI Mock Recall Official Certificate Modal */}
      {selectedDossier && (
        <RecallCertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          dossier={selectedDossier}
          durationMs={searchDurationMs}
        />
      )}
    </div>
  );
}
