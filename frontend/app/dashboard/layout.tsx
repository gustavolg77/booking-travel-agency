"use client";

import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-slate-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}