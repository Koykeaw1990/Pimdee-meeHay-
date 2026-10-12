"use client";

import { useRef } from "react";

export const ACCEPT = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx";

// ปุ่มเลือกไฟล์ภาษาไทย (แทนปุ่มภาษาอังกฤษของเบราว์เซอร์)
export default function FilePicker({ id, label, fileName, onPick, bad }) {
  const input = useRef(null);
  return (
    <div className={bad ? "picker bad" : "picker"}>
      <input ref={input} id={id} type="file" accept={ACCEPT} className="sr-only"
        onChange={(e) => { onPick(e.target.files[0] || null); e.target.value = ""; }} />
      <button type="button" className="btn-soft" onClick={() => input.current.click()}>{label}</button>
      <span className={fileName ? "" : "muted"}>{fileName || "ยังไม่ได้เลือกไฟล์"}</span>
    </div>
  );
}
