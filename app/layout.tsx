import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "사브리나 - 광고 크리에이티브 분석 & 제작",
  description: "Meta, Google, Naver 광고 성과 분석 및 크리에이티브 제작 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full" style={{ background: '#0F0F11' }}>
        <Sidebar />
        <div
          style={{
            marginLeft: 'var(--sidebar-width, 240px)',
            paddingTop: 'var(--header-height, 56px)',
            minHeight: '100vh',
            transition: 'margin-left 0.3s',
          }}
        >
          <Header />
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
