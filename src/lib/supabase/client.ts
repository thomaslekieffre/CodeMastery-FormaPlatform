import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const createClient = () => {
  return createClientComponentClient();
};

// Export une instance unique pour une utilisation directe
export const supabase = createClient();
