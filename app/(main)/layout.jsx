import React from "react";
import { MainShell } from "@/components/main-shell";

export const dynamic = "force-dynamic";

export default function MainLayout({ children }) {
  return <MainShell>{children}</MainShell>;
}
