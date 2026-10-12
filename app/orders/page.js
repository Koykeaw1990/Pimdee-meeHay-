"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { baht } from "@/lib/orders-data";
import { loadOrders } from "@/lib/orders-store";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [newId, setNewId] = useState("");

  useEffect(() => {
    setOrders(loadOrders());
    setNewId(new URLSearchParams(window.location.search).get("new") || "");
  }, []);

  const sum = (orders || []).reduce((s, o) => s + o.total, 0);

  return (
    <main className="wrap">
      <header className="top">
        <h1>รายการคำสั่งซื้อ</h1>
        <p>คำสั่งซื้อล่าสุดอยู่บนสุด</p>
      </header>

      {newId && orders && orders.some((o) => o.id === newId) && (
        <p className="ok" role="status">บันทึกคำสั่งซื้อเรียบร้อยแล้ว</p>
      )}

      {orders === null ? (
        <p className="muted">กำลังโหลด…</p>
      ) : orders.length === 0 ? (
        <div className="empty-box">
          <p>ยังไม่มีคำสั่งซื้อ</p>
          <Link href="/orders/new" className="btn-main">+ เพิ่มคำสั่งซื้อแรก</Link>
        </div>
      ) : (
        <>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>ร้านค้า</th>
                  <th>หนังสือ</th>
                  <th className="r">ราคา/เล่ม</th>
                  <th className="r">จำนวน</th>
                  <th className="r">ยอดเงิน</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className={o.id === newId ? "new" : ""}>
                    <td>{new Date(o.createdAt).toLocaleString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                    <td>{o.shopName}</td>
                    <td>{o.bookTitle}</td>
                    <td className="r">{baht(o.price)}</td>
                    <td className="r">{o.qty.toLocaleString("th-TH")}</td>
                    <td className="r"><strong>{baht(o.total)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="sum">รวม {orders.length} คำสั่งซื้อ · ยอดเงินรวม <strong>{baht(sum)}</strong></p>
        </>
      )}
    </main>
  );
}
