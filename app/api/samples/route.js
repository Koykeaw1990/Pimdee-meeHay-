import { NextResponse } from "next/server";
import { addSampleJobs, removeSampleJobs } from "@/lib/jobs-db";
import { makeSampleJobs } from "@/lib/samples";

// เพิ่มงานตัวอย่าง 18 งาน
export async function POST() {
  const added = await addSampleJobs(makeSampleJobs());
  return NextResponse.json({ added });
}

// ลบงานตัวอย่างทั้งหมด (งานจริงไม่ถูกแตะ)
export async function DELETE() {
  const removed = await removeSampleJobs();
  return NextResponse.json({ removed });
}
