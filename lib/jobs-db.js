// จัดการข้อมูลงานขาย (ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น)
// บนเครื่อง: เก็บในโฟลเดอร์ data · บนเว็บออนไลน์ (มีค่าตั้งค่า Supabase): เก็บใน Supabase
import path from "path";
import { STAGES } from "./data";
import { localStore } from "./store-local";
import { supabaseStore, supabaseConfigured } from "./store-supabase";
import { explainError } from "./explain-error";

export const ONLINE = supabaseConfigured();
const store = ONLINE ? supabaseStore : localStore;

// เว็บออนไลน์ (Vercel) รับไฟล์ได้ไม่เกินประมาณ 4.5 MB ต่อครั้ง
export const MAX_FILE_SIZE = (ONLINE ? 4 : 10) * 1024 * 1024;
const MAX_TEXT = ONLINE ? "4 MB" : "10 MB";
export const FILE_TYPES = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const readJobs = () => store.list();
export const getJob = (id) => store.get(id);
export const readFile = (name) => store.getFile(name);

// ตรวจไฟล์ แล้วคืนข้อความเตือน (ภาษาไทย) ถ้าไม่ผ่าน
export function checkFile(file) {
  const ext = path.extname(file.name).toLowerCase();
  if (!FILE_TYPES[ext]) return "รับเฉพาะไฟล์ PDF, รูป (JPG, PNG), Word หรือ Excel";
  if (file.size > MAX_FILE_SIZE) return `ไฟล์ใหญ่เกิน ${MAX_TEXT}`;
  return "";
}

async function saveFile(id, file) {
  const ext = path.extname(file.name).toLowerCase();
  const stored = `${id}-${Date.now()}${ext}`;
  await store.putFile(stored, Buffer.from(await file.arrayBuffer()), FILE_TYPES[ext]);
  return { stored, original: file.name, type: FILE_TYPES[ext], size: file.size };
}

// ถ้าเก็บไฟล์ไม่สำเร็จ ยังบันทึกงานไว้ และคืน fileError บอกสาเหตุ (แนบไฟล์ใหม่ได้ที่หน้างาน)
export async function createJob({ customer, docNo, file }) {
  const id = "job" + Date.now().toString(36);
  let saved = null;
  let fileError = "";
  if (file) {
    try {
      saved = await saveFile(id, file);
    } catch (e) {
      console.error("save file failed:", e.message);
      fileError = explainError(e);
    }
  }
  const job = {
    id,
    customer,
    docNo,
    file: saved,
    steps: STAGES.map(() => ({ done: false, doneAt: null })),
    dueDate: "",
    createdAt: new Date().toISOString(),
  };
  await store.put(job);
  return { job, fileError };
}

// เพิ่มงานตัวอย่าง (ข้ามถ้ามีงานรหัสเดียวกันอยู่แล้ว)
export const addSampleJobs = (samples) => store.addMany(samples);

// ลบเฉพาะงานตัวอย่าง (sample: true) งานจริงไม่ถูกแตะ
export const removeSampleJobs = () => store.removeSamples();

export async function updateJob(id, change) {
  const job = await store.get(id);
  if (!job) return null;
  if (Number.isInteger(change.step) && change.step >= 0 && change.step < STAGES.length) {
    job.steps[change.step] = { done: !!change.done, doneAt: change.done ? new Date().toISOString() : null };
  }
  if (typeof change.dueDate === "string") job.dueDate = change.dueDate;
  if (typeof change.deliveryNoteNo === "string") job.deliveryNoteNo = change.deliveryNoteNo.trim().slice(0, 60);
  const sh = change.shipment;
  if (sh && Number.isInteger(sh.step) && STAGES[sh.step]?.hasShipment) {
    job.shipments = job.shipments || {};
    const number = String(sh.number || "").trim().slice(0, 60);
    if (number) job.shipments[sh.step] = { carrier: String(sh.carrier || "thaipost"), number };
    else delete job.shipments[sh.step];
  }
  if (change.file) {
    const old = job.file;
    job.file = await saveFile(id, change.file);
    if (old) await store.deleteFile(old.stored);
  }
  await store.put(job);
  return job;
}
