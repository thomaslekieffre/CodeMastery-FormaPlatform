import { createClient } from "@/lib/supabase/server";

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  return user;
}

export async function isUserAdmin() {
  const user = await getAuthUser();
  if (!user) return false;

  return user.role === "admin" || user.user_metadata?.role === "admin";
}
