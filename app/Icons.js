// ไอคอนและภาพประกอบแบบลายเส้น (วาดในโค้ด ไม่ต้องโหลดรูปจากที่อื่น)

const PATHS = {
  quote: (
    <>
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v4h4" />
      <path d="M10 11h6M10 14h6M10 17h4" />
    </>
  ),
  order: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="m9.5 13 2 2 3.5-4" />
    </>
  ),
  print: (
    <>
      <path d="M7 9V3h10v6" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <path d="M7 14h10v7H7z" />
      <circle cx="17.5" cy="12" r=".6" fill="currentColor" />
    </>
  ),
  truck: (
    <>
      <path d="M2 6h12v10H2z" />
      <path d="M14 10h4l3 3v3h-7" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  money: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 9v.01M18 15v.01" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z" />
      <path d="M9 8h6M9 11h6M9 14h4" />
    </>
  ),
  docReturn: (
    <>
      <path d="M8 3h8l4 4v14H8" />
      <path d="M16 3v4h4" />
      <path d="M11 13H3m3-3-3 3 3 3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </>
  ),
  clip: <path d="M20 11 12 19a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7" />,
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </>
  ),
  check: <path d="m5 12 4.5 4.5L19 7" />,
};

export function Icon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

// ภาพประกอบโรงพิมพ์: เครื่องพิมพ์ กระดาษที่พิมพ์ออกมา และกล่องพัสดุ
export function PrintShopArt() {
  return (
    <svg className="art" viewBox="0 0 240 150" aria-hidden="true">
      <ellipse cx="120" cy="138" rx="105" ry="8" fill="#dbe7ff" />
      {/* กระดาษด้านหลัง */}
      <rect x="64" y="10" width="70" height="46" rx="4" fill="#fff" stroke="#1f6feb" strokeWidth="3" />
      <path d="M76 24h46M76 34h46M76 44h30" stroke="#9db8f5" strokeWidth="3" strokeLinecap="round" />
      {/* ตัวเครื่องพิมพ์ */}
      <rect x="40" y="52" width="118" height="54" rx="10" fill="#1f6feb" />
      <rect x="40" y="52" width="118" height="14" rx="7" fill="#4c8dff" />
      <circle cx="140" cy="78" r="5" fill="#ffd43b" />
      <circle cx="140" cy="94" r="4" fill="#51cf66" />
      {/* กระดาษที่ออกมา */}
      <path d="M58 92h82v42H58z" fill="#fff" stroke="#1f6feb" strokeWidth="3" />
      <rect x="68" y="102" width="26" height="22" rx="3" fill="#ff8787" />
      <path d="M102 106h28M102 114h28M102 122h18" stroke="#adb5bd" strokeWidth="3" strokeLinecap="round" />
      {/* กล่องพัสดุ */}
      <rect x="168" y="92" width="50" height="42" rx="4" fill="#ffc078" stroke="#e8590c" strokeWidth="3" />
      <path d="M168 106h50M193 92v14" stroke="#e8590c" strokeWidth="3" />
      <rect x="180" y="62" width="34" height="30" rx="4" fill="#ffd8a8" stroke="#e8590c" strokeWidth="3" />
      <path d="M180 73h34M197 62v11" stroke="#e8590c" strokeWidth="3" />
      {/* ประกาย */}
      <path d="M26 30v12M20 36h12M206 20v10M201 25h10" stroke="#ae3ec9" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
