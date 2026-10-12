// อ่านชื่อลูกค้าจากใบเสนอราคา Excel (.xlsx) โดยไม่ต้องติดตั้งโปรแกรมเพิ่ม
// ไฟล์ .xlsx คือไฟล์ zip ที่ข้างในเป็นไฟล์ XML จึงแกะ zip เองด้วย zlib ที่มากับ Node
import zlib from "zlib";
import path from "path";

const MAX_ENTRY = 30 * 1024 * 1024; // กันไฟล์ที่ขยายตัวใหญ่ผิดปกติ

function unzip(buf, wanted) {
  // หา End of Central Directory จากท้ายไฟล์
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("not a zip");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out = {};
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("bad zip");
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen).replace(/\\/g, "/");
    p += 46 + nameLen + extraLen + commentLen;
    if (!wanted(name)) continue;
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const data = buf.subarray(start, start + compSize);
    if (method === 0) out[name] = data.toString("utf8");
    else if (method === 8) out[name] = zlib.inflateRawSync(data, { maxOutputLength: MAX_ENTRY }).toString("utf8");
  }
  return out;
}

const unxml = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&");
const texts = (xml) => [...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => unxml(m[1])).join("");

// คำนำหน้าที่ตัดออก เหลือแต่ชื่อหน่วยงาน/ลูกค้า
const TITLES = ["ผู้อำนวยการ", "คณะกรรมการพิจารณาราคา", "คณะกรรมการตรวจรับ", "คณะกรรมการ", "ผู้จัดการ", "เจ้าหน้าที่พัสดุ", "หัวหน้าเจ้าหน้าที่"];

export function cleanCustomer(raw) {
  let s = raw.replace(/\s+/g, " ").trim().replace(/^เรียน\s*/, "");
  for (let again = true; again; ) {
    again = false;
    for (const t of TITLES) {
      if (s.startsWith(t)) { s = s.slice(t.length).trim(); again = true; }
    }
  }
  return s;
}

// คืนรายการชีต: { name, cell, customer } (customer = "" ถ้าไม่พบแถว "เรียน" ในคอลัมน์ B)
export function readQuoteCustomers(buffer) {
  const files = unzip(buffer, (n) =>
    n === "xl/workbook.xml" || n === "xl/_rels/workbook.xml.rels" || n === "xl/sharedStrings.xml" || /^xl\/worksheets\/[^/]+\.xml$/.test(n)
  );
  const shared = files["xl/sharedStrings.xml"]
    ? [...files["xl/sharedStrings.xml"].matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => texts(m[1]))
    : [];
  const rels = Object.fromEntries(
    [...(files["xl/_rels/workbook.xml.rels"] || "").matchAll(/<Relationship\b([^>]*)\/?>/g)].map((m) => [
      (m[1].match(/Id="([^"]+)"/) || [])[1],
      (m[1].match(/Target="([^"]+)"/) || [])[1],
    ])
  );

  const sheets = [...(files["xl/workbook.xml"] || "").matchAll(/<sheet\b([^>]*)\/?>/g)].map((m) => {
    const name = unxml((m[1].match(/name="([^"]*)"/) || [])[1] || "").trim();
    const rid = (m[1].match(/r:id="([^"]+)"/) || [])[1];
    const target = rels[rid] || "";
    const file = target.startsWith("/") ? target.slice(1) : path.posix.join("xl", target);
    return { name, xml: files[file] || "" };
  });

  return sheets.map(({ name, xml }) => {
    for (const c of xml.matchAll(/<c r="B(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const [, row, attrs, inner = ""] = c;
      const v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
      let text = "";
      if (/t="s"/.test(attrs) && v != null) text = shared[+v] || "";
      else if (/t="inlineStr"/.test(attrs)) text = texts(inner);
      else if (/t="str"/.test(attrs) && v != null) text = unxml(v);
      if (text.trim().startsWith("เรียน")) {
        return { name, cell: "B" + row, customer: cleanCustomer(text) };
      }
    }
    return { name, cell: "", customer: "" };
  });
}
