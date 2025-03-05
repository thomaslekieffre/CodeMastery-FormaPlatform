"use client";

import { useEffect } from "react";
import { Bell, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

import { useNotificationStore } from "@/store/notification-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function NotificationCenter({ className }: { className?: string }) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    initialize,
    fetchNotifications,
    markAsRead,
  } = useNotificationStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleRefresh = async () => {
    try {
      await fetchNotifications();
      toast.success("Notifications mises à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour des notifications");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.is_read);
      await Promise.all(unreadNotifications.map((n) => markAsRead(n.id)));
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (error) {
      toast.error("Erreur lors du marquage des notifications");
    }
  };

  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          "flex w-full items-center gap-x-3 rounded-lg text-sm leading-6 font-medium text-foreground/80 dark:text-gray-200 hover:bg-violet-500/10 hover:text-violet-400 transition-colors",
          className
        )}
      >
        <div className="relative">
          <Bell className="h-6 w-6 shrink-0 text-violet-500" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <span>Notifications</span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="icon"
              className={cn("h-8 w-8", isLoading && "animate-spin")}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
            Une erreur est survenue lors du chargement des notifications
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          <div className="mt-4 space-y-4 overflow-y-auto max-h-[80vh]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  !notification.is_read && "bg-accent"
                )}
                onClick={() =>
                  !notification.is_read && markAsRead(notification.id)
                }
              >
                <p className="text-sm">{notification.content}</p>
                {notification.link && (
                  <a
                    href={notification.link}
                    className="mt-2 block text-xs text-blue-500 hover:underline"
                  >
                    Voir plus
                  </a>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "numeric",
                      month: "long",
                      hour: "numeric",
                      minute: "numeric",
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
