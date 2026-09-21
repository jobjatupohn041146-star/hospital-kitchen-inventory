"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/components/RoleContext";
import { formatThaiDate, formatThaiDateTime, getDaysUntilExpiry } from "@/lib/dateUtils";
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Package,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const { roleConfig } = useRole();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-3">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin glow-teal" />
        <p className="text-xs font-medium text-teal-700">กำลังเชื่อมต่อระบบคลังโภชนาการ...</p>
      </div>
    );
  }

  const { metrics, expiringLots, items, recentTransactions } = data;

  return (
    <div className="space-y-4 pb-6 animate-in fade-in">
      {/* Morning Hero Glassmorphism Banner */}
      <div className="bg-linear-to-tr from-teal-900 via-teal-800 to-teal-700 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-teal-500/30 animate-float">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-100 bg-teal-950/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-teal-500/30">
              <Calendar className="w-3.5 h-3.5 text-teal-300" />
              สรุปเช้าวันนี้ ({formatThaiDate(new Date())})
            </span>
            <span className="text-[11px] text-teal-200 bg-teal-800/80 px-2 py-0.5 rounded-full border border-teal-600/40">
              คนไข้: <strong className="text-white">{metrics.totalPatients}</strong> เตียง
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Cost Card */}
            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="text-[10px] text-teal-200 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-teal-300" />
                ต้นทุนอาหาร 24 ชม.
              </div>
              <div className="text-xl font-black mt-0.5 tracking-tight">
                {roleConfig.canViewPrices ? (
                  <>฿{metrics.totalTodayCost.toLocaleString("th-TH", { minimumFractionDigits: 0 })}</>
                ) : (
                  <span className="text-xs font-normal text-teal-300">เฉพาะผู้มีสิทธิ์</span>
                )}
              </div>
              <div className="text-[9px] text-teal-200/80 mt-0.5">
                {roleConfig.canViewPrices ? `เฉลี่ย ฿${metrics.costPerPatient}/คน/วัน` : "ความปลอดภัย HACCP"}
              </div>
            </div>

            {/* Expiring Alert Card */}
            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="text-[10px] text-amber-200 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-300 animate-bounce" />
                เฝ้าระวังหมดอายุ
              </div>
              <div className="text-xl font-black mt-0.5 text-amber-300 flex items-baseline gap-1.5">
                <span>{data.expiringLotsCount}</span>
                <span className="text-xs font-normal text-teal-100">ล็อต</span>
              </div>
              <div className="text-[9px] text-amber-200/80 mt-0.5">
                ต้องเบิกใช้ใน 3 วันตาม FEFO
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Lights */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -top-8 w-36 h-36 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Floating Action Cards */}
      <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
        <Link
          href="/receive"
          className="glass-panel glass-card-hover p-4 rounded-3xl flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/30 glow-teal">
              📥
            </div>
            <div>
              <div className="text-slate-800 font-bold text-xs">รับของ AI</div>
              <div className="text-[10px] text-slate-400 font-normal">HACCP 0-4°C</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          href="/dispense"
          className="glass-panel glass-card-hover p-4 rounded-3xl flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30 glow-emerald">
              📤
            </div>
            <div>
              <div className="text-slate-800 font-bold text-xs">เบิกจ่าย FEFO</div>
              <div className="text-[10px] text-slate-400 font-normal">เสียงไทย & QR</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
        </Link>
      </div>

      {/* Section 1: Urgent FEFO Alerts */}
      <div className="glass-panel rounded-3xl p-4 border border-amber-200/80 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center glow-amber">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-800">
              เฝ้าระวังวันหมดอายุ (FEFO 3-Day Alert)
            </h2>
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            {expiringLots.length} ล็อตด่วน
          </span>
        </div>

        {expiringLots.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ไม่มีวัตถุดิบใกล้หมดอายุใน 3 วันนี้
          </div>
        ) : (
          <div className="space-y-2">
            {expiringLots.map((lot: any) => {
              const daysLeft = getDaysUntilExpiry(lot.expiryDate);
              const isUrgent = daysLeft <= 2;
              return (
                <div
                  key={lot.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                    isUrgent
                      ? "bg-amber-50/90 border-amber-300/80 shadow-xs"
                      : "bg-white/80 border-slate-200/80"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="text-slate-900">{lot.item.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-white text-slate-600 rounded-md font-mono border border-slate-200">
                        {lot.lotNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>คงเหลือ: <strong className="text-slate-800">{lot.remainingQty} {lot.item.baseUnit}</strong></span>
                      <span>•</span>
                      <span>หมดอายุ: {formatThaiDate(lot.expiryDate)}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isUrgent
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {daysLeft <= 0 ? "หมดอายุวันนี้!" : `เหลือ ${daysLeft} วัน`}
                    </span>
                    <div>
                      <Link
                        href={`/dispense?itemId=${lot.itemId}`}
                        className="text-[10px] text-teal-700 font-bold hover:underline flex items-center justify-end gap-0.5"
                      >
                        เบิกทันที <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Real-time Inventory Overview */}
      <div className="glass-panel rounded-3xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center glow-teal">
              <Package className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-800">
              สถานะสต๊อกวัตถุดิบ & Safety Stock
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            {items.length} ชนิดสินค้า
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {items.map((it: any) => {
            const ratio = it.safetyStock > 0 ? (it.totalStock / it.safetyStock) * 100 : 100;
            const isLow = it.totalStock <= it.safetyStock;

            return (
              <div key={it.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-1 flex-1 pr-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{it.name}</span>
                    <span className="font-bold text-slate-700 font-mono">
                      {it.totalStock} <span className="text-[10px] text-slate-400 font-normal font-sans">{it.baseUnit}</span>
                    </span>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow ? "bg-amber-500" : "bg-teal-600"
                      }`}
                      style={{ width: `${Math.min(100, ratio)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{it.category} • {it.storageType}</span>
                    <span>Safety: {it.safetyStock} {it.baseUnit}</span>
                  </div>
                </div>

                {isLow && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                    สต๊อกต่ำ
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Append-Only Audit Trail */}
      <div className="glass-panel rounded-3xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-800">
              ประวัติความเคลื่อนไหว (Append-Only Audit)
            </h2>
          </div>
          <span className="text-[9px] text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            SECURED
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {recentTransactions.slice(0, 5).map((tx: any) => {
            const isReceive = tx.type === "RECEIVE";
            return (
              <div
                key={tx.id}
                className="p-3 rounded-2xl bg-white/70 border border-slate-100 flex items-start justify-between shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isReceive
                          ? "bg-teal-100 text-teal-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isReceive ? "รับเข้า" : "เบิกจ่าย"}
                    </span>
                    <span className="font-bold text-slate-800">
                      {tx.item.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {tx.menuName || "บันทึกในระบบ"} • โดย {tx.operatorName} ({tx.operatorRole})
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {tx.method} • {formatThaiDateTime(tx.createdAt)}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold ${isReceive ? "text-teal-700" : "text-emerald-700"}`}>
                    {isReceive ? "+" : "-"}{tx.qty} {tx.item.baseUnit}
                  </div>
                  {roleConfig.canViewPrices && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      ฿{tx.totalCost.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
