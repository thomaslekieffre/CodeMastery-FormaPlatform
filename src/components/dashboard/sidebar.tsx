"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  User,
  Code,
  Sun,
  Moon,
  Home,
  GraduationCap,
  UserCircle,
  Code2,
  PlusCircle,
  FileCode,
  BookOpenCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useRouter } from "next/navigation";

const teacherRoutes = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-sky-500",
  },
  {
    name: "Mon profil",
    href: "/dashboard/profile",
    icon: UserCircle,
    color: "text-yellow-500",
  },
  {
    name: "Cours",
    href: "/dashboard/courses",
    icon: BookOpen,
    color: "text-violet-500",
  },
  {
    name: "Création de cours",
    href: "/dashboard/courses/create",
    icon: PlusCircle,
    color: "text-green-500",
  },
  {
    name: "Étudiants",
    href: "/dashboard/students",
    icon: Users,
    color: "text-orange-500",
  },
  {
    name: "Forum",
    href: "/dashboard/forum",
    icon: MessageSquare,
    color: "text-emerald-500",
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const studentRoutes = [
  {
    name: "Accueil",
    href: "/dashboard",
    icon: Home,
    color: "text-sky-500",
  },
  {
    name: "Mon profil",
    href: "/dashboard/profile",
    icon: UserCircle,
    color: "text-yellow-500",
  },
  {
    name: "Mon parcours",
    href: "/dashboard/progress",
    icon: GraduationCap,
    color: "text-violet-500",
  },
  {
    name: "Cours",
    href: "/dashboard/courses",
    icon: BookOpen,
    color: "text-pink-500",
  },
  {
    name: "Forum",
    href: "/dashboard/forum",
    icon: MessageSquare,
    color: "text-emerald-500",
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const adminRoutes = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-sky-500",
  },
  {
    name: "Mon profil",
    href: "/dashboard/profile",
    icon: UserCircle,
    color: "text-yellow-500",
  },
  {
    name: "Cours",
    href: "/dashboard/courses",
    icon: BookOpen,
    color: "text-violet-500",
  },
  {
    name: "Création de cours",
    href: "/dashboard/courses/create",
    icon: PlusCircle,
    color: "text-green-500",
  },

  {
    name: "Forum",
    href: "/dashboard/forum",
    icon: MessageSquare,
    color: "text-emerald-500",
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useAppStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    console.log("Déconnexion");
    router.push("/");
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const routes =
    user?.role === "admin" || user?.user_metadata?.role === "admin"
      ? adminRoutes
      : user?.role === "teacher" || user?.user_metadata?.role === "teacher"
      ? teacherRoutes
      : studentRoutes;

  return (
    <div className="flex h-screen flex-col gap-y-5 border-r border-violet-900/20 bg-background dark:bg-[#0D0016] p-0 w-64">
      <div className="flex h-16 items-center px-6 border-b border-violet-900/20">
        <Link href="/dashboard" className="font-bold text-xl text-foreground">
          <span className="text-foreground dark:text-white">Code</span>
          <span className="text-violet-500">Mastery</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-4">
        {routes.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <div key={item.name} className="w-full">
              <Link href={item.href} passHref legacyBehavior>
                <a
                  className={cn(
                    "group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium text-foreground/80 dark:text-gray-200 hover:bg-violet-500/10 hover:text-violet-400 transition-colors text-left w-full block",
                    isActive && "bg-violet-500/10 text-violet-400"
                  )}
                >
                  <item.icon className={cn("h-6 w-6 shrink-0", item.color)} />
                  {item.name}
                </a>
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="mt-auto px-4 pb-4">
        {mounted && (
          <button
            type="button"
            onClick={handleThemeToggle}
            className="flex w-full items-center gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium text-foreground/80 dark:text-gray-200 hover:bg-violet-500/10 hover:text-violet-400 transition-colors mb-2 text-left cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="h-6 w-6 shrink-0 text-yellow-500" />
            ) : (
              <Moon className="h-6 w-6 shrink-0 text-blue-500" />
            )}
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </button>
        )}
        {!mounted && (
          <div className="flex w-full items-center gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium text-foreground/80 dark:text-gray-200 mb-2">
            <Settings className="h-6 w-6 shrink-0" />
            Paramètres d'affichage
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
        >
          <LogOut className="h-6 w-6 shrink-0" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
