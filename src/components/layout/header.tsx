"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/store/use-app-store";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const { user } = useAppStore();
  const { signOut } = useAuth();
  const { theme, setTheme } = useAppStore();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="h-16 border-b border-border px-4 flex items-center justify-between bg-card">
      <div className="flex items-center gap-x-4">
        {/* Espace pour d'autres éléments du header */}
      </div>

      <div className="flex items-center gap-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-primary/10 transition"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>

        <div className="flex items-center gap-x-2">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">{user?.email}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </span>
          </div>
          <button
            onClick={signOut}
            className="ml-4 text-sm px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
