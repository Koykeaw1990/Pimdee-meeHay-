import { getJob, readFile } from "@/lib/jobs-db";

// เปิดไฟล์ใบเสนอราคาของงาน
export async function GET(_request, { params }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job || !job.file) return new Response("ไม่พบไฟล์", { status: 404 });
  const data = await readFile(job.file.stored);
  if (!data) return new Response("ไม่พบไฟล์", { status: 404 });
  const inline = job.file.type === "application/pdf" || job.file.type.startsWith("image/");
  return new Response(data, {
    headers: {
      "Content-Type": job.file.type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(job.file.original)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
