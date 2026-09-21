"use client";

import React from "react";
import { Mic, CheckCircle2, X, Volume2, Sparkles } from "lucide-react";

interface VoiceWaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  transcript: string;
  speechResponse: string | null;
  onConfirm: () => void;
  onRetry: () => void;
}

export default function VoiceWaveModal({
  isOpen,
  onClose,
  isListening,
  transcript,
  speechResponse,
  onConfirm,
  onRetry,
}: VoiceWaveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel-dark rounded-3xl max-w-sm w-full p-6 text-white border border-teal-500/30 shadow-2xl relative overflow-hidden space-y-5">
        {/* Glow Blob */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              ระบบรับเสียงภาษาไทย (Voice AI)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Siri/ChatGPT Style Voice Pulsing Sphere */}
        <div className="flex flex-col items-center justify-center py-4 relative z-10 space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Aura Rings */}
            <div
              className={`absolute w-28 h-28 rounded-full bg-teal-500/20 ${
                isListening ? "animate-ping" : "scale-100"
              }`}
            />
            <div
              className={`absolute w-24 h-24 rounded-full bg-emerald-500/30 ${
                isListening ? "animate-pulse" : "scale-100"
              }`}
            />

            {/* Glowing Center Microphone Orb */}
            <div className="relative w-18 h-18 rounded-full bg-linear-to-tr from-teal-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/50 glow-teal cursor-pointer active:scale-95 transition">
              <Mic className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Sound Wave Bars */}
          <div className="flex items-center justify-center gap-1.5 h-10">
            <span className={`w-1 bg-teal-400 rounded-full ${isListening ? "animate-wave-1" : "h-2"}`} />
            <span className={`w-1 bg-emerald-400 rounded-full ${isListening ? "animate-wave-2" : "h-3"}`} />
            <span className={`w-1 bg-cyan-300 rounded-full ${isListening ? "animate-wave-3" : "h-4"}`} />
            <span className={`w-1 bg-teal-300 rounded-full ${isListening ? "animate-wave-4" : "h-3"}`} />
            <span className={`w-1 bg-emerald-300 rounded-full ${isListening ? "animate-wave-5" : "h-2"}`} />
          </div>

          <div className="text-center">
            <p className="text-xs text-teal-300 font-medium">
              {isListening ? "กำลังรับฟังเสียงพูด... (พูด เช่น 'เบิกไก่ 5 กิโล')" : "ประมวลผลคำสั่งเสียงเรียบร้อย"}
            </p>
          </div>
        </div>

        {/* Transcript Box */}
        {transcript && (
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-teal-500/40 space-y-2 relative z-10 shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-teal-400">
              <span>ประโยคที่บันทึกได้:</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                ความแม่นยำสูง
              </span>
            </div>
            <div className="text-sm font-bold text-white tracking-wide">
              {transcript}
            </div>

            {speechResponse && (
              <div className="pt-2 border-t border-slate-800 text-xs text-emerald-300 flex items-start gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{speechResponse}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 relative z-10">
          <button
            onClick={onRetry}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold active:scale-95 transition"
          >
            พูดใหม่
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 active:scale-95 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ยืนยันรายการ (Touch-once)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
