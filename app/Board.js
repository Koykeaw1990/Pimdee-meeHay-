"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STAGES, thDate } from "@/lib/data";
import { Icon } from "./Icons";

const PAGE_SIZE = 50;
const PER_COLUMN = 5;

const TILES = [
  { key: "open", label: "ยังไม่เสร็จ", cls: "t-red", test: (j) => !j.done },
  { key: "late", label: "เลยกำหนดส่งงาน", cls: "t-orange", test: (j) => j.late },
  { key: "today", label: "เสร็จวันนี้", cls: "t-green", test: (j) => j.finishedToday },
  { key: "all", label: "ทั้งหมด", cls: "t-blue", test: () => true },
];

const COLUMNS = [
  { key: "customer", label: "ชื่อลูกค้า", val: (j) => j.customer },
  { key: "docNo", label: "เลขที่เอกสาร", val: (j) => j.docNo },
  { key: "stage", label: "ขั้นปัจจุบัน", val: (j) => j.stage },
  { key: "progress", label: "ความคืบหน้า", val: (j) => j.doneCount },
  { key: "dueDate", label: "วันส่งงาน", val: (j) => j.dueDate || "9999" },
  { key: "status", label: "สถานะ", val: (j) => (j.done ? 1 : 0) },
];

const stageVar = (j) => ({ "--sc": j.done ? "var(--green)" : `var(--s${j.stage + 1})` });

