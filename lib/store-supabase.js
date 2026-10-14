// ที่เก็บข้อมูลแบบออนไลน์: Supabase (ใช้ตอนเปิดเป็นเว็บออนไลน์บน Vercel)
// เรียก Supabase ผ่านเว็บโดยตรง ไม่ต้องติดตั้งโปรแกรมเพิ่ม
// กุญแจอ่านจากค่าตั้งค่า SUPABASE_URL และ SUPABASE_SECRET_KEY เท่านั้น (ห้ามใส่ในโค้ด)

const BUCKET = "quotes";

function config() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SECRET_KEY || "";
  return { url, key };
}

function headers(extra = {}) {
  const { key } = config();
  const h = { apikey: key, ...extra };
  // กุญแจแบบเก่า (service_role) เป็น JWT ต้องส่งใน Authorization ด้วย
  if (key.startsWith("eyJ")) h.Authorization = `Bearer ${key}`;
  return h;
}

// allow404: ใช้ตอนอ่านไฟล์ที่อาจไม่มีอยู่ (ไม่ถือว่าผิดพลาด)
async function call(pathAndQuery, { allow404 = false, ...options } = {}) {
  const res = await fetch(config().url + pathAndQuery, { cache: "no-store", ...options });
  if (!res.ok && !(allow404 && res.status === 404)) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status}: ${text.slice(0, 300)}`);
  }
  return res;
}

const rows = async (res) => (await res.json()).map((r) => r.data);

export const supabaseStore = {
  async list() {
    const res = await call("/rest/v1/jobs?select=data&order=created_at.desc", { headers: headers() });
    return rows(res);
  },
  async get(id) {
    const res = await call(`/rest/v1/jobs?select=data&id=eq.${encodeURIComponent(id)}`, { headers: headers() });
    return (await rows(res))[0] || null;
  },
  async put(job) {
    await call("/rest/v1/jobs", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify({ id: job.id, data: job, created_at: job.createdAt }),
    });
  },
  async addMany(list) {
    const res = await call("/rest/v1/jobs?select=id", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates,return=representation" }),
      body: JSON.stringify(list.map((j) => ({ id: j.id, data: j, created_at: j.createdAt }))),
    });
    return (await res.json()).length;
  },
  async removeSamples() {
    const res = await call("/rest/v1/jobs?data->>sample=eq.true&select=id", {
      method: "DELETE",
      headers: headers({ Prefer: "return=representation" }),
    });
    return (await res.json()).length;
  },
  async putFile(name, buffer, type) {
    await call(`/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: headers({ "Content-Type": type || "application/octet-stream", "x-upsert": "true" }),
      body: buffer,
    });
  },
  async getFile(name) {
    const res = await call(`/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`, { headers: headers(), allow404: true });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  },
  async deleteFile(name) {
    await call(`/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`, { method: "DELETE", headers: headers(), allow404: true });
  },
};

export const supabaseConfigured = () => !!(config().url && config().key);
