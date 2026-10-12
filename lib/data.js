// ขั้นตอนการขาย 8 ขั้น (icon = ชื่อไอคอนใน app/Icons.js)
export const STAGES = [
  { name: "สร้างใบเสนอราคา", icon: "quote" },
  { name: "สั่งงาน", icon: "order" },
  { name: "ส่งผลิต", icon: "print", hasDueDate: true },
  { name: "เช็คสถานะการส่งงาน", icon: "truck" },
  { name: "เช็คสถานะการชำระเงิน", icon: "money", hasDeliveryNote: true },
  { name: "เช็คสถานะการส่งใบเสร็จรับเงิน", icon: "receipt", hasShipment: true },
  { name: "เช็คสถานะการส่งเอกสารถอนค้ำประกัน", icon: "docReturn", hasShipment: true },
  { name: "เช็คสถานะการรับเงินค้ำประกันคืน", icon: "shield", hasShipment: true },
];

// ขั้นปัจจุบันของงาน = ขั้นแรกที่ยังไม่เสร็จ (ถ้าเสร็จครบทุกขั้นจะได้ STAGES.length)
export function currentStage(job) {
  const i = job.steps.findIndex((s) => !s.done);
  return i === -1 ? STAGES.length : i;
}

export function thDate(value) {
  if (!value) return "";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(...value.split("-").map((n, i) => (i === 1 ? n - 1 : +n)))
    : new Date(value);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}
