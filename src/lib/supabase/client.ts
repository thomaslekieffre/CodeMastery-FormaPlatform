import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export const createClient = <T = Database>() => {
  try {
    console.log("Début createClient");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Variables d'environnement Supabase manquantes:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      throw new Error("Variables d'environnement Supabase manquantes");
    }

    console.log("Création du client Supabase");
    const client = createBrowserClient(supabaseUrl, supabaseKey);
    console.log("Client créé avec succès");

    return client;
  } catch (error) {
    console.error("Erreur dans createClient:", error);
    throw error;
  }
};
