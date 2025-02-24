import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseKey);
};

// Export une instance unique pour une utilisation directe
export const supabase = createClient();
