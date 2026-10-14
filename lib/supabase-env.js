// อ่านที่อยู่และกุญแจ Supabase จากค่าตั้งค่าของเว็บ (ห้ามใส่กุญแจในโค้ด)
// รองรับทั้งชื่อที่ตั้งเอง และชื่อที่ Supabase ส่งไปให้ Vercel เองอัตโนมัติ (Vercel Integration)
export function supabaseEnv() {
  const env = process.env;
  const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const keyName = ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"].find((n) => env[n]) || "";
  const key = keyName ? env[keyName].trim() : "";
  return { url, key, keyName };
}
