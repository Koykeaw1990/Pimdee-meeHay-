"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SHOPS, BOOKS, baht } from "@/lib/orders-data";
import { addOrder } from "@/lib/orders-store";

export default function NewOrder() {
  const router = useRouter();
  const [shopId, setShopId] = useState("");
  const [bookId, setBookId] = useState("");
  const [qty, setQty] = useState("");
  const [errors, setErrors] = useState({});

  const book = BOOKS.find((b) => b.id === bookId);
  const qtyNum = Number(qty);
  const qtyOk = qty !== "" && Number.isInteger(qtyNum) && qtyNum >= 1;
  const total = book && qtyOk ? book.price * qtyNum : 0;

  function save(e) {
    e.preventDefault();
    const err = {};
    if (!shopId) err.shop = "กรุณาเลือกร้านค้า";
    if (!bookId) err.book = "กรุณาเลือกหนังสือ";
    if (!qtyOk) err.qty = "กรุณาใส่จำนวนเป็นตัวเลข ตั้งแต่ 1 เล่มขึ้นไป";
    setErrors(err);
    if (Object.keys(err).length) return;

    const shop = SHOPS.find((s) => s.id === shopId);
    const id = "o" + Date.now();
    addOrder({
      id,
      shopName: shop.name,
      bookTitle: book.title,
      price: book.price,
      qty: qtyNum,
      total,
      createdAt: Date.now(),
    });
    router.push("/orders?new=" + id);
  }

  return (
    <main className="wrap narrow">
      <header className="top">
        <h1>เพิ่มคำสั่งซื้อ</h1>
        <p>เลือกร้าน เลือกหนังสือ ใส่จำนวน ระบบจะคิดยอดเงินให้</p>
      </header>

      <form className="form" onSubmit={save} noValidate>
        {Object.keys(errors).length > 0 && (
          <p className="alert" role="alert">กรอกข้อมูลยังไม่ครบ กรุณาตรวจช่องที่มีข้อความสีแดง</p>
        )}

        <div className="field">
          <label htmlFor="shop">ร้านค้า</label>
          <select id="shop" value={shopId} onChange={(e) => setShopId(e.target.value)} className={errors.shop ? "bad" : ""}>
            <option value="">— เลือกร้านค้า —</option>
            {SHOPS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.shop && <p className="err">{errors.shop}</p>}
        </div>

        <div className="field">
          <label htmlFor="book">หนังสือ</label>
          <select id="book" value={bookId} onChange={(e) => setBookId(e.target.value)} className={errors.book ? "bad" : ""}>
            <option value="">— เลือกหนังสือ —</option>
            {BOOKS.map((b) => (
              <option key={b.id} value={b.id}>{b.title} ({baht(b.price)})</option>
            ))}
          </select>
          {book && <p className="help">ราคาเล่มละ {baht(book.price)}</p>}
          {errors.book && <p className="err">{errors.book}</p>}
        </div>

        <div className="field">
          <label htmlFor="qty">จำนวน (เล่ม)</label>
          <input id="qty" type="number" min="1" step="1" inputMode="numeric" placeholder="เช่น 20"
            value={qty} onChange={(e) => setQty(e.target.value)} className={errors.qty ? "bad" : ""} />
          {errors.qty && <p className="err">{errors.qty}</p>}
        </div>

        <div className="total">
          <span>ยอดเงินรวม</span>
          <strong>{baht(total)}</strong>
          {book && qtyOk && <span className="calc">{baht(book.price)} × {qtyNum.toLocaleString("th-TH")} เล่ม</span>}
        </div>

        <button type="submit" className="btn-main">บันทึกคำสั่งซื้อ</button>
      </form>
    </main>
  );
}
