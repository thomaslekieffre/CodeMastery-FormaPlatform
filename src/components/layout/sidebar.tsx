"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Code2,
  GraduationCap,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  UserCircle,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";

const teacherRoutes = [
  {
    label: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Mon profil",
    icon: UserCircle,
    href: "/dashboard/profile",
    color: "text-yellow-500",
  },
  {
    label: "Cours",
    icon: BookOpen,
    href: "/dashboard/courses",
    color: "text-violet-500",
  },
  {
    label: "Étudiants",
    icon: Users,
    href: "/dashboard/students",
    color: "text-orange-500",
  },
  {
    label: "Forum",
    icon: MessageSquare,
    href: "/dashboard/forum",
    color: "text-emerald-500",
  },
  {
    label: "Paramètres",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

const studentRoutes = [
  {
    label: "Accueil",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Mon profil",
    icon: UserCircle,
    href: "/dashboard/profile",
    color: "text-yellow-500",
  },
  {
    label: "Mon parcours",
    icon: GraduationCap,
    href: "/dashboard/progress",
    color: "text-violet-500",
  },
  {
    label: "Cours",
    icon: BookOpen,
    href: "/dashboard/courses",
    color: "text-pink-500",
  },
  {
    label: "Forum",
    icon: MessageSquare,
    href: "/dashboard/forum",
    color: "text-emerald-500",
  },
  {
    label: "Paramètres",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

const adminRoutes = [
  {
    label: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Mon profil",
    icon: UserCircle,
    href: "/dashboard/profile",
    color: "text-yellow-500",
  },
  {
    label: "Cours",
    icon: BookOpen,
    href: "/dashboard/courses",
    color: "text-pink-500",
  },
  {
    label: "Forum",
    icon: MessageSquare,
    href: "/dashboard/forum",
    color: "text-emerald-500",
  },
  {
    label: "Paramètres",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppStore();

  const routes =
    user?.role === "admin" || user?.user_metadata?.role === "admin"
      ? adminRoutes
      : user?.role === "teacher" || user?.user_metadata?.role === "teacher"
      ? teacherRoutes
      : studentRoutes;

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card text-card-foreground">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            Code<span className="text-primary">Mastery</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-primary/10 rounded-lg transition",
                pathname === route.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
