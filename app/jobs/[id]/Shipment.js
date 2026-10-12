"use client";

import { useState } from "react";
import { CARRIERS, carrierOf, looksLikeThaiPost } from "@/lib/carriers";

// ช่องเลขพัสดุ / เลขอ้างอิงการส่ง ของขั้นที่ 5–8
export default function Shipment({ step, saved, onSave }) {
  const [carrier, setCarrier] = useState(saved?.carrier || "thaipost");
  const [number, setNumber] = useState(saved?.number || "");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  const changed = carrier !== (saved?.carrier || "thaipost") || number.trim() !== (saved?.number || "");
  const warn = carrier === "thaipost" && number.trim() && !looksLikeThaiPost(number.trim());
  const savedCarrier = saved && carrierOf(saved.carrier);

  async function save() {
    setSaving(true);
    await onSave({ step, carrier, number: number.trim() });
    setSaving(false);
  }

  async function track() {
    // คัดลอกเลขไว้ด้วย เผื่อเว็บขนส่งไม่ใส่เลขให้อัตโนมัติ
    try {
      await navigator.clipboard.writeText(saved.number);
      setNote("คัดลอกเลขพัสดุแล้ว ถ้าหน้าเว็บขนส่งไม่ขึ้นเลขให้ กด Ctrl + V ในช่องค้นหา");
    } catch {
      setNote(saved.carrier === "jt" ? `พิมพ์เลข ${saved.number} ในช่องค้นหาของเว็บ J&T` : "");
    }
    window.open(savedCarrier.url(saved.number), "_blank", "noopener");
  }

  const id = `ship${step}`;
  return (
    <div className="sub">
      <div className="ship-row">
        <div className="ship-field">
          <label htmlFor={`${id}c`}>ขนส่ง</label>
          <select id={`${id}c`} value={carrier} onChange={(e) => setCarrier(e.target.value)}>
            {CARRIERS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="ship-field grow">
          <label htmlFor={`${id}n`}>เลขพัสดุ / เลขอ้างอิงการส่ง</label>
          <input id={`${id}n`} value={number} onChange={(e) => setNumber(e.target.value)}
            placeholder={carrier === "thaipost" ? "เช่น EF123456789TH" : "ใส่เลขพัสดุ"} />
        </div>
        <button type="button" className="btn-soft" onClick={save} disabled={!changed || saving}>
          {saving ? "กำลังบันทึก…" : number.trim() || !saved ? "บันทึก" : "ลบเลข"}
        </button>
      </div>
      {warn && <p className="warn">เลขนี้ไม่ตรงรูปแบบไปรษณีย์ไทย (ตัวอักษร 2 ตัว + ตัวเลข 9 ตัว + TH) ตรวจอีกครั้ง หรือบันทึกต่อก็ได้</p>}
      {saved && (
        <div className="ship-saved">
          <span>บันทึกไว้: <strong>{saved.number}</strong> · {savedCarrier.name}</span>
          {savedCarrier.url && (
            <button type="button" className="btn-track" onClick={track}>ตรวจสถานะพัสดุ ↗</button>
          )}
        </div>
      )}
      {note && <p className="help">{note}</p>}
    </div>
  );
}
