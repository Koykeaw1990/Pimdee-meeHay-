// เก็บคำสั่งซื้อไว้ในเบราว์เซอร์ของเครื่องนี้ (ชั่วคราว จนกว่าจะทำขั้นบันทึกถาวร)
const KEY = "orders";

export function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function addOrder(order) {
  const orders = [order, ...loadOrders()];
  localStorage.setItem(KEY, JSON.stringify(orders));
}
