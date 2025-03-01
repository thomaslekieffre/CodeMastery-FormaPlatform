import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const createClient = () => {
  return createServerComponentClient({ cookies });
};

export const createServerClient = () => {
  return createServerComponentClient({ cookies });
};

// Créer un client avec le rôle service_role pour les opérations admin
export const createAdminClient = () => {
  return createServerComponentClient({ cookies });
};
