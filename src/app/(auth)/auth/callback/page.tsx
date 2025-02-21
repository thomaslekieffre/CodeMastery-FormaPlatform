"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      try {
        // Essaie d'obtenir la session à partir de l'URL
        const { error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        // Redirige vers le dashboard en cas de succès
        router.push("/dashboard");
      } catch (error) {
        // En cas d'erreur, redirige vers la page de login
        router.push("/login");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Connexion en cours...
        </h1>
        <p className="text-muted-foreground">
          Veuillez patienter pendant que nous finalisons votre connexion.
        </p>
      </div>
    </div>
  );
}
