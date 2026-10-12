import Link from "next/link";
import { STAGES, currentStage, thDate } from "@/lib/data";
import { readJobs } from "@/lib/jobs-db";
import { Icon } from "./Icons";

export const dynamic = "force-dynamic"; // อ่านข้อมูลล่าสุดทุกครั้งที่เปิดหน้า

export default async function Home() {
  const jobs = await readJobs();
  const today = new Date().toISOString().slice(0, 10);
  const finished = jobs.filter((j) => currentStage(j) === STAGES.length);

  return (
    <main className="wrap">
      <header className="top">
        <h1>ระบบติดตามงานขาย</h1>
        <p>งานทั้งหมดแบ่งตาม 8 ขั้นตอน งานจะอยู่ในช่องของขั้นแรกที่ยังไม่เสร็จ กดที่งานเพื่อดูและเปลี่ยนสถานะ</p>
      </header>

      {jobs.length === 0 && (
        <div className="empty-box">
          <p>ยังไม่มีงานในระบบ</p>
          <Link href="/jobs/new" className="btn-main">+ เพิ่มงานแรก</Link>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="board">
          {STAGES.map((stage, i) => {
            const list = jobs.filter((j) => currentStage(j) === i);
            return (
              <section key={i} className="col" style={{ "--sc": `var(--s${i + 1})` }}>
                <div className="col-head">
                  <span className="col-ico"><Icon name={stage.icon} /></span>
                  <div>
                    <span className="col-step">ขั้นที่ {i + 1}</span>
                    <h2>{stage.name}</h2>
                  </div>
                  <span className="count">{list.length}</span>
                </div>
                {list.length === 0 && <p className="empty">ไม่มีงานในขั้นนี้</p>}
                {list.map((job) => (
                  <JobCard key={job.id} job={job} today={today} />
                ))}
              </section>
            );
          })}
        </div>
      )}

      {finished.length > 0 && (
        <section className="done-list">
          <h2>เสร็จครบทุกขั้นแล้ว</h2>
          <div className="board">
            {finished.map((job) => (
              <JobCard key={job.id} job={job} today={today} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function JobCard({ job, today }) {
  const doneCount = job.steps.filter((s) => s.done).length;
  const stage = currentStage(job);
  const late = job.dueDate && job.dueDate < today && stage <= 3;
  return (
    <Link href={`/jobs/${job.id}`} className="card" style={{ "--sc": `var(--s${Math.min(stage, 7) + 1})` }}>
      <h3>{job.customer}</h3>
      <p className="muted">เลขที่เอกสาร {job.docNo}</p>
      <div className="bar" title={`เสร็จ ${doneCount}/${STAGES.length} ขั้น`}>
        <i style={{ width: `${(doneCount * 100) / STAGES.length}%` }} />
      </div>
      <p className="row">
        <span className="muted">เสร็จ {doneCount}/{STAGES.length} ขั้น</span>
        {job.file && <span className="muted">📎 มีใบเสนอราคา</span>}
      </p>
      {job.dueDate && (
        <p className={late ? "chip late" : "chip"}>
          ส่งงาน {thDate(job.dueDate)}{late ? " · เลยกำหนด" : ""}
        </p>
      )}
    </Link>
  );
}
