import { NextResponse } from "next/server";
import { readQuoteCustomers } from "@/lib/xlsx-reader";
import { MAX_FILE_SIZE } from "@/lib/jobs-db";

// อ่านชื่อลูกค้าจากไฟล์ Excel ที่เลือก (ยังไม่บันทึกไฟล์)
export async function POST(request) {
  const file = (await request.formData()).get("file");
  if (!file || typeof file !== "object" || !/\.xlsx$/i.test(file.name)) {
    return NextResponse.json({ error: "ดึงชื่ออัตโนมัติได้เฉพาะไฟล์ Excel (.xlsx)" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: `ไฟล์ใหญ่เกิน ${MAX_FILE_SIZE / 1024 / 1024} MB` }, { status: 400 });
  }
  try {
    const sheets = readQuoteCustomers(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ sheets });
  } catch {
    return NextResponse.json({ error: "เปิดไฟล์ Excel นี้ไม่ได้ ไฟล์อาจเสีย หรือเป็น Excel แบบเก่า (.xls)" }, { status: 400 });
  }
}
