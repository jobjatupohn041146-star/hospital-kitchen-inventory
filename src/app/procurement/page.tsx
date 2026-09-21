"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/RoleContext";
import { formatThaiDate } from "@/lib/dateUtils";
import PoApprovalModal from "@/components/PoApprovalModal";
import {
  FileSpreadsheet,
  Users,
  Building2,
  Calculator,
  Printer,
  CheckCircle,
  FileCheck,
  Send,
  Sparkles,
  ShieldCheck,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ProcurementPage() {
  const { roleConfig, showToast } = useRole();

  const [dietTypes, setDietTypes] = useState<any[]>([]);
  const [patientCounts, setPatientCounts] = useState<Record<string, number>>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [totalItemsToOrder, setTotalItemsToOrder] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

  // PO Created State
  const [approvedPoMap, setApprovedPoMap] = useState<Record<string, string>>({});
  const [approvedModalData, setApprovedModalData] = useState<{
    poNumber: string;
    supplierName: string;
    totalAmount: number;
    itemCount: number;
  } | null>(null);

  useEffect(() => {
    fetchForecastData();
  }, []);

  const fetchForecastData = async (overrideCounts?: Record<string, number>) => {
    try {
      setLoading(true);
      const url = overrideCounts
        ? `/api/forecast?patientCounts=${encodeURIComponent(JSON.stringify(overrideCounts))}`
        : "/api/forecast";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDietTypes(data.dietTypes);
        setGroups(data.groups);
        setGrandTotal(data.grandTotal);
        setTotalItemsToOrder(data.totalItemsToOrder);

        if (!overrideCounts) {
          const counts: Record<string, number> = {};
          data.dietTypes.forEach((dt: any) => {
            counts[dt.id] = dt.currentPatientCount;
          });
          setPatientCounts(counts);
        }

        if (data.groups.length > 0 && !expandedSupplier) {
          setExpandedSupplier(data.groups[0].supplierId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientCountChange = (dietTypeId: string, value: number) => {
    const updated = { ...patientCounts, [dietTypeId]: Math.max(0, value) };
    setPatientCounts(updated);
    fetchForecastData(updated);
  };

  // ปุ่มสุ่มจำนวนเตียงผู้ป่วยสำหรับ Demo ในชั้นเรียน
  const handleRandomizePatients = () => {
    const updated: Record<string, number> = {};
    dietTypes.forEach((dt: any) => {
      // สุ่มผู้ป่วย +/- 20%
      const base = dt.currentPatientCount;
      const variation = Math.floor(Math.random() * 15) - 7;
      updated[dt.id] = Math.max(5, base + variation);
    });
    setPatientCounts(updated);
    fetchForecastData(updated);
    showToast("จำลองตัวเลขผู้ป่วยประจำวันใหม่เรียบร้อย");
  };

  // บันทึกและอนุมัติ PO
  const handleApprovePO = async (group: any) => {
    try {
      setIsUpdating(true);
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_PO",
          supplierId: group.supplierId,
          items: group.items,
          totalAmount: group.totalEstimatedAmount,
          createdBy: roleConfig.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApprovedPoMap((prev) => ({
          ...prev,
          [group.supplierId]: data.purchaseOrder.poNumber,
        }));
        setApprovedModalData({
          poNumber: data.purchaseOrder.poNumber,
          supplierName: group.supplierName,
          totalAmount: group.totalEstimatedAmount,
          itemCount: group.items.length,
        });
        showToast(data.message);
        confetti({ particleCount: 40, spread: 50 });
      }
    } catch (e: any) {
      showToast("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPatientsSum = Object.values(patientCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4 pb-8">
      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span>สมองคำนวณและใบสั่งซื้อประจำวัน</span>
          <span className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-800 font-bold rounded-full">
            Smart Procurement
          </span>
        </h1>
        <p className="text-xs text-slate-500">
          คำนวณจากสูตรอาหาร (BOM) × ผู้ป่วยรายกลุ่มอาหาร • ปัดเศษตามขนาดแพ็ค
        </p>
      </div>

      {/* PDPA Privacy Badge */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
        <span>
          <strong>มาตรฐานความปลอดภัย PDPA:</strong> ระบบประมวลผลเฉพาะยอดรวมผู้ป่วยตามประเภทอาหาร ไม่บันทึกชื่อหรือ HN ผู้ป่วย
        </span>
      </div>

      {/* Section 1: Diet Types & Patient Census */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            <h2 className="text-xs font-bold text-slate-800">
              จำนวนผู้ป่วยตามประเภทอาหาร (Census)
            </h2>
          </div>
          <button
            onClick={handleRandomizePatients}
            className="flex items-center gap-1 text-[10px] text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded-lg border border-teal-200 font-medium active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            สุ่มยอดเตียง Demo
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {dietTypes.map((dt) => (
            <div
              key={dt.id}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-1.5"
            >
              <div>
                <div className="font-bold text-slate-800 text-[11px]">{dt.name}</div>
                <div className="text-[9px] text-slate-400 line-clamp-1">{dt.description}</div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                <span className="text-[10px] text-slate-500">ผู้ป่วย:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={patientCounts[dt.id] || 0}
                    onChange={(e) =>
                      handlePatientCountChange(dt.id, parseInt(e.target.value) || 0)
                    }
                    className="w-14 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded-md py-0.5 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">คน</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-right text-[11px] text-slate-500 font-medium pt-1">
          ยอดผู้ป่วยรวมทุกกลุ่มอาหาร: <strong className="text-teal-800">{totalPatientsSum}</strong> เตียง
        </div>
      </div>

      {/* Summary KPI */}
      <div className="bg-linear-to-r from-teal-800 to-teal-900 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
        <div>
          <div className="text-[10px] text-teal-200 uppercase tracking-wider font-semibold">
            สรุปยอดสั่งซื้อพรุ่งนี้ (Tomorrow's PO)
          </div>
          <div className="text-xl font-bold mt-0.5 flex items-baseline gap-2">
            <span>{totalItemsToOrder} รายการ</span>
            <span className="text-xs text-teal-200 font-normal">
              ({groups.length} ซัพพลายเออร์)
            </span>
          </div>
        </div>

        {roleConfig.canViewPrices && (
          <div className="text-right">
            <div className="text-[10px] text-teal-200">ประมาณการมูลค่า</div>
            <div className="text-xl font-bold text-teal-100">
              ฿{grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 0 })}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Purchase Orders Grouped by Supplier */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 px-1">
          <Building2 className="w-4 h-4 text-teal-700" />
          <span>ใบสั่งซื้อแยกรายซัพพลายเออร์ ({groups.length} รายการ)</span>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-200 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="font-bold text-slate-700">สต๊อกเพียงพอ ไม่ต้องสั่งซื้อเพิ่ม!</div>
            <p className="text-[10px]">
              วัตถุดิบคงเหลือปัจจุบันมากกว่ายอดความต้องการใช้ + Safety Stock
            </p>
          </div>
        ) : (
          groups.map((group) => {
            const isExpanded = expandedSupplier === group.supplierId;
            const poNumber = approvedPoMap[group.supplierId];

            return (
              <div
                key={group.supplierId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition"
              >
                {/* Supplier Card Header */}
                <div
                  onClick={() => setExpandedSupplier(isExpanded ? null : group.supplierId)}
                  className="p-3.5 bg-slate-50 hover:bg-teal-50/40 cursor-pointer flex items-center justify-between border-b border-slate-100"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <span>{group.supplierName}</span>
                      {poNumber && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                          {poNumber} (อนุมัติแล้ว)
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {group.itemCount} ชนิดวัตถุดิบ • สั่งตามขนาดแพ็ค
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {roleConfig.canViewPrices && (
                      <span className="text-xs font-bold text-teal-800">
                        ฿{group.totalEstimatedAmount.toLocaleString("th-TH", { minimumFractionDigits: 0 })}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Items in this Supplier's PO */}
                {isExpanded && (
                  <div className="p-3 space-y-3 animate-in fade-in">
                    <div className="divide-y divide-slate-100 text-xs">
                      {group.items.map((it: any) => (
                        <div key={it.itemId} className="py-2.5 space-y-1">
                          <div className="flex justify-between font-semibold text-slate-800">
                            <span>{it.itemName}</span>
                            <span className="font-bold text-teal-700">
                              สั่ง: {it.totalOrderQty} {it.baseUnit}
                            </span>
                          </div>

                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>
                              ขนาดบรรจุ: <strong>{it.packUnit}</strong> ({it.packsToOrder} แพ็ค)
                            </span>
                            {roleConfig.canViewPrices && (
                              <span>฿{it.estimatedTotalCost.toFixed(0)}</span>
                            )}
                          </div>

                          {/* Calculation Explanation */}
                          <div className="text-[10px] bg-slate-50 text-slate-500 p-1.5 rounded-lg border border-slate-100 space-y-0.5">
                            <div className="flex justify-between">
                              <span>ต้องใช้พรุ่งนี้: {it.calculatedDailyDemand} {it.baseUnit}</span>
                              <span>คงเหลือปัจจุบัน: {it.currentStock} {it.baseUnit}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>เกณฑ์ Safety: {it.safetyStock} {it.baseUnit}</span>
                              <span>คำนวณจาก: {it.calculationMethod === "RECIPE_BOM" ? "สูตรอาหาร (BOM)" : "สถิติ 14 วัน"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* PO Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => window.print()}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>พิมพ์ PO (PDF)</span>
                      </button>

                      {roleConfig.canApprovePO && (
                        <button
                          onClick={() => handleApprovePO(group)}
                          disabled={isUpdating || !!poNumber}
                          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition ${
                            poNumber
                              ? "bg-emerald-100 text-emerald-800 cursor-default"
                              : "bg-teal-700 hover:bg-teal-800 text-white shadow-xs"
                          }`}
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>{poNumber ? "อนุมัติแล้ว" : "อนุมัติสั่งซื้อ (Approve PO)"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Po Approval Success Pop-up Modal */}
      {approvedModalData && (
        <PoApprovalModal
          isOpen={!!approvedModalData}
          onClose={() => setApprovedModalData(null)}
          poNumber={approvedModalData.poNumber}
          supplierName={approvedModalData.supplierName}
          totalAmount={approvedModalData.totalAmount}
          itemCount={approvedModalData.itemCount}
        />
      )}
    </div>
  );
}
