-- ตั้งค่าฐานข้อมูลสำหรับเว็บออนไลน์ (รันครั้งเดียวใน Supabase > SQL Editor)

-- 1) ตารางเก็บงานขาย (เก็บข้อมูลทั้งงานไว้ในช่อง data)
create table if not exists public.jobs (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- 2) ปิดไม่ให้ใครอ่าน/เขียนตรง ๆ จากอินเทอร์เน็ต
--    มีแต่เว็บของเรา (ที่ถือกุญแจลับ) เท่านั้นที่อ่านและเขียนได้
alter table public.jobs enable row level security;

-- 3) ที่เก็บไฟล์ใบเสนอราคา (แบบส่วนตัว ไม่เปิดสาธารณะ)
insert into storage.buckets (id, name, public)
values ('quotes', 'quotes', false)
on conflict (id) do nothing;
