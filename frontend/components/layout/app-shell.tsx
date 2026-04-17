"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/navigation/sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
