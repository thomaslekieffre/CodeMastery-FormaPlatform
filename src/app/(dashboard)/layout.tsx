"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAppStore } from "@/store/use-app-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useAppStore();

  useEffect(() => {
    // Applique le thème au chargement
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-card">
        <Sidebar />
      </div>
      <main className="md:pl-72">
        <Header />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
