 import type { Metadata } from "next";
 import "./globals.css";
 import { AuthProvider } from "@/context/AuthContext";

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
      <body className="bg-zinc-950 text-slate-100 min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}