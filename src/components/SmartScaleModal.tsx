"use client";

import React, { useState } from "react";
import { Scale, Check, X, RefreshCw, Sparkles, Wifi } from "lucide-react";

interface SmartScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmWeight: (weight: number) => void;
  initialWeight?: number;
  itemName?: string;
  unit?: string;
}

export default function SmartScaleModal({
  isOpen,
  onClose,
  onConfirmWeight,
  initialWeight = 5.0,
  itemName = "วัตถุดิบ",
  unit = "กก.",
}: SmartScaleModalProps) {
  const [weight, setWeight] = useState<number>(initialWeight);
  const [isStable, setIsStable] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleAdjust = (delta: number) => {
    setIsStable(false);
    setWeight((prev) => {
      const next = Math.max(0.1, Math.round((prev + delta) * 10) / 10);
      return next;
    });
    setTimeout(() => setIsStable(true), 300);
  };

  const handleTare = () => {
    setWeight(0);
    setIsStable(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-emerald-400/40 relative overflow-hidden space-y-4">
        {/* Glow ambient */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                จำลองเครื่องชั่ง IoT (Smart Scale Bridge)
              </h3>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5 text-emerald-500" />
                Bluetooth / RS-232 Continuous Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Item Name */}
        <div className="text-center py-0.5">
          <span className="text-[11px] text-slate-500">
            วัตถุดิบบนถาดชั่ง: <strong className="text-slate-800 text-xs">{itemName}</strong>
          </span>
        </div>

        {/* Digital OLED High-Contrast Screen */}
        <div className="bg-slate-950 rounded-2xl p-5 border-2 border-slate-700 shadow-inner flex flex-col items-center justify-center relative glow-emerald">
          <div className="flex items-center justify-between w-full text-[10px] text-emerald-500/90 mb-1 px-1 font-mono">
            <span className="tracking-wider">NCI-SCALE-01</span>
            <span
              className={`flex items-center gap-1 font-bold ${
                isStable ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isStable ? "bg-emerald-400" : "bg-amber-400 animate-ping"
                }`}
              />
              {isStable ? "STABLE" : "WEIGHING..."}
            </span>
          </div>

          {/* Glowing Green Digits */}
          <div className="font-mono text-5xl font-black text-emerald-400 tracking-wider flex items-baseline gap-2 py-2 select-none">
            <span>{weight.toFixed(2)}</span>
            <span className="text-xl text-emerald-600 font-semibold">{unit}</span>
          </div>

          <div className="text-[10px] text-slate-500 mt-1 font-mono flex justify-between w-full px-1">
            <span>ZERO: 0.00</span>
            <span>CAP: 150.00 {unit}</span>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-xs text-slate-600 font-medium">
            <span>หมุนปรับน้ำหนัก:</span>
            <span className="font-bold text-teal-700">
              {weight.toFixed(2)} {unit}
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="50"
            step="0.1"
            value={weight}
            onChange={(e) => {
              setWeight(parseFloat(e.target.value));
              setIsStable(true);
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
        </div>

        {/* Quick Adjust Buttons */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <button
            onClick={() => handleAdjust(-1.0)}
            className="py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold active:scale-95 transition"
          >
            -1.0
          </button>
          <button
            onClick={() => handleAdjust(+0.5)}
            className="py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold active:scale-95 transition"
          >
            +0.5
          </button>
          <button
            onClick={() => handleAdjust(+1.0)}
            className="py-1.5 bg-teal-50 hover:bg-teal-100 rounded-xl text-teal-800 font-bold active:scale-95 transition"
          >
            +1.0
          </button>
          <button
            onClick={() => handleAdjust(+5.0)}
            className="py-1.5 bg-teal-50 hover:bg-teal-100 rounded-xl text-teal-800 font-bold active:scale-95 transition"
          >
            +5.0
          </button>
        </div>

        {/* Foot Action Buttons */}
        <div className="flex justify-between gap-2 pt-1">
          <button
            onClick={handleTare}
            className="flex-1 py-2.5 text-xs border border-slate-300 hover:bg-slate-50 rounded-xl text-slate-700 font-bold flex items-center justify-center gap-1 active:scale-95 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tare (เซ็ตศูนย์)
          </button>
          <button
            onClick={() => {
              onConfirmWeight(weight);
              onClose();
            }}
            className="flex-2 py-2.5 text-xs bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition"
          >
            <Check className="w-4 h-4" />
            ส่งน้ำหนักนี้เข้าฟอร์ม
          </button>
        </div>
      </div>
    </div>
  );
}
