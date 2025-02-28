import { useAuth as useAuthContext } from "@/components/auth/auth-provider";

export function useAuth() {
  const { session, user, isLoading, checkSession } = useAuthContext();
  const isAuthenticated = !!session?.user;

  return {
    isAuthenticated,
    isLoading,
    user,
    session,
    checkSession,
  };
}
