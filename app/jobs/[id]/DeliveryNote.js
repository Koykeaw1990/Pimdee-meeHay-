"use client";

import { useState } from "react";

// ช่องเลขที่ใบส่งของ (ขั้นที่ 5)
export default function DeliveryNote({ saved, onSave }) {
  const [value, setValue] = useState(saved || "");
  const [saving, setSaving] = useState(false);
  const changed = value.trim() !== (saved || "");

  async function save() {
    setSaving(true);
    await onSave(value.trim());
    setSaving(false);
  }

  return (
    <div className="sub">
      <div className="ship-row">
        <div className="ship-field grow">
          <label htmlFor="deliveryNoteNo">เลขที่ใบส่งของ</label>
          <input id="deliveryNoteNo" value={value} onChange={(e) => setValue(e.target.value)} placeholder="เช่น DN-2569-001" />
        </div>
        <button type="button" className="btn-soft" onClick={save} disabled={!changed || saving}>
          {saving ? "กำลังบันทึก…" : value.trim() || !saved ? "บันทึก" : "ลบเลข"}
        </button>
      </div>
      {saved && <p className="saved-line">บันทึกไว้: <strong>{saved}</strong></p>}
    </div>
  );
}
