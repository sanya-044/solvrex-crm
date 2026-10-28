 import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { CRMProvider } from "@/context/CRMContent";

export const metadata: Metadata = {
  title: "Solvrex - Lead Caller CRM",
  description: "Internal CRM & Caller Hub for Solvrex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-slate-100 min-h-screen flex antialiased">
        <CRMProvider>
          <Sidebar />
          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </CRMProvider>
      </body>
    </html>
  );
}