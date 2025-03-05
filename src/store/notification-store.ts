import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";

export type Notification = {
  id: string;
  user_id: string;
  type: "new_course" | "forum_mention";
  content: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  reference_id: string | null;
};

type NotificationStore = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  subscribeToNotifications: () => () => void;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await get().fetchNotifications();
        const unsubscribe = get().subscribeToNotifications();
        set({ initialized: true });
        return unsubscribe;
      }
    } catch (error) {
      console.error("Erreur d'initialisation:", error);
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const notifications = data as Notification[];
      const unreadCount = notifications.filter((n) => !n.is_read).length;

      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      set({
        error: "Erreur lors de la récupération des notifications",
        isLoading: false,
      });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      const notifications = get().notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;

      set({ notifications, unreadCount });
    } catch (error) {
      console.error(
        "Erreur lors du marquage de la notification comme lue:",
        error
      );
    }
  },

  subscribeToNotifications: () => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await get().fetchNotifications();
      }
    });

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          get().fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      channel.unsubscribe();
    };
  },
}));
