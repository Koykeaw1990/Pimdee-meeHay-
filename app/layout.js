import "./globals.css";
import Nav from "./Nav";

export const metadata = {
  title: "ระบบติดตามงานขาย | บริษัท พิมพ์ดีมีเฮ จำกัด",
  description: "ติดตามงานขาย 8 ขั้น ตั้งแต่ใบเสนอราคาจนรับเงินค้ำประกันคืน",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;600;700&display=swap"
        />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
