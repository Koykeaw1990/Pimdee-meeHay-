import { NextResponse } from "next/server";
import { supabaseStore } from "@/lib/store-supabase";
import { ONLINE } from "@/lib/jobs-db";

export const dynamic = "force-dynamic";

// ตรวจสุขภาพระบบเก็บข้อมูล (ไม่แสดงกุญแจหรือข้อมูลลับใด ๆ)
export async function GET() {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SECRET_KEY || "";
  const info = {
    mode: ONLINE ? "supabase" : "local",
    urlSet: !!url,
    urlLooksRight: /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url.trim()),
    keySet: !!key,
    keyKind: key.startsWith("sb_secret_") ? "secret" : key.startsWith("sb_publishable_") ? "publishable (ผิดชนิด)" : key.startsWith("eyJ") ? "legacy-jwt" : key ? "unknown" : "none",
    keyHasSpaces: key !== key.trim(),
  };
  if (!ONLINE) return NextResponse.json(info);

  const probe = { id: "health-check", createdAt: new Date(0).toISOString(), health: true };
  for (const [name, run] of [
    ["read", () => supabaseStore.list()],
    ["write", () => supabaseStore.put(probe)],
    ["file", () => supabaseStore.putFile("health-check.txt", Buffer.from("ok"), "text/plain")],
  ]) {
    try {
      await run();
      info[name] = "ok";
    } catch (e) {
      info[name] = String(e.message).replace(key, "***").slice(0, 200);
    }
  }
  // ลบข้อมูลทดสอบออก
  try {
    await fetch(`${url.replace(/\/+$/, "")}/rest/v1/jobs?id=eq.health-check`, {
      method: "DELETE",
      headers: key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key },
    });
    await supabaseStore.deleteFile("health-check.txt");
  } catch {}
  return NextResponse.json(info);
}
