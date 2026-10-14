import { NextResponse } from "next/server";
import { getJob, updateJob, checkFile } from "@/lib/jobs-db";
import { explainError } from "@/lib/explain-error";

export async function GET(_request, { params }) {
  const { id } = await params;
  const job = await getJob(id);
  return job ? NextResponse.json(job) : NextResponse.json({ error: "ไม่พบงานนี้" }, { status: 404 });
}

// แก้สถานะขั้น / วันกำหนดส่งงาน (JSON) หรือเปลี่ยนไฟล์ใบเสนอราคา (form-data)
export async function PATCH(request, { params }) {
  const { id } = await params;
  let change;
  if ((request.headers.get("content-type") || "").includes("multipart/form-data")) {
    const file = (await request.formData()).get("file");
    if (!file || typeof file !== "object" || file.size === 0) {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์" }, { status: 400 });
    }
    const fileError = checkFile(file);
    if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });
    change = { file };
  } else {
    change = await request.json();
  }
  let job;
  try {
    job = await updateJob(id, change);
  } catch (e) {
    console.error("update job failed:", e.message);
    return NextResponse.json({ error: `บันทึกไม่สำเร็จ: ${explainError(e)}` }, { status: 500 });
  }
  return job ? NextResponse.json(job) : NextResponse.json({ error: "ไม่พบงานนี้" }, { status: 404 });
}
