"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { getCourses, getUserProgress } from "@/lib/queries";
import { useAppStore } from "@/store/use-app-store";
import { CourseCard } from "@/components/courses/course-card";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import type { Course, Exercise, UserProgress } from "@/types/database";

interface RecommendationsData {
  suggestedCourses: Course[];
  suggestedExercises: Exercise[];
}

export function Recommendations() {
  const { user } = useAppStore();
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Récupérer les données nécessaires
        const [courses, progress] = await Promise.all([
          getCourses(),
          getUserProgress(user.id),
        ]);

        // Analyser le niveau de l'utilisateur
        const completedExercises = progress.filter(
          (p) => p.status === "completed"
        ).length;
        const userLevel =
          completedExercises < 5
            ? "facile"
            : completedExercises < 15
            ? "moyen"
            : "difficile";

        // Filtrer les cours adaptés au niveau
        const suggestedCourses = courses
          .filter((course) => course.difficulty === userLevel)
          .slice(0, 3);

        // Filtrer les exercices non complétés du même niveau
        const completedExerciseIds = new Set(
          progress.map((p) => p.exercise_id)
        );
        const suggestedExercises = (progress as any[])
          .filter(
            (p) =>
              !completedExerciseIds.has(p.exercise_id) &&
              p.exercises.difficulty === userLevel
          )
          .map((p) => p.exercises)
          .slice(0, 3);

        setData({
          suggestedCourses,
          suggestedExercises,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des recommandations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Recommandé pour vous</h2>
      </div>

      {data.suggestedCourses.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Parcours suggérés</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {data.suggestedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                href={`/courses/${course.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {data.suggestedExercises.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Exercices suggérés</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {data.suggestedExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} {...exercise} />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Link
          href="/dashboard/courses"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Voir tous les parcours
        </Link>
      </div>
    </div>
  );
}
