"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  Mic,
  FileSpreadsheet,
  SearchCheck,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "แดชบอร์ด",
      icon: LayoutDashboard,
    },
    {
      href: "/receive",
      label: "รับของ AI",
      icon: ScanLine,
    },
    {
      href: "/dispense",
      label: "เบิก FEFO",
      icon: Mic,
    },
    {
      href: "/procurement",
      label: "สั่งซื้อ PO",
      icon: FileSpreadsheet,
    },
    {
      href: "/traceability",
      label: "ตามรอยล็อต",
      icon: SearchCheck,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
                isActive
                  ? "text-teal-700 font-bold"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110 text-teal-700" : ""
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-600" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
