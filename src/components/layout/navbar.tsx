"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notifications/notification-center";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Cours", href: "/dashboard/courses" },
  { name: "Forum", href: "/dashboard/forum" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">CodeMastery</span>
        </Link>
        <div className="mr-4 hidden md:flex md:flex-1">
          <div className="flex gap-6 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith(item.href)
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </div>
    </nav>
  );
}
