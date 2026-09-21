import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RoleProvider } from "@/components/RoleContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "ระบบสต๊อกครัวโรงพยาบาล Touch-once (HACCP)",
  description:
    "ระบบบริหารจัดการคลังวัตถุดิบครัวโรงพยาบาลแบบไม่ต้องพิมพ์ HACCP, FEFO, คำนวณยอดสั่งซื้อตามสูตรอาหาร และ Mock Recall 1 นาที",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-slate-900 min-h-screen text-slate-800 antialiased flex flex-col justify-center items-center selection:bg-teal-300 selection:text-teal-950 font-sans relative overflow-x-hidden">
        {/* Ambient Glow Background Lighting (Figma Luxury Lighting) */}
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/15 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
        <div className="fixed top-[40%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

        <RoleProvider>
          <div className="flex-1 flex flex-col w-full max-w-md mx-auto bg-slate-50/95 min-h-screen shadow-2xl border-x border-teal-900/30 pb-20 relative backdrop-blur-md">
            <Header />
            <main className="flex-1 p-4 overflow-y-auto">{children}</main>
            <BottomNav />
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
