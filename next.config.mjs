// NEXT_DIST_DIR ใช้ตอนทดสอบ เพื่อเปิดเว็บทดสอบอีกชุดได้โดยไม่ชนกับเว็บที่ใช้งานจริง
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
