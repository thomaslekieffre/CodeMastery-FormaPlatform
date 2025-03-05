"use client";

import { useSettingsStore } from "@/store/use-settings-store";
import { useEffect } from "react";

export function AnimationsProvider() {
  const { animations } = useSettingsStore();

  useEffect(() => {
    if (animations) {
      document.documentElement.classList.remove("no-animations");
    } else {
      document.documentElement.classList.add("no-animations");
    }
  }, [animations]);

  return null;
}
