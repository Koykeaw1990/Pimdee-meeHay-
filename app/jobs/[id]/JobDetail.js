"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STAGES, currentStage, thDate } from "@/lib/data";
import FilePicker from "../../FilePicker";
import { Icon, PrintShopArt } from "../../Icons";
import Shipment from "./Shipment";
import DeliveryNote from "./DeliveryNote";

export default function JobDetail({ initialJob, isNew }) {
  const router = useRouter();
  const [job, setJob] = useState(initialJob);
  const [busy, setBusy] = useState(-1);
  const [msg, setMsg] = useState(isNew ? { ok: true, text: "บันทึกงานใหม่เรียบร้อยแล้ว" } : null);

  async function send(body, isFile) {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      ...(isFile ? { body } : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
    if (res.status === 413) throw new Error("ไฟล์ใหญ่เกินไป เว็บออนไลน์รับไฟล์ไม่เกิน 4 MB");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    setJob(data);
    router.refresh();
    return data;
  }

  // บันทึก แล้วแสดงข้อความผลลัพธ์
  async function run(body, okText, isFile) {
    try {
      await send(body, isFile);
      setMsg({ ok: true, text: okText });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    }
  }

  async function toggle(i) {
    setBusy(i);
    const done = !job.steps[i].done;
    await run({ step: i, done }, `ขั้นที่ ${i + 1} ${done ? "เสร็จแล้ว" : "เปลี่ยนกลับเป็นยังไม่เสร็จ"}`);
    setBusy(-1);
  }

  const setDue = (value) =>
    run({ dueDate: value }, value ? `กำหนดวันส่งงาน ${thDate(value)} แล้ว` : "ล้างวันกำหนดส่งงานแล้ว");

  const saveDeliveryNote = (value) =>
    run({ deliveryNoteNo: value }, value ? "บันทึกเลขที่ใบส่งของแล้ว" : "ลบเลขที่ใบส่งของแล้ว");

  const saveShipment = (shipment) =>
    run({ shipment }, `${shipment.number ? "บันทึก" : "ลบ"}เลขพัสดุของขั้นที่ ${shipment.step + 1} แล้ว`);

  function upload(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setMsg({ ok: false, text: "ไฟล์ใหญ่เกิน 10 MB" });
    const body = new FormData();
    body.append("file", file);
    run(body, "แนบไฟล์ใบเสนอราคาแล้ว", true);
  }

  const stage = currentStage(job);
  const doneCount = job.steps.filter((s) => s.done).length;
  const allDone = stage === STAGES.length;

  return (
    <main className="wrap mid">
      <Link href="/" className="back">← กลับไปบอร์ดงานขาย</Link>

      <header className="hero">
        <div className="hero-text">
          <span className="eyebrow">รายละเอียดงาน</span>
          <h1>{job.customer}</h1>
          <p className="tags">
            <span className="tag">เลขที่เอกสาร {job.docNo}</span>
            <span className="tag">เพิ่มเมื่อ {thDate(job.createdAt)}</span>
            {job.sample && <span className="sample-tag">ตัวอย่าง · ข้อมูลสมมติ</span>}
          </p>
          <div className="progress" aria-label={`เสร็จ ${doneCount} จาก ${STAGES.length} ขั้น`}>
            {STAGES.map((_, i) => (
              <i key={i} className={job.steps[i].done ? "on" : ""} style={{ "--sc": `var(--s${i + 1})` }} />
            ))}
          </div>
          <p className="progress-text">
            {allDone ? "เสร็จครบทุกขั้นแล้ว 🎉" : `เสร็จ ${doneCount}/${STAGES.length} ขั้น · ขั้นถัดไป: ${STAGES[stage].name}`}
          </p>
        </div>
        <PrintShopArt />
      </header>

      {msg && <p className={msg.ok ? "ok" : "alert"} role="status">{msg.text}</p>}

      <section className="panel">
        <h2 className="panel-title"><span className="pi pi-blue"><Icon name="clip" /></span>ไฟล์ใบเสนอราคา</h2>
        {job.file ? (
          <div className="file-card">
            <span className="file-ico"><Icon name="quote" size={26} /></span>
            <div className="file-info">
              <strong>{job.file.original}</strong>
              <span className="muted">{(job.file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <a href={`/api/jobs/${job.id}/file`} target="_blank" rel="noopener" className="btn-main">เปิดดูไฟล์</a>
          </div>
        ) : (
          <p className="muted">ยังไม่ได้แนบไฟล์</p>
        )}
        <div className="field">
          <label htmlFor="file">{job.file ? "เปลี่ยนเป็นไฟล์ใหม่" : "แนบไฟล์"}</label>
          <FilePicker id="file" label={job.file ? "เลือกไฟล์ใหม่" : "เลือกไฟล์"} onPick={upload} />
          <p className="help">รับไฟล์ PDF, รูป (JPG, PNG), Word หรือ Excel ไม่เกิน 10 MB (บนเว็บออนไลน์ไม่เกิน 4 MB)</p>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title"><span className="pi pi-green"><Icon name="list" /></span>สถานะ 8 ขั้นตอน</h2>
        <p className="help">กดที่แต่ละขั้นเพื่อสลับสถานะ ยังไม่เสร็จ ↔ เสร็จแล้ว</p>
        <ol className="steps">
          {STAGES.map((s, i) => {
            const st = job.steps[i];
            const cls = ["step", st.done && "done", i === stage && "now"].filter(Boolean).join(" ");
            return (
              <li key={i} className={cls} style={{ "--sc": `var(--s${i + 1})` }}>
                <button type="button" className="step-btn" onClick={() => toggle(i)}
                  disabled={busy !== -1} aria-pressed={st.done}>
                  <span className="step-ico"><Icon name={st.done ? "check" : s.icon} /></span>
                  <span className="step-name">
                    <small>ขั้นที่ {i + 1}</small>
                    {s.name}
                  </span>
                  <span className="pill">
                    {busy === i ? "กำลังบันทึก…" : st.done ? `เสร็จแล้ว · ${thDate(st.doneAt)}` : "ยังไม่เสร็จ"}
                  </span>
                </button>
                {s.hasDueDate && (
                  <div className="sub">
                    <div className="ship-row">
                      <div className="ship-field">
                        <label htmlFor="dueDate">วันกำหนดส่งงาน</label>
                        <input id="dueDate" type="date" value={job.dueDate} onChange={(e) => setDue(e.target.value)} />
                      </div>
                      {job.dueDate && <p className="saved-line">ส่งงานวันที่ <strong>{thDate(job.dueDate)}</strong></p>}
                    </div>
                  </div>
                )}
                {s.hasDeliveryNote && <DeliveryNote saved={job.deliveryNoteNo} onSave={saveDeliveryNote} />}
                {s.hasShipment && <Shipment step={i} saved={job.shipments?.[i]} onSave={saveShipment} />}
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
