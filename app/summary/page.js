import Link from "next/link";
import { STAGES, currentStage, thDate } from "@/lib/data";
import { readJobs } from "@/lib/jobs-db";
import { Icon } from "../Icons";

export const dynamic = "force-dynamic";

// วันที่แบบ YYYY-MM-DD ตามเวลาประเทศไทย
const dayOf = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
const timeOf = (iso) => new Date(iso).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" });
const longDate = (day) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

export default async function Summary({ searchParams }) {
  const { date = "" } = await searchParams;
  const pick = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  const today = dayOf(new Date().toISOString());

  // งานที่เสร็จครบ 8 ขั้น: วันที่เสร็จ = วันที่กดขั้นสุดท้ายที่เสร็จ (ล่าสุด)
  const finished = (await readJobs())
    .filter((j) => currentStage(j) === STAGES.length)
    .map((j) => {
      const at = j.steps.map((s) => s.doneAt).filter(Boolean).sort().pop() || j.createdAt;
      return { ...j, finishedAt: at, day: dayOf(at) };
    })
    .sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1));

  const groups = [];
  for (const j of finished) {
    if (pick && j.day !== pick) continue;
    const g = groups.at(-1);
    if (g && g.day === j.day) g.jobs.push(j);
    else groups.push({ day: j.day, jobs: [j] });
  }
  const todayCount = finished.filter((j) => j.day === today).length;

  return (
    <main className="wrap mid">
      <header className="top">
        <h1>สรุปงานที่เสร็จรายวัน</h1>
        <p>งานที่ทำครบทั้ง 8 ขั้นตอน แยกตามวันที่ทำขั้นสุดท้ายเสร็จ</p>
      </header>

      <div className="tiles">
        <div className="tile tile-green">
          <span className="tile-ico"><Icon name="check" size={26} /></span>
          <div><span className="tile-label">เสร็จวันนี้</span><strong>{todayCount} งาน</strong></div>
        </div>
        <div className="tile tile-blue">
          <span className="tile-ico"><Icon name="list" size={26} /></span>
          <div><span className="tile-label">เสร็จครบทั้งหมด</span><strong>{finished.length} งาน</strong></div>
        </div>
      </div>

      <form className="filter" method="get">
        <label htmlFor="date">ดูเฉพาะวันที่</label>
        <input id="date" name="date" type="date" defaultValue={pick} />
        <button type="submit" className="btn-soft">ดู</button>
        {pick && <Link href="/summary" className="clear">ดูทุกวัน</Link>}
      </form>

      {groups.length === 0 && (
        <div className="empty-box">
          <p>{pick ? `ไม่มีงานที่เสร็จครบในวันที่ ${thDate(pick)}` : "ยังไม่มีงานที่เสร็จครบทั้ง 8 ขั้น"}</p>
          <p className="help">งานจะมาอยู่ที่นี่เมื่อทั้ง 8 ขั้นเป็น "เสร็จแล้ว"</p>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.day} className="panel day">
          <h2 className="day-head">
            <span>{longDate(g.day)}{g.day === today && <span className="today">วันนี้</span>}</span>
            <span className="day-count">{g.jobs.length} งาน</span>
          </h2>
          <ul className="day-list">
            {g.jobs.map((j) => (
              <li key={j.id}>
                <Link href={`/jobs/${j.id}`} className="day-job">
                  <span className="day-ico"><Icon name="check" /></span>
                  <span className="day-name">
                    <strong>{j.customer}</strong>
                    <span className="muted">เลขที่เอกสาร {j.docNo}</span>
                  </span>
                  <span className="muted">เสร็จ {timeOf(j.finishedAt)} น.</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
