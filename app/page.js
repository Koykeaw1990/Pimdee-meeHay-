import { STAGES, currentStage } from "@/lib/data";
import { readJobs } from "@/lib/jobs-db";
import Board from "./Board";

export const dynamic = "force-dynamic"; // อ่านข้อมูลล่าสุดทุกครั้งที่เปิดหน้า

const dayOf = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

export default async function Home() {
  const today = dayOf(new Date().toISOString());

  // เตรียมข้อมูลที่หน้าบอร์ดต้องใช้ (ส่งเฉพาะที่จำเป็น)
  const jobs = (await readJobs()).map((j) => {
    const stage = currentStage(j);
    const done = stage === STAGES.length;
    const doneCount = j.steps.filter((s) => s.done).length;
    const lastDone = j.steps.map((s) => s.doneAt).filter(Boolean).sort().pop() || "";
    return {
      id: j.id,
      sample: !!j.sample,
      customer: j.customer,
      docNo: j.docNo,
      stage,
      doneCount,
      done,
      dueDate: j.dueDate || "",
      late: !!j.dueDate && j.dueDate < today && stage <= 3,
      finishedToday: done && !!lastDone && dayOf(lastDone) === today,
      hasFile: !!j.file,
      createdAt: j.createdAt,
    };
  });

  return (
    <main className="wrap">
      <header className="top">
        <h1>บอร์ดงานขาย</h1>
        <p>ค้นหา กรอง และดูสถานะงานทั้งหมด กดที่งานเพื่อดูรายละเอียดและเปลี่ยนสถานะ</p>
      </header>
      <Board jobs={jobs} />
    </main>
  );
}
