"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FilePicker from "../../FilePicker";
import { PrintShopArt } from "../../Icons";

const MAX = 10 * 1024 * 1024;

export default function NewJob() {
  const router = useRouter();
  const [customer, setCustomer] = useState("");
  const [docNo, setDocNo] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  // ชื่อลูกค้าที่ดึงจากไฟล์ Excel
  const [sheets, setSheets] = useState([]);
  const [sheetIdx, setSheetIdx] = useState(0);
  const [autoName, setAutoName] = useState("");
  const [readNote, setReadNote] = useState("");

  // เติมชื่อจากชีตที่เลือก (ไม่ทับชื่อที่ผู้ใช้พิมพ์เอง)
  function applySheet(list, i) {
    setSheetIdx(i);
    const name = list[i]?.customer || "";
    if (!name) {
      setReadNote(`ไม่พบชื่อลูกค้าในชีต "${list[i]?.name}" (แถวที่ขึ้นต้นด้วย "เรียน" ในคอลัมน์ B) กรุณาพิมพ์เอง`);
      return;
    }
    setReadNote("");
    if (!customer.trim() || customer === autoName) {
      setCustomer(name);
      setAutoName(name);
      setErrors((e) => ({ ...e, customer: undefined }));
    }
  }

  async function pickFile(f) {
    setFile(f);
    setSheets([]);
    setReadNote("");
    if (!f || !/\.xlsx$/i.test(f.name)) return;
    const body = new FormData();
    body.append("file", f);
    try {
      const res = await fetch("/api/quote-preview", { method: "POST", body });
      if (res.status === 413) return setReadNote("ไฟล์ใหญ่เกินไป เว็บออนไลน์รับไฟล์ไม่เกิน 4 MB");
      const data = await res.json();
      if (!res.ok) return setReadNote(data.error);
      setSheets(data.sheets);
      applySheet(data.sheets, 0);
    } catch {
      setReadNote("อ่านไฟล์ไม่สำเร็จ กรุณาพิมพ์ชื่อลูกค้าเอง");
    }
  }

  const fromFile = sheets[sheetIdx]?.customer && customer === sheets[sheetIdx].customer;

  async function save(e) {
    e.preventDefault();
    const err = {};
    if (!customer.trim()) err.customer = "กรุณาใส่ชื่อลูกค้า";
    if (!docNo.trim()) err.docNo = "กรุณาใส่เลขที่เอกสาร";
    if (file && file.size > MAX) err.file = "ไฟล์ใหญ่เกิน 10 MB";
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    const body = new FormData();
    body.append("customer", customer.trim());
    body.append("docNo", docNo.trim());
    if (file) body.append("file", file);
    try {
      const res = await fetch("/api/jobs", { method: "POST", body });
      if (res.status === 413) {
        setErrors({ file: "ไฟล์ใหญ่เกินไป เว็บออนไลน์รับไฟล์ไม่เกิน 4 MB" });
        setSaving(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || { form: "บันทึกไม่สำเร็จ กรุณาลองใหม่" });
        setSaving(false);
        return;
      }
      router.push(`/jobs/${data.id}?new=1`);
    } catch {
      setErrors({ form: "เชื่อมต่อระบบไม่ได้ ตรวจว่าหน้าต่างสีดำ (npm run dev) ยังเปิดอยู่" });
      setSaving(false);
    }
  }

  return (
    <main className="wrap mid">
      <header className="hero">
        <div className="hero-text">
          <span className="eyebrow">งานขายใหม่</span>
          <h1>เพิ่มงานใหม่</h1>
          <p className="muted">กรอก 2 ส่วนด้านล่าง แล้วกดบันทึก งานจะไปอยู่ขั้นที่ 1 บนบอร์ด</p>
        </div>
        <PrintShopArt />
      </header>

      <form onSubmit={save} noValidate className="stack">
        {Object.keys(errors).length > 0 && (
          <p className="alert" role="alert">{errors.form || "กรอกข้อมูลยังไม่ครบ กรุณาตรวจช่องที่มีข้อความสีแดง"}</p>
        )}

        <section className="panel">
          <h2 className="panel-title"><span className="pi pi-blue">1</span>ข้อมูลลูกค้า</h2>
          <div className="grid2">
            <div className="field">
              <label htmlFor="customer">ชื่อลูกค้า <span className="req">*</span></label>
              <input id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)}
                placeholder="เช่น บริษัท ตัวอย่าง จำกัด" className={errors.customer ? "bad" : fromFile ? "filled" : ""} />
              {fromFile && (
                <p className="from-file">✓ ดึงจากใบเสนอราคา ชีต “{sheets[sheetIdx].name}” ช่อง {sheets[sheetIdx].cell}</p>
              )}
              {errors.customer && <p className="err">{errors.customer}</p>}
            </div>
            <div className="field">
              <label htmlFor="docNo">เลขที่เอกสาร <span className="req">*</span></label>
              <input id="docNo" value={docNo} onChange={(e) => setDocNo(e.target.value)}
                placeholder="เช่น QT-2569-001" className={errors.docNo ? "bad" : ""} />
              {errors.docNo && <p className="err">{errors.docNo}</p>}
            </div>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title"><span className="pi pi-pink">2</span>ไฟล์ใบเสนอราคา <span className="opt">ไม่บังคับ</span></h2>
          <div className="field">
            <label htmlFor="file">แนบไฟล์</label>
            <FilePicker id="file" label="เลือกไฟล์" fileName={file?.name} onPick={pickFile} bad={errors.file} />
            <p className="help">รับไฟล์ PDF, รูป (JPG, PNG), Word หรือ Excel ไม่เกิน 10 MB (บนเว็บออนไลน์ไม่เกิน 4 MB) · ถ้าเป็น Excel (.xlsx) ระบบจะเติมชื่อลูกค้าให้</p>
            {errors.file && <p className="err">{errors.file}</p>}
            {readNote && <p className="warn">{readNote}</p>}
          </div>
          {sheets.length > 1 && (
            <div className="field">
              <label htmlFor="sheet">ใช้ชื่อลูกค้าจากชีต</label>
              <select id="sheet" value={sheetIdx} onChange={(e) => applySheet(sheets, +e.target.value)}>
                {sheets.map((s, i) => (
                  <option key={i} value={i}>
                    {s.name}{s.customer ? ` — ${s.customer}` : " — (ไม่พบชื่อลูกค้า)"}
                  </option>
                ))}
              </select>
              <p className="help">ไฟล์นี้มี {sheets.length} ชีต ระบบใช้ชีตแรกให้ก่อน เปลี่ยนได้ที่นี่</p>
            </div>
          )}
        </section>

        <div className="actions">
          <button type="submit" className="btn-main big" disabled={saving}>
            {saving ? "กำลังบันทึก…" : "บันทึกงาน"}
          </button>
          <span className="help"><span className="req">*</span> ต้องกรอก</span>
        </div>
      </form>
    </main>
  );
}
