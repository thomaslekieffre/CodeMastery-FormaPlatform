import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/use-app-store";

export const useAuth = () => {
  const router = useRouter();
  const { setUser, logout } = useAppStore();
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role:
            (session.user.user_metadata.role as
              | "admin"
              | "teacher"
              | "student") || "student",
        });
      } else {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, logout]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      logout();
      router.push("/login");
      router.refresh();

      window.location.reload();
    }
    return { error };
  };

  return {
    signOut,
  };
};
