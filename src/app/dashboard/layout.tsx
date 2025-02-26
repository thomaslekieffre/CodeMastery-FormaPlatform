"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0D0016] to-[#0D0016] text-white">
      {/* Background grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="flex h-screen overflow-hidden">
        <div className="relative z-50">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="relative h-full w-full">
            {/* Subtle radial gradient for depth */}
            <div className="absolute inset-0 -z-5 bg-[radial-gradient(ellipse_at_top,rgba(109,40,217,0.05),transparent_80%)]" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={cn("relative z-10 h-full")}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
