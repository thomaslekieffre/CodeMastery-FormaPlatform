"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: "student",
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setEmailSent(true);
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Vérifiez votre email
          </h1>
          <p className="text-muted-foreground">
            Un lien de confirmation a été envoyé à <strong>{email}</strong>.
            Cliquez sur le lien dans l'email pour créer votre compte.
          </p>
          <p className="text-sm text-muted-foreground">
            Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez
            votre dossier spam.
          </p>
          <button
            onClick={() => setEmailSent(false)}
            className="text-primary hover:underline"
          >
            Utiliser une autre adresse email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-foreground">
          Inscription à CodeMastery
        </h1>

        {error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="vous@exemple.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Envoi en cours..." : "Créer un compte"}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
