"use client";

import React, { useEffect } from "react";
import { CheckCircle, Printer, X, FileCheck, Building2, Send } from "lucide-react";
import confetti from "canvas-confetti";

interface PoApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  poNumber: string;
  supplierName: string;
  totalAmount: number;
  itemCount: number;
}

export default function PoApprovalModal({
  isOpen,
  onClose,
  poNumber,
  supplierName,
  totalAmount,
  itemCount,
}: PoApprovalModalProps) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.65 },
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel rounded-3xl max-w-sm w-full p-6 border-2 border-emerald-400/60 shadow-2xl relative overflow-hidden space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Embossed Rubber Stamp Graphic */}
        <div className="text-center pt-2 space-y-3">
          <div className="relative inline-block">
            <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 glow-emerald">
              <FileCheck className="w-8 h-8" />
            </div>
            {/* Stamp Badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-800 text-emerald-100 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-400 tracking-wider">
              APPROVED
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              อนุมัติใบสั่งซื้อเรียบร้อยแล้ว
            </h3>
            <p className="text-[10px] text-slate-500">
              ส่งคำสั่งซื้อเข้าระบบจัดซื้อโรงพยาบาลและแจ้งเตือนซัพพลายเออร์
            </p>
          </div>
        </div>

        {/* Perforated Receipt Card */}
        <div className="bg-emerald-50/70 border border-dashed border-emerald-300 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex justify-between font-mono text-[11px] text-emerald-900 border-b border-emerald-200 pb-1.5 font-bold">
            <span>เลขที่ PO:</span>
            <span>{poNumber}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>ส่งมอบให้:</span>
            <span className="font-bold text-slate-800 truncate max-w-[170px]">
              {supplierName}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>จำนวนรายการ:</span>
            <span className="font-bold text-slate-800">{itemCount} ชนิดวัตถุดิบ</span>
          </div>

          <div className="flex justify-between items-baseline pt-1.5 border-t border-emerald-200">
            <span className="font-bold text-slate-700">ยอดรวมประมาณการ:</span>
            <span className="text-base font-black text-emerald-800 font-mono">
              ฿{totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Printer className="w-4 h-4" />
            พิมพ์ใบ PO
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl active:scale-95 transition shadow-sm"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
