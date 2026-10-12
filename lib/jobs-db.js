// เก็บข้อมูลงานขายในโฟลเดอร์ data ของโปรเจกต์ (ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น)
import { promises as fs } from "fs";
import path from "path";
import { STAGES } from "./data";

// JOBS_DATA_DIR ใช้ตอนทดสอบ เพื่อแยกข้อมูลทดสอบออกจากข้อมูลจริง
const DATA_DIR = process.env.JOBS_DATA_DIR || path.join(process.cwd(), "data");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
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

export async function readJobs() {
  try {
    return JSON.parse(await fs.readFile(JOBS_FILE, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

async function writeJobs(jobs) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = JOBS_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(jobs, null, 2), "utf8");
  await fs.rename(tmp, JOBS_FILE);
}

export async function getJob(id) {
  return (await readJobs()).find((j) => j.id === id) || null;
}

// ตรวจไฟล์ แล้วคืนข้อความเตือน (ภาษาไทย) ถ้าไม่ผ่าน
export function checkFile(file) {
  const ext = path.extname(file.name).toLowerCase();
  if (!FILE_TYPES[ext]) return "รับเฉพาะไฟล์ PDF, รูป (JPG, PNG), Word หรือ Excel";
  if (file.size > MAX_FILE_SIZE) return "ไฟล์ใหญ่เกิน 10 MB";
  return "";
}

async function saveFile(id, file) {
  const ext = path.extname(file.name).toLowerCase();
  const stored = `${id}-${Date.now()}${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, stored), Buffer.from(await file.arrayBuffer()));
  return { stored, original: file.name, type: FILE_TYPES[ext], size: file.size };
}

export async function createJob({ customer, docNo, file }) {
  const id = "job" + Date.now().toString(36);
  const job = {
    id,
    customer,
    docNo,
    file: file ? await saveFile(id, file) : null,
    steps: STAGES.map(() => ({ done: false, doneAt: null })),
    dueDate: "",
    createdAt: new Date().toISOString(),
  };
  await writeJobs([job, ...(await readJobs())]);
  return job;
}

export async function updateJob(id, change) {
  const jobs = await readJobs();
  const job = jobs.find((j) => j.id === id);
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
    if (old) await fs.rm(path.join(UPLOAD_DIR, old.stored), { force: true });
  }
  await writeJobs(jobs);
  return job;
}
