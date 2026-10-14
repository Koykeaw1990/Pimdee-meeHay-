// แปลงข้อผิดพลาดตอนบันทึก เป็นข้อความภาษาไทยที่บอกว่าเสียตรงไหน (ไม่แสดงกุญแจลับ)
import { supabaseEnv } from "./supabase-env";

export function explainError(e) {
  const m = String(e?.message || e || "");
  // อยู่บนเว็บออนไลน์ (Vercel) แต่ยังไม่ได้ใส่กุญแจ Supabase จึงเก็บข้อมูลไม่ได้
  if (process.env.VERCEL && !(supabaseEnv().url && supabaseEnv().key)) {
    return "เว็บออนไลน์ยังไม่ได้ใส่กุญแจ Supabase (SUPABASE_URL และ SUPABASE_SECRET_KEY) หรือเชื่อม Supabase กับ Vercel ผ่าน Integrations";
  }
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|Invalid URL/i.test(m)) return "เชื่อมต่อ Supabase ไม่ได้ ตรวจค่า SUPABASE_URL บน Vercel";
  if (/Supabase 40[13]\b|Invalid API key|invalid.*jwt|Unauthorized|signature/i.test(m)) return "กุญแจ Supabase ไม่ถูกต้อง ตรวจค่า SUPABASE_SECRET_KEY บน Vercel (ต้องเป็นกุญแจลับ sb_secret_)";
  if (/Bucket not found/i.test(m)) return "ยังไม่มีที่เก็บไฟล์ชื่อ quotes ใน Supabase (ยังไม่ได้รัน supabase/setup.sql)";
  if (/PGRST205|relation .*jobs.* does not exist|Could not find the table/i.test(m)) return "ยังไม่มีตาราง jobs ใน Supabase (ยังไม่ได้รัน supabase/setup.sql)";
  if (/mime|content type|invalid_mime_type/i.test(m)) return "ที่เก็บไฟล์ใน Supabase ไม่รับไฟล์ชนิดนี้";
  if (/Payload too large|maximum allowed size|413/i.test(m)) return "ไฟล์ใหญ่เกินที่ระบบรับได้";
  if (/row-level security|violates/i.test(m)) return "Supabase ไม่อนุญาตให้เขียน ตรวจว่าใช้กุญแจลับ (sb_secret_) ไม่ใช่กุญแจสาธารณะ";
  if (/EACCES|EPERM|EROFS|ENOENT|read-only/i.test(m)) return "เขียนไฟล์ลงโฟลเดอร์ data ไม่ได้";
  const code = (m.match(/Supabase (\d{3})/) || [])[1];
  return code ? `Supabase ตอบกลับรหัส ${code}` : "ไม่ทราบสาเหตุ";
}
