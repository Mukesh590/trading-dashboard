import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Algorithmic Trading Bot | Dashboard",
  description: "Real-time options trading bot dashboard with Alpaca paper trading integration",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full bg-[#050a05] text-emerald-100 scanlines">{children}</body>
    </html>
  );
}