export default function Board({ jobs }) {
  const [view, setView] = useState("table");
  const [tile, setTile] = useState("all");
  const [stage, setStage] = useState("all"); // "all" | 0-7 | "done"
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: "dueDate", dir: 1 });
  const [page, setPage] = useState(0);

  // จำมุมมองที่เลือกไว้ในเบราว์เซอร์นี้
  useEffect(() => {
    try {
      const v = localStorage.getItem("board-view");
      if (v === "board" || v === "table") setView(v);
    } catch {}
  }, []);
  function changeView(v) {
    setView(v);
    try { localStorage.setItem("board-view", v); } catch {}
  }

  // กรองตามกล่องสรุป + ค้นหา (ยังไม่กรองตามขั้น เพื่อนับจำนวนบนปุ่มขั้น)
  const base = useMemo(() => {
    const t = TILES.find((x) => x.key === tile);
    const words = q.trim().toLowerCase();
    return jobs.filter((j) => t.test(j) && (!words || `${j.customer} ${j.docNo}`.toLowerCase().includes(words)));
  }, [jobs, tile, q]);

  const stageCounts = useMemo(() => {
    const c = Array(STAGES.length + 1).fill(0);
    base.forEach((j) => c[j.stage]++);
    return c;
  }, [base]);

  const list = useMemo(() => {
    const byStage = base.filter((j) => stage === "all" || (stage === "done" ? j.done : j.stage === stage));
    const col = COLUMNS.find((c) => c.key === sort.key);
    return [...byStage].sort((a, b) => {
      const x = col.val(a), y = col.val(b);
      const r = typeof x === "number" ? x - y : String(x).localeCompare(String(y), "th", { numeric: true });
      return r * sort.dir || (a.createdAt < b.createdAt ? 1 : -1);
    });
  }, [base, stage, sort]);

  useEffect(() => setPage(0), [tile, stage, q, sort]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const shown = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function sortBy(key) {
    setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }));
  }
  function openStage(i) {
    setStage(i);
    changeView("table");
  }

  if (jobs.length === 0) {
    return (
      <div className="empty-box">
        <p>ยังไม่มีงานในระบบ</p>
        <Link href="/jobs/new" className="btn-main">+ เพิ่มงานแรก</Link>
      </div>
    );
  }

  return (
    <>
      <SampleBar count={jobs.filter((j) => j.sample).length} />
      <div className="stat-tiles">
        {TILES.map((t) => (
          <button key={t.key} type="button" className={`stat ${t.cls}${tile === t.key ? " on" : ""}`}
            onClick={() => setTile(t.key)} aria-pressed={tile === t.key}>
            <span className="stat-label">{t.label}</span>
            <strong>{jobs.filter(t.test).length}</strong>
            <span className="stat-unit">งาน</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search">
          <label htmlFor="q" className="sr-only">ค้นหา</label>
          <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อลูกค้า หรือเลขที่เอกสาร" />
        </div>
        <div className="seg" role="group" aria-label="มุมมอง">
          <button type="button" aria-pressed={view === "table"} onClick={() => changeView("table")}>ตาราง</button>
          <button type="button" aria-pressed={view === "board"} onClick={() => changeView("board")}>บอร์ด</button>
        </div>
      </div>

      <div className="stage-chips" role="group" aria-label="เลือกขั้น">
        <button type="button" className={stage === "all" ? "chipbtn on" : "chipbtn"} onClick={() => setStage("all")}>
          ทั้งหมด <b>{base.length}</b>
        </button>
        {STAGES.map((s, i) => (
          <button key={i} type="button" style={{ "--sc": `var(--s${i + 1})` }}
            className={stage === i ? "chipbtn st on" : "chipbtn st"} onClick={() => setStage(i)} title={s.name}>
            ขั้น {i + 1} <b>{stageCounts[i]}</b>
          </button>
        ))}
        <button type="button" className={stage === "done" ? "chipbtn ok on" : "chipbtn ok"} onClick={() => setStage("done")}>
          เสร็จแล้ว <b>{stageCounts[STAGES.length]}</b>
        </button>
      </div>
      {typeof stage === "number" && <p className="stage-name">ขั้นที่ {stage + 1}: {STAGES[stage].name}</p>}

      {list.length === 0 && <div className="empty-box"><p>ไม่พบงานที่ตรงกับที่เลือก</p></div>}

      {list.length > 0 && view === "table" && (
        <>
          <div className="tbl-wrap">
            <table className="jobs-table">
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th key={c.key} aria-sort={sort.key === c.key ? (sort.dir > 0 ? "ascending" : "descending") : "none"}>
                      <button type="button" className="th-sort" onClick={() => sortBy(c.key)}>
                        {c.label} <span aria-hidden="true">{sort.key === c.key ? (sort.dir > 0 ? "▲" : "▼") : "↕"}</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((j) => (
                  <tr key={j.id} style={stageVar(j)}>
                    <td className="c-name">
                      <Link href={`/jobs/${j.id}`}>{j.customer}</Link>
                      {j.sample && <span className="sample-tag">ตัวอย่าง</span>}
                      {j.hasFile && <span className="clip" title="มีไฟล์ใบเสนอราคา"><Icon name="clip" size={15} /></span>}
                    </td>
                    <td className="muted">{j.docNo}</td>
                    <td>
                      {j.done ? <span className="muted">—</span>
                        : <span className="stage-pill">{j.stage + 1}. {STAGES[j.stage].name}</span>}
                    </td>
                    <td>
                      <div className="mini-prog" title={`เสร็จ ${j.doneCount}/8 ขั้น`}>
                        {STAGES.map((_, i) => <i key={i} className={i < j.doneCount ? "on" : ""} />)}
                      </div>
                      <span className="small muted">{j.doneCount}/8</span>
                    </td>
                    <td>{j.dueDate ? <span className={j.late ? "late-text" : ""}>{thDate(j.dueDate)}{j.late ? " · เลยกำหนด" : ""}</span> : <span className="muted">—</span>}</td>
                    <td><StatusBar job={j} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="pager">
              <button type="button" className="btn-soft" disabled={page === 0} onClick={() => setPage(page - 1)}>← ก่อนหน้า</button>
              <span>หน้า {page + 1} จาก {pages} · ทั้งหมด {list.length} งาน</span>
              <button type="button" className="btn-soft" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>ถัดไป →</button>
            </div>
          )}
          {pages === 1 && <p className="help count-line">แสดง {list.length} งาน</p>}
        </>
      )}

      {list.length > 0 && view === "board" && (
        <div className="board">
          {[...STAGES.map((s, i) => ({ i, name: s.name, icon: s.icon })), { i: STAGES.length, name: "เสร็จครบทุกขั้น", icon: "check" }]
            .filter(({ i }) => stage === "all" || (stage === "done" ? i === STAGES.length : i === stage))
            .map(({ i, name, icon }) => {
              const col = list.filter((j) => j.stage === i);
              return (
                <section key={i} className="col" style={{ "--sc": i === STAGES.length ? "var(--green)" : `var(--s${i + 1})` }}>
                  <div className="col-head">
                    <span className="col-ico"><Icon name={icon} /></span>
                    <div>
                      <span className="col-step">{i === STAGES.length ? "เสร็จแล้ว" : `ขั้นที่ ${i + 1}`}</span>
                      <h2>{name}</h2>
                    </div>
                    <span className="count">{col.length}</span>
                  </div>
                  {col.length === 0 && <p className="empty">ไม่มีงานในขั้นนี้</p>}
                  {col.slice(0, PER_COLUMN).map((j) => <Card key={j.id} job={j} />)}
                  {col.length > PER_COLUMN && (
                    <button type="button" className="more" onClick={() => openStage(i === STAGES.length ? "done" : i)}>
                      ดูทั้งหมด ({col.length} งาน) →
                    </button>
                  )}
                </section>
              );
            })}
        </div>
      )}
    </>
  );
}

function StatusBar({ job }) {
  return job.done ? (
    <span className="status-bar s-ok">เสร็จครบแล้ว</span>
  ) : (
    <span className="status-bar s-red">ยังไม่เสร็จ · เหลือ {8 - job.doneCount} ขั้น</span>
  );
}

function Card({ job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="card" style={stageVar(job)}>
      <StatusBar job={job} />
      <h3>{job.customer} {job.sample && <span className="sample-tag">ตัวอย่าง</span>}</h3>
      <p className="muted small">เลขที่เอกสาร {job.docNo}</p>
      <div className="mini-prog">
        {STAGES.map((_, i) => <i key={i} className={i < job.doneCount ? "on" : ""} />)}
      </div>
      {job.dueDate && !job.done && (
        <p className={job.late ? "chip late" : "chip"}>ส่งงาน {thDate(job.dueDate)}{job.late ? " · เลยกำหนด" : ""}</p>
      )}
    </Link>
  );
}

// แถบแจ้งว่ามีงานตัวอย่าง พร้อมปุ่มลบงานตัวอย่างทั้งหมด (ถามยืนยันก่อน)
function SampleBar({ count }) {
  const router = useRouter();
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (!count) return null;

  async function removeAll() {
    setBusy(true);
    try {
      const res = await fetch("/api/samples", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAsk(false);
      router.refresh();
    } catch {
      setErr("ลบไม่สำเร็จ กรุณาลองใหม่");
    }
    setBusy(false);
  }

  return (
    <div className="sample-bar">
      <span>
        <span className="sample-tag">ตัวอย่าง</span> ตอนนี้มีงานตัวอย่าง <b>{count}</b> งาน (ข้อมูลสมมติ) ไว้ดูการทำงานของระบบ
      </span>
      {!ask ? (
        <button type="button" className="btn-soft danger" onClick={() => setAsk(true)}>ลบงานตัวอย่างทั้งหมด</button>
      ) : (
        <span className="confirm-row">
          <span>ลบงานตัวอย่าง {count} งาน? งานจริงไม่ถูกลบ</span>
          <button type="button" className="btn-danger" onClick={removeAll} disabled={busy}>{busy ? "กำลังลบ…" : "ยืนยันลบ"}</button>
          <button type="button" className="btn-soft" onClick={() => setAsk(false)} disabled={busy}>ยกเลิก</button>
        </span>
      )}
      {err && <span className="err">{err}</span>}
    </div>
  );
}
