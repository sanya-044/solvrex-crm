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

  if (isLoading || !isAuthenticated) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400"
        aria-busy="true"
      >
        Checking your session...
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <CRMProvider>
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </CRMProvider>
    </div>
  );
}
