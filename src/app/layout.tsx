import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AMS | Automated Multi-Channel Sales Platform",
  description:
    "Next-generation sales engagement, automated multi-channel sequences, in-browser WebRTC power dialer, and CRM synchronization.",
};

import { DashboardShell } from "@/components/dashboard-shell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-indigo-500 selection:text-white">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
