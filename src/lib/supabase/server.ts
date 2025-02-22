import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        set(
          name: string,
          value: string,
          options: Omit<ResponseCookie, "name" | "value">
        ) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Ignorer les erreurs de cookies en lecture seule
          }
        },
        remove(name: string, options?: Omit<ResponseCookie, "name" | "value">) {
          try {
            cookieStore.delete(name);
          } catch {
            // Ignorer les erreurs de cookies en lecture seule
          }
        },
      },
    }
  );
};

// Créer un client avec le rôle service_role pour les opérations admin
export const createAdminClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        set(
          name: string,
          value: string,
          options: Omit<ResponseCookie, "name" | "value">
        ) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Ignorer les erreurs de cookies en lecture seule
          }
        },
        remove(name: string, options?: Omit<ResponseCookie, "name" | "value">) {
          try {
            cookieStore.delete(name);
          } catch {
            // Ignorer les erreurs de cookies en lecture seule
          }
        },
      },
    }
  );
};
