// ที่เก็บข้อมูลแบบในเครื่อง: โฟลเดอร์ data ของโปรเจกต์ (ใช้ตอนเปิดเว็บบนเครื่องตัวเอง)
import { promises as fs } from "fs";
import path from "path";

// JOBS_DATA_DIR ใช้ตอนทดสอบ เพื่อแยกข้อมูลทดสอบออกจากข้อมูลจริง
const DATA_DIR = process.env.JOBS_DATA_DIR || path.join(process.cwd(), "data");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

async function readAll() {
  try {
    return JSON.parse(await fs.readFile(JOBS_FILE, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

async function writeAll(jobs) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = JOBS_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(jobs, null, 2), "utf8");
  await fs.rename(tmp, JOBS_FILE);
}

export const localStore = {
  list: readAll,
  async get(id) {
    return (await readAll()).find((j) => j.id === id) || null;
  },
  // บันทึกงาน (มีอยู่แล้ว = แทนที่, ยังไม่มี = เพิ่มไว้บนสุด)
  async put(job) {
    const jobs = await readAll();
    const i = jobs.findIndex((j) => j.id === job.id);
    if (i >= 0) jobs[i] = job;
    else jobs.unshift(job);
    await writeAll(jobs);
  },
  async addMany(list) {
    const jobs = await readAll();
    const have = new Set(jobs.map((j) => j.id));
    const fresh = list.filter((j) => !have.has(j.id));
    await writeAll([...jobs, ...fresh]);
    return fresh.length;
  },
  async removeSamples() {
    const jobs = await readAll();
    const keep = jobs.filter((j) => !j.sample);
    await writeAll(keep);
    return jobs.length - keep.length;
  },
  async putFile(name, buffer) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, path.basename(name)), buffer);
  },
  async getFile(name) {
    try {
      return await fs.readFile(path.join(UPLOAD_DIR, path.basename(name)));
    } catch {
      return null;
    }
  },
  async deleteFile(name) {
    await fs.rm(path.join(UPLOAD_DIR, path.basename(name)), { force: true });
  },
};
