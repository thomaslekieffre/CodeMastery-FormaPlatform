"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/use-app-store";
import { getUserProgress, getUserCourseProgress } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type {
  UserProgress,
  UserCourseProgress,
  Course,
} from "@/types/database";
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

interface Stats {
  completedExercises: number;
  completedCourses: number;
  totalTime: number;
  successRate: number;
}

interface DashboardData {
  stats: Stats;
  recentProgress: (UserProgress & { exercises: any })[];
  courseProgress: (UserCourseProgress & {
    courses: Course & { modules: any[] };
    total_time: number;
  })[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [progressData, courseProgressData] = await Promise.all([
          getUserProgress(user.id),
          getUserCourseProgress(user.id),
        ]);

        // Calculer les statistiques
        const completedExercises = progressData.filter(
          (p) => p.status === "completed"
        ).length;

        const completedCourses = courseProgressData.filter(
          (p) => p.status === "completed"
        ).length;

        const totalTime = courseProgressData.reduce(
          (acc, p) => acc + (p.total_time || 0),
          0
        );

        const totalAttempts = progressData.length;
        const successRate =
          totalAttempts > 0 ? (completedExercises / totalAttempts) * 100 : 0;

        setData({
          stats: {
            completedExercises,
            completedCourses,
            totalTime,
            successRate,
          },
          recentProgress: progressData.slice(0, 5),
          courseProgress: courseProgressData,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError(error instanceof Error ? error.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  if (!user) return null;

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="rounded-lg border bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="h-20 bg-muted rounded animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-6 animate-pulse"
              >
                <div className="h-4 w-20 bg-muted rounded mb-4" />
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`;
    }
    return `${minutes}min`;
  };

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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Exercices complétés</span>
            </div>
            <div className="mt-4 text-2xl font-bold">
              {data.stats.completedExercises}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>Parcours terminés</span>
            </div>
            <div className="mt-4 text-2xl font-bold">
              {data.stats.completedCourses}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Temps total</span>
            </div>
            <div className="mt-4 text-2xl font-bold">
              {formatTime(data.stats.totalTime)}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Taux de réussite</span>
            </div>
            <div className="mt-4 text-2xl font-bold">
              {Math.round(data.stats.successRate)}%
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Progression récente</h3>
            <div className="space-y-4">
              {data.recentProgress.map((progress) => (
                <div
                  key={progress.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">
                      {progress.exercises.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(progress.updated_at).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                        }
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-sm font-medium",
                      progress.status === "completed"
                        ? "text-green-500"
                        : "text-yellow-500"
                    )}
                  >
                    {progress.status === "completed" ? "Terminé" : "En cours"}
                  </div>
                </div>
              ))}
              {data.recentProgress.length === 0 && (
                <div className="text-center text-muted-foreground">
                  Aucun exercice récent
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Parcours en cours</h3>
            <div className="space-y-4">
              {data.courseProgress
                .filter((progress) => progress.status !== "completed")
                .map((progress) => (
                  <Link
                    key={progress.id}
                    href={`/dashboard/courses/${progress.courses.id}`}
                    className="block space-y-2 border-b pb-4 last:border-0 last:pb-0 hover:bg-accent/5 rounded-lg p-2 -mx-2 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {progress.courses.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(progress.total_time || 0)} •{" "}
                          {progress.completed_modules.length} /{" "}
                          {progress.courses.modules?.length || 0} modules
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(
                          (progress.completed_modules.length /
                            (progress.courses.modules?.length || 1)) *
                            100
                        )}
                        %
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.round(
                            (progress.completed_modules.length /
                              (progress.courses.modules?.length || 1)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </Link>
                ))}

              {data.courseProgress.filter((p) => p.status !== "completed")
                .length === 0 && (
                <div className="text-center text-muted-foreground">
                  Tous vos parcours sont terminés ! 🎉
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
