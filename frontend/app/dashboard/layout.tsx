"use client";

import { AppShell } from "@/components/layout/app-shell";
import { getAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    }
  }, [router]);

  return <AppShell>{children}</AppShell>;
}
