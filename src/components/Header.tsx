"use client";

import React, { useState } from "react";
import { useRole } from "./RoleContext";
import { UserRole, ROLES } from "@/lib/types";
import { formatThaiDate } from "@/lib/dateUtils";
import { ShieldCheck, RotateCcw, User, ChevronDown, Sparkles } from "lucide-react";

export default function Header() {
  const { role, setRole, resetDemoData, isResetting } = useRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const todayThai = formatThaiDate(new Date());

  return (
    <header className="sticky top-0 z-40 bg-teal-800 text-white shadow-md">
      {/* Top Banner */}
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-teal-100 font-bold shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
              ระบบสต๊อกครัวโรงพยาบาล
              <span className="text-[10px] bg-teal-900/80 text-teal-200 px-1.5 py-0.5 rounded font-mono">
                HACCP
              </span>
            </h1>
            <p className="text-[10px] text-teal-200">
              Touch-once • {todayThai}
            </p>
          </div>
        </div>

        {/* Demo Reset Button */}
        <button
          onClick={resetDemoData}
          disabled={isResetting}
          title="รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น"
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-teal-900/90 hover:bg-teal-700 text-teal-100 rounded-full border border-teal-600/60 transition active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className={`w-3 h-3 ${isResetting ? "animate-spin" : ""}`} />
          <span>{isResetting ? "รีเซ็ต..." : "Reset Demo"}</span>
        </button>
      </div>

      {/* Role Switcher Bar */}
      <div className="bg-teal-900/90 px-4 py-1.5 border-t border-teal-700/50">
        <div className="max-w-md mx-auto flex items-center justify-between text-xs">
          <span className="text-[11px] text-teal-300 flex items-center gap-1">
            <User className="w-3 h-3 text-teal-400" />
            บทบาทจำลอง:
          </span>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-800 text-teal-100 font-medium text-xs border border-teal-600 hover:bg-teal-700 transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{ROLES[role].name}</span>
              <ChevronDown className="w-3 h-3 text-teal-300" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                    เลือกบทบาททดสอบ (Quick Switch)
                  </div>
                  {(Object.keys(ROLES) as UserRole[]).map((rKey) => {
                    const r = ROLES[rKey];
                    const isActive = rKey === role;
                    return (
                      <button
                        key={rKey}
                        onClick={() => {
                          setRole(rKey);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-teal-50 transition ${
                          isActive ? "bg-teal-50 text-teal-800 font-semibold" : ""
                        }`}
                      >
                        <div>
                          <div>{r.name}</div>
                          <div className="text-[10px] text-slate-400">{r.badge}</div>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
