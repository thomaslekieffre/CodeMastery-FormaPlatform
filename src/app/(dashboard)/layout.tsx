"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAppStore } from "@/store/use-app-store";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { theme, user, setUser } = useAppStore();

  useEffect(() => {
    // Applique le thème au chargement
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication in dashboard layout");
      const supabase = createClient();

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      console.log("Auth check result:", { session, error });

      if (error || !session) {
        console.log("No session found, redirecting to login");
        router.push("/login");
        return;
      }

      if (!user && session.user) {
        console.log("Setting user in store:", session.user);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata.role || "student",
        });
      }
    };

    checkAuth();
  }, [user, setUser, router]);

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
