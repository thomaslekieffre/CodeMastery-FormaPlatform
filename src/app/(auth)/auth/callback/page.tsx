"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
        router.push("/dashboard");
      } catch (error) {
        console.error("Erreur lors de l'authentification:", error);
        router.push("/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Authentification en cours...
        </h1>
        <p className="text-muted-foreground">Vous allez être redirigé...</p>
      </div>
    </div>
  );
}
