"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Cours",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    name: "Forum",
    href: "/dashboard/forum",
    icon: MessageSquare,
  },
  {
    name: "Communauté",
    href: "/dashboard/community",
    icon: Users,
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col gap-y-5 border-r bg-card p-6">
      <div className="flex h-16 items-center px-2">
        <Link href="/dashboard" className="font-bold text-xl">
          CodeMastery
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium hover:bg-violet-500/10 hover:text-violet-500 transition-colors",
                isActive && "bg-violet-500/10 text-violet-500"
              )}
            >
              <item.icon className="h-6 w-6 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <button className="flex w-full items-center gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium text-red-500 hover:bg-red-500/10 transition-colors">
          <LogOut className="h-6 w-6 shrink-0" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
