import Link from "next/link";
import { getJob } from "@/lib/jobs-db";
import JobDetail from "./JobDetail";

export const dynamic = "force-dynamic";

export default async function JobPage({ params, searchParams }) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const job = await getJob(id);

  if (!job) {
    return (
      <main className="wrap narrow">
        <header className="top">
          <h1>ไม่พบงานนี้</h1>
          <p>งานอาจถูกลบไปแล้ว หรือที่อยู่หน้าเว็บไม่ถูกต้อง</p>
        </header>
        <Link href="/" className="btn-main">กลับไปบอร์ดงานขาย</Link>
      </main>
    );
  }
  return <JobDetail initialJob={job} isNew={!!isNew} />;
}
