import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  notifications: boolean;
  animations: boolean;
  setNotifications: (enabled: boolean) => void;
  setAnimations: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: true,
      animations: true,
      setNotifications: (enabled) => set({ notifications: enabled }),
      setAnimations: (enabled) => set({ animations: enabled }),
    }),
    {
      name: "settings-store",
    }
  )
);
