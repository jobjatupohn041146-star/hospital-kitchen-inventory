"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, RoleConfig, ROLES } from "@/lib/types";

interface RoleContextType {
  role: UserRole;
  roleConfig: RoleConfig;
  setRole: (role: UserRole) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  resetDemoData: () => Promise<void>;
  isResetting: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("CHEF");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("hospital_kitchen_role") as UserRole;
    if (savedRole && ROLES[savedRole]) {
      setRoleState(savedRole);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("hospital_kitchen_role", newRole);
    showToast(`สลับบทบาทเป็น: ${ROLES[newRole].name}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const resetDemoData = async () => {
    try {
      setIsResetting(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว!");
        window.location.reload();
      } else {
        showToast("เกิดข้อผิดพลาดในการรีเซ็ต: " + data.error);
      }
    } catch (e: any) {
      showToast("รีเซ็ตไม่สำเร็จ: " + e.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        roleConfig: ROLES[role],
        setRole,
        isDemoMode,
        setIsDemoMode,
        resetDemoData,
        isResetting,
        toastMessage,
        showToast,
      }}
    >
      {children}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 text-white text-xs md:text-sm rounded-full shadow-lg border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
