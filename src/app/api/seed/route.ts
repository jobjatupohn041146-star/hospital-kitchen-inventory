import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  try {
    const { stdout, stderr } = await execAsync("npm run db:seed", {
      cwd: process.cwd(),
    });

    return NextResponse.json({
      success: true,
      message: "รีเซ็ตข้อมูลตัวอย่างสำหรับโหมด Demo เรียบร้อยแล้ว",
      log: stdout || stderr,
    });
  } catch (error: any) {
    console.error("Seed API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
