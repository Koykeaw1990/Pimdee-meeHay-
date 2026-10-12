// บริษัทขนส่ง และลิงก์หน้าตรวจสถานะพัสดุ
export const CARRIERS = [
  { id: "thaipost", name: "ไปรษณีย์ไทย", url: (n) => `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(n)}` },
  { id: "kex", name: "Kerry (KEX)", url: (n) => `https://th.kex-express.com/th/track/?track=${encodeURIComponent(n)}` },
  { id: "flash", name: "Flash Express", url: (n) => `https://www.flashexpress.co.th/fle/tracking?se=${encodeURIComponent(n)}` },
  { id: "jt", name: "J&T Express", url: () => "https://www.jtexpress.co.th/service/track" },
  { id: "other", name: "อื่น ๆ (ไม่มีลิงก์)", url: null },
];

export const carrierOf = (id) => CARRIERS.find((c) => c.id === id) || CARRIERS[0];

// เลขพัสดุไปรษณีย์ไทย: ตัวอักษร 2 ตัว + ตัวเลข 9 ตัว + TH
export const looksLikeThaiPost = (n) => /^[A-Z]{2}\d{9}TH$/i.test(n);
