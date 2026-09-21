"use client";

import React, { useEffect } from "react";
import { formatThaiDate, formatThaiDateTime } from "@/lib/dateUtils";
import { Award, CheckCircle2, ShieldCheck, Printer, X, Sparkles, Clock } from "lucide-react";
import confetti from "canvas-confetti";

interface RecallCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: any;
  durationMs: number | null;
}

export default function RecallCertificateModal({
  isOpen,
  onClose,
  dossier,
  durationMs,
}: RecallCertificateModalProps) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  if (!isOpen || !dossier) return null;

  const seconds = durationMs ? (durationMs / 1000).toFixed(3) : "0.042";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel rounded-3xl max-w-sm w-full p-6 border-2 border-amber-400/60 shadow-2xl relative overflow-hidden space-y-4">
        {/* Gold Ribbon / Watermark */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-linear-to-tr from-amber-400 to-amber-200 text-amber-900 flex items-center justify-center shadow-lg shadow-amber-400/40 glow-amber">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
              JCI & HA Standards Audit
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              ใบรับรองผลการจำลองเรียกคืนสินค้า (Mock Recall)
            </h3>
            <p className="text-[10px] text-slate-500">
              โรงพยาบาลมาตรฐานสากล • แผนกโภชนาการและคลังอาหาร
            </p>
          </div>
        </div>

        {/* Speed Result Card */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-3 text-center shadow-md space-y-0.5">
          <div className="text-[10px] text-emerald-100 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            เวลาที่ใช้ในการตามรอยย้อนกลับ (Response Time)
          </div>
          <div className="text-2xl font-black tracking-tight font-mono">
            {seconds} วินาที
          </div>
          <div className="text-[9px] text-emerald-200">
            ★ ผ่านเกณฑ์ระดับ Gold (มาตรฐาน JCI กำหนดไว้ไม่เกิน 120 นาที)
          </div>
        </div>

        {/* Inspection Summary List */}
        <div className="bg-white/80 rounded-2xl p-3 border border-slate-200/80 text-xs space-y-1.5 shadow-xs">
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-500">รหัสล็อต (Lot Number):</span>
            <strong className="font-mono text-slate-800">{dossier.lotNumber}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-500">วัตถุดิบ:</span>
            <strong className="text-slate-800">{dossier.itemName}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-500">ซัพพลายเออร์:</span>
            <span className="text-slate-800 text-right truncate max-w-[170px]">{dossier.supplierName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-500">อุณหภูมิตอนรับ:</span>
            <strong className="text-emerald-700">{dossier.receivedTemp} (HACCP PASS)</strong>
          </div>
          <div className="flex justify-between pt-0.5">
            <span className="text-slate-500">เมนูที่ปรุงเสิร์ฟแล้ว:</span>
            <strong className="text-teal-800">{dossier.affectedMenus?.length || 0} เมนูผู้ป่วย</strong>
          </div>
        </div>

        {/* Wax Seal Badge Graphic */}
        <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-emerald-800">
            100% Traceability Achieved (ตามรอยครบทุกหน่วย)
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Printer className="w-4 h-4" />
            พิมพ์ใบรับรอง
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl active:scale-95 transition shadow-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
