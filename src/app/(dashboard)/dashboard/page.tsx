"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Clock,
  Trophy,
  ArrowRight,
  Calendar,
  Target,
} from "lucide-react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";

interface Stats {
  completedExercises: number;
  completedCourses: number;
  totalTime: number;
  successRate: number;
  streak: number;
  nextMilestone: number;
  weeklyProgress: {
    date: string;
    completed: number;
  }[];
  difficultyStats: {
    difficulty: string;
    completed: number;
  }[];
}

interface DashboardData {
  stats: Stats;
  recentProgress: (UserProgress & { exercises: any })[];
  courseProgress: (UserCourseProgress & {
    courses: Course & { modules: any[] };
    total_time: number;
  })[];
}

const chartCommonProps = {
  barSize: 32,
  animationDuration: 1000,
  animationBegin: 0,
  className: "transition-all duration-300",
};

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg ring-1 ring-black/5">
        <p className="text-sm font-medium mb-1">
          {formatter ? formatter(label) : label}
        </p>
        <p className="text-sm text-muted-foreground">
          {payload[0].value} exercice{payload[0].value > 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const { theme } = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "week" | "month" | "all"
  >("week");

  const chartColors = {
    text: theme === "dark" ? "#a1a1aa" : "#71717a",
    grid: theme === "dark" ? "#27272a" : "#e4e4e7",
    bar: "var(--primary)",
    background: theme === "dark" ? "#09090b" : "#ffffff",
  };

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

        // Calculer les statistiques hebdomadaires
        const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];

          return {
            date: dateStr,
            completed: progressData.filter(
              (p) =>
                p.status === "completed" && p.completed_at?.startsWith(dateStr)
            ).length,
          };
        }).reverse();

        // Calculer les statistiques par difficulté
        const difficultyStats = ["facile", "moyen", "difficile"].map(
          (difficulty) => ({
            difficulty,
            completed: progressData.filter(
              (p) =>
                p.status === "completed" &&
                (p as any).exercises.difficulty === difficulty
            ).length,
          })
        );

        // Calculer les autres statistiques
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

        const streak = calculateStreak(progressData);
        const nextMilestone = Math.ceil(completedExercises / 10) * 10;

        setData({
          stats: {
            completedExercises,
            completedCourses,
            totalTime,
            successRate,
            streak,
            nextMilestone,
            weeklyProgress,
            difficultyStats,
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
  }, [user, router, theme]);

  const calculateStreak = (progressData: UserProgress[]) => {
    if (!progressData.length) return 0;

    const today = new Date();
    const dates = progressData
      .filter((p) => p.status === "completed")
      .map((p) => new Date(p.completed_at!).toDateString());
    const uniqueDates = [...new Set(dates)];
    uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      if (
        currentDate.toDateString() === date.toDateString() ||
        (currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) === 1
      ) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }

    return streak;
  };

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
            {Array.from({ length: 6 }).map((_, i) => (
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

  const getTimeframeLabel = () => {
    switch (selectedTimeframe) {
      case "week":
        return "cette semaine";
      case "month":
        return "ce mois";
      case "all":
        return "au total";
      default:
        return "";
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className="container mx-auto py-8 px-4"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bienvenue, {user.user_metadata?.name || "Apprenant"}
            </h1>
            <p className="text-muted-foreground">
              Voici votre progression {getTimeframeLabel()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTimeframe("week")}
              className={cn(
                "px-3 py-1 rounded-full text-sm",
                selectedTimeframe === "week"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Semaine
            </button>
            <button
              onClick={() => setSelectedTimeframe("month")}
              className={cn(
                "px-3 py-1 rounded-full text-sm",
                selectedTimeframe === "month"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Mois
            </button>
            <button
              onClick={() => setSelectedTimeframe("all")}
              className={cn(
                "px-3 py-1 rounded-full text-sm",
                selectedTimeframe === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Total
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Exercices complétés</span>
            </div>
            <div className="mt-4 text-2xl font-bold">
              {data.stats.completedExercises}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Plus que{" "}
              {data.stats.nextMilestone - data.stats.completedExercises} pour
              atteindre {data.stats.nextMilestone}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Série actuelle</span>
            </div>
            <div className="mt-4 text-2xl font-bold">
              {data.stats.streak} jours
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Continuez pour maintenir votre série !
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Taux de réussite</span>
            </div>
            <div className="mt-4 text-2xl font-bold">
              {Math.round(data.stats.successRate)}%
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Sur {data.recentProgress.length} exercices tentés
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
            <div className="mt-2 text-sm text-muted-foreground">
              De temps d'apprentissage
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <h3 className="font-semibold mb-4">Progression hebdomadaire</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.stats.weeklyProgress}
                  {...chartCommonProps}
                >
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity={0.5}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartColors.grid}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date: string) =>
                      new Date(date).toLocaleDateString("fr", {
                        weekday: "short",
                      })
                    }
                    stroke={chartColors.text}
                    tick={{ fill: chartColors.text }}
                    axisLine={{ stroke: chartColors.grid }}
                    tickLine={{ stroke: chartColors.grid }}
                    dy={8}
                  />
                  <YAxis
                    stroke={chartColors.text}
                    tick={{ fill: chartColors.text }}
                    axisLine={{ stroke: chartColors.grid }}
                    tickLine={{ stroke: chartColors.grid }}
                    dx={-8}
                  />
                  <Tooltip
                    cursor={{ fill: chartColors.grid, opacity: 0.1 }}
                    content={
                      <CustomTooltip
                        formatter={(date: string) =>
                          new Date(date).toLocaleDateString("fr", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="completed"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <h3 className="font-semibold mb-4">Par niveau de difficulté</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.stats.difficultyStats}
                  {...chartCommonProps}
                >
                  <defs>
                    <linearGradient
                      id="difficultyGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity={0.5}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartColors.grid}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="difficulty"
                    stroke={chartColors.text}
                    tick={{ fill: chartColors.text }}
                    axisLine={{ stroke: chartColors.grid }}
                    tickLine={{ stroke: chartColors.grid }}
                    dy={8}
                  />
                  <YAxis
                    stroke={chartColors.text}
                    tick={{ fill: chartColors.text }}
                    axisLine={{ stroke: chartColors.grid }}
                    tickLine={{ stroke: chartColors.grid }}
                    dx={-8}
                  />
                  <Tooltip
                    cursor={{ fill: chartColors.grid, opacity: 0.1 }}
                    content={<CustomTooltip />}
                  />
                  <Bar
                    dataKey="completed"
                    fill="url(#difficultyGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Progression récente</h3>
              <Link
                href="/dashboard/exercises"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {data.recentProgress.map((progress) => (
                <Link
                  key={progress.id}
                  href={`/dashboard/exercises/${progress.exercise_id}`}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-accent/5 rounded-lg p-2 -mx-2 transition-colors"
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
                </Link>
              ))}
              {data.recentProgress.length === 0 && (
                <div className="text-center text-muted-foreground">
                  Aucun exercice récent
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Parcours en cours</h3>
              <Link
                href="/dashboard/courses"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
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
