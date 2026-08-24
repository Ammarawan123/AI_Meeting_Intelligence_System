import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meeting Intel",
  description: "AI Meeting Intelligence workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-100 text-slate-900">
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
          Mock mode active — no live backend connected
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
