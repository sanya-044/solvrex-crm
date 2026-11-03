"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { CRMProvider } from "@/context/CRMContent";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedCRMLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <CRMProvider>
      <div className="flex h-screen bg-zinc-950 text-slate-100 overflow-hidden font-sans antialiased">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-zinc-950/60 relative">
          {children}
        </main>
      </div>
    </CRMProvider>
  );
}
