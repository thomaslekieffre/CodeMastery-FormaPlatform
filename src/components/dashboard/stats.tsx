"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getUserProgress, getUserCourseProgress } from "@/lib/queries";
import { useAppStore } from "@/store/use-app-store";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import type { UserProgress, UserCourseProgress } from "@/types/database";

interface StatsData {
  weeklyProgress: {
    date: string;
    completed: number;
  }[];
  difficultyStats: {
    difficulty: string;
    completed: number;
  }[];
  timeStats: {
    hour: number;
    count: number;
  }[];
}

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <p className="text-sm font-medium">
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

export function DashboardStats() {
  const { user } = useAppStore();
  const { theme } = useTheme();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const chartColors = {
    text: theme === "dark" ? "#a1a1aa" : "#71717a",
    grid: theme === "dark" ? "#27272a" : "#e4e4e7",
    bar: "var(--primary)",
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

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

        // Calculer les statistiques par heure
        const timeStats = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          count: progressData.filter((p) => {
            const completedHour = p.completed_at
              ? new Date(p.completed_at).getHours()
              : -1;
            return completedHour === hour;
          }).length,
        }));

        setData({
          weeklyProgress,
          difficultyStats,
          timeStats,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-[200px] bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const dateFormatter = (date: string) =>
    new Date(date).toLocaleDateString("fr", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const shortDateFormatter = (date: string) =>
    new Date(date).toLocaleDateString("fr", {
      weekday: "short",
    });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Progression hebdomadaire</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyProgress}>
              <XAxis
                dataKey="date"
                tickFormatter={shortDateFormatter}
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
              />
              <YAxis
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
              />
              <Tooltip content={<CustomTooltip formatter={dateFormatter} />} />
              <Bar
                dataKey="completed"
                fill={chartColors.bar}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Par niveau de difficulté</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.difficultyStats}>
                <XAxis
                  dataKey="difficulty"
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                />
                <YAxis
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="completed"
                  fill={chartColors.bar}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Par heure de la journée</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeStats}>
                <XAxis
                  dataKey="hour"
                  tickFormatter={(hour: number) => `${hour}h`}
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                />
                <YAxis
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                />
                <Tooltip
                  content={
                    <CustomTooltip formatter={(hour: number) => `${hour}h00`} />
                  }
                />
                <Bar
                  dataKey="count"
                  fill={chartColors.bar}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
