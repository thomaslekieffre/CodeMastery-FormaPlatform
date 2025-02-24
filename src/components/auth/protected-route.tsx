"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkSession } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const init = async () => {
      if (!isLoading) {
        // Re-vérifier la session
        await checkSession();

        console.log("Protected Route State:", {
          isLoading,
          isAuthenticated,
          pathname,
        });

        if (!isAuthenticated) {
          console.log("Redirecting to login from:", pathname);
          sessionStorage.setItem("returnUrl", pathname);
          router.replace("/login");
        } else {
          console.log("User is authenticated, rendering content");
        }
      }
    };

    init();
  }, [isLoading, isAuthenticated, router, pathname, checkSession]);

  // Afficher le loader pendant la vérification
  if (isLoading) {
    console.log("Loading state...");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Ne rien rendre si non authentifié
  if (!isAuthenticated) {
    console.log("Not authenticated, rendering null");
    return null;
  }

  console.log("Rendering protected content");
  return <>{children}</>;
}
