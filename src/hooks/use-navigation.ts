"use client";

import { useRouter } from "next/navigation";

export function useNavigation() {
  const router = useRouter();

  const navigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
    router.push(path);
  };

  return { navigate };
}
