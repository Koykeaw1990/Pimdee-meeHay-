import { promises as fs } from "fs";
import path from "path";
import { getJob, UPLOAD_DIR } from "@/lib/jobs-db";

// เปิดไฟล์ใบเสนอราคาของงาน
export async function GET(_request, { params }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job || !job.file) return new Response("ไม่พบไฟล์", { status: 404 });
  const data = await fs.readFile(path.join(UPLOAD_DIR, path.basename(job.file.stored)));
  const inline = job.file.type === "application/pdf" || job.file.type.startsWith("image/");
  return new Response(data, {
    headers: {
      "Content-Type": job.file.type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(job.file.original)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
