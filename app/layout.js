import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Quant Terminal | Algorithmic Options Trading",
  description: "Institutional-grade options trading bot dashboard with Alpaca integration",
};

export const viewport = {
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full`} style={{ colorScheme: "dark" }}>
      <body className="min-h-full bg-[#0a0a0f] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
