import { NextResponse } from "next/server";
import { readJobs, createJob, checkFile } from "@/lib/jobs-db";
import { explainError } from "@/lib/explain-error";

export async function GET() {
  return NextResponse.json(await readJobs());
}

export async function POST(request) {
  const form = await request.formData();
  const customer = String(form.get("customer") || "").trim();
  const docNo = String(form.get("docNo") || "").trim();
  const file = form.get("file");
  const hasFile = file && typeof file === "object" && file.size > 0;

  const errors = {};
  if (!customer) errors.customer = "กรุณาใส่ชื่อลูกค้า";
  if (!docNo) errors.docNo = "กรุณาใส่เลขที่เอกสาร";
  if (hasFile) {
    const fileError = checkFile(file);
    if (fileError) errors.file = fileError;
  }
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  try {
    const { job, fileError } = await createJob({ customer, docNo, file: hasFile ? file : null });
    return NextResponse.json({ ...job, fileError }, { status: 201 });
  } catch (e) {
    console.error("create job failed:", e.message);
    return NextResponse.json({ error: `บันทึกไม่สำเร็จ: ${explainError(e)}` }, { status: 500 });
  }
}
