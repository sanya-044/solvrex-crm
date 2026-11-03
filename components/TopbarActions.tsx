"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/** Renders its children inside the top bar (the #topbar-actions slot in Topbar.tsx). */
export default function TopbarActions({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById("topbar-actions"));
  }, []);

  return slot ? createPortal(children, slot) : null;
}
