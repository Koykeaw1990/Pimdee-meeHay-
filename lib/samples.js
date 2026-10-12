// งานตัวอย่าง (ข้อมูลสมมติทั้งหมด) ขั้นละ 2 งาน + งานที่เสร็จครบ 2 งาน
// ทุกงานมี sample: true เพื่อแยกจากงานจริง และลบทิ้งทีหลังได้
import { STAGES } from "./data";

const CUSTOMERS = [
  "โรงเรียนตัวอย่างวิทยา", "บริษัท สมมติการค้า จำกัด",
  "เทศบาลตำบลตัวอย่าง", "ร้านกาแฟบ้านสมมติ",
  "สำนักงานทดสอบจังหวัดตัวอย่าง", "คลินิกทันตกรรมสมมติ",
  "สมาคมตัวอย่างไทย", "หจก. สมมติการพิมพ์",
  "โรงพยาบาลตัวอย่าง", "มหาวิทยาลัยสมมติ",
  "องค์การบริหารส่วนตำบลตัวอย่าง", "บริษัท ทดสอบอาหาร จำกัด",
  "วิทยาลัยเทคนิคสมมติ", "ห้างร้านตัวอย่างพาณิชย์",
  "มูลนิธิสมมติเพื่อการศึกษา", "สหกรณ์ออมทรัพย์ตัวอย่าง",
  "ศูนย์การเรียนรู้สมมติ", "บริษัท ตัวอย่างทราเวล จำกัด",
];

const DAY = 86400000;
const isoDay = (t) => new Date(t).toISOString().slice(0, 10);

export function makeSampleJobs() {
  const now = Date.now();
  return CUSTOMERS.map((customer, n) => {
    const doneCount = Math.min(Math.floor(n / 2), STAGES.length); // 0,0,1,1,...,7,7,8,8
    const finishDay = doneCount === 8 ? (n % 2 === 0 ? 0 : 1) : 1; // งานเสร็จครบ: วันนี้ และเมื่อวาน
    const steps = STAGES.map((_, i) => ({
      done: i < doneCount,
      doneAt: i < doneCount ? new Date(now - (finishDay + (doneCount - 1 - i)) * DAY - (n % 5) * 3600000).toISOString() : null,
    }));
    const job = {
      id: "sample" + String(n + 1).padStart(2, "0"),
      sample: true,
      customer,
      docNo: "ตัวอย่าง-" + String(n + 1).padStart(3, "0"),
      file: null,
      steps,
      dueDate: "",
      createdAt: new Date(now - (doneCount + 2) * DAY - n * 60000).toISOString(),
    };
    // ขั้นที่ 3 ขึ้นไปมีวันส่งงาน (งานที่ค้างขั้น 3–4 ตัวแรกให้เลยกำหนด)
    if (doneCount >= 2) job.dueDate = isoDay(now + (doneCount <= 3 && n % 2 === 0 ? -3 : 7) * DAY);
    // ขั้นที่ 5 ขึ้นไปมีเลขที่ใบส่งของ
    if (doneCount >= 4) job.deliveryNoteNo = "DN-ตัวอย่าง-" + String(n + 1).padStart(3, "0");
    // ขั้นที่ 6 ขึ้นไปมีเลขพัสดุ (เลขสมมติ)
    if (doneCount >= 5) {
      job.shipments = {};
      for (let s = 5; s < Math.min(doneCount + 1, 8); s++) {
        job.shipments[s] = { carrier: "thaipost", number: `EX${String(100000000 + n * 10 + s).slice(-9)}TH` };
      }
    }
    return job;
  });
}
