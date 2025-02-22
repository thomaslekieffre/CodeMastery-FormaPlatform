"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/use-app-store";
import { UserProgressCard } from "@/components/dashboard/user-progress";
import { RecentExercises } from "@/components/dashboard/recent-exercises";
import { RecommendedExercises } from "@/components/dashboard/recommended-exercises";
import { FadeIn } from "@/components/animations/fade-in";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAppStore();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="container mx-auto py-8 px-4"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <FadeIn>
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bienvenue, {user.user_metadata?.name || "Apprenant"}
            </h1>
            <p className="text-muted-foreground">
              Suivez votre progression et continuez votre apprentissage.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <UserProgressCard userId={user.id} />
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn delay={0.2}>
            <RecentExercises userId={user.id} />
          </FadeIn>
          <FadeIn delay={0.3}>
            <RecommendedExercises userId={user.id} />
          </FadeIn>
        </div>
      </div>
    </motion.div>
  );
}
