"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as "signup" | "email";

    if (tokenHash && type) {
      const supabase = createClient();
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type })
        .then(({ error }) => {
          if (error) {
            setError(error.message);
          } else {
            router.push("/dashboard");
          }
        });
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Confirmation de votre compte
        </h1>
        {error ? (
          <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Vérification de votre email en cours...
          </p>
        )}
      </div>
    </div>
  );
}
