import type { ReactNode } from "react";
import ProtectedCRMLayout from "@/components/ProtectedCRMLayout";

export default function CRMLayout({ children }: { children: ReactNode }) {
  return <ProtectedCRMLayout>{children}</ProtectedCRMLayout>;
}
