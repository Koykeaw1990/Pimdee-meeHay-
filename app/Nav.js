"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "บอร์ดงานขาย" },
  { href: "/jobs/new", label: "เพิ่มงานใหม่" },
  { href: "/summary", label: "สรุปรายวัน" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      <div className="nav-in">
        <Link href="/" className="brand">
          <strong>บริษัท พิมพ์ดีมีเฮ จำกัด</strong>
          <span>ระบบติดตามงานขาย</span>
        </Link>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={path === l.href ? "on" : ""}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
