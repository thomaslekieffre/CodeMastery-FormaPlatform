"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/use-app-store";
import { CourseCard } from "@/components/courses/course-card";
import { Search } from "lucide-react";
import type { CourseWithProgress } from "@/types/database";
import type { Module } from "@/types/database";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAppStore();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const supabase = createClient();

        // Récupérer les cours avec leurs modules
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select(
            `
            *,
            modules (*)
          `
          )
          .order("sort_order", { ascending: true });

        if (coursesError) throw coursesError;

        if (!user) {
          setCourses(coursesData || []);
          return;
        }

        // Récupérer la progression de l'utilisateur pour tous les cours
        const { data: progressData, error: progressError } = await supabase
          .from("user_course_progress")
          .select("*")
          .eq("user_id", user.id);

        if (progressError) throw progressError;

        // Combiner les cours avec leur progression
        const coursesWithProgress =
          coursesData?.map((course) => {
            const progress = progressData?.find(
              (p) => p.course_id === course.id
            );

            // Calculer le statut correct
            if (progress && course.modules) {
              const isFullyCompleted = course.modules.every((module: Module) =>
                progress.completed_modules.includes(module.id)
              );

              // Mettre à jour le statut en base si nécessaire
              if (isFullyCompleted && progress.status !== "completed") {
                void supabase
                  .from("user_course_progress")
                  .update({
                    status: "completed",
                    completed_at: new Date().toISOString(),
                  })
                  .eq("id", progress.id)
                  .then(({ error: updateError }) => {
                    if (!updateError) {
                      progress.status = "completed";
                      progress.completed_at = new Date().toISOString();
                    }
                  });
              }
            }

            return {
              ...course,
              progress: progress || {
                id: "",
                user_id: user.id,
                course_id: course.id,
                status: "not_started",
                completed_modules: [],
                started_at: null,
                completed_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            };
          }) || [];

        setCourses(coursesWithProgress);
      } catch (err) {
        console.error("Erreur lors de la récupération des cours:", err);
        setError("Une erreur est survenue lors du chargement des cours.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="w-full md:w-64 h-10 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-6 animate-pulse"
            >
              <div className="h-4 w-3/4 bg-muted rounded mb-4" />
              <div className="h-20 bg-muted rounded mb-4" />
              <div className="h-2 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  const inProgressCourses = filteredCourses.filter(
    (course) => course.progress?.status === "in_progress"
  );

  const notStartedCourses = filteredCourses.filter(
    (course) => course.progress?.status === "not_started"
  );

  const completedCourses = filteredCourses.filter(
    (course) => course.progress?.status === "completed"
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Cours disponibles</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            className="w-full pl-8 pr-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {inProgressCourses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">En cours</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={course.progress}
                href={`/dashboard/courses/${course.id}`}
                totalModules={course.modules?.length || 0}
              />
            ))}
          </div>
        </div>
      )}

      {notStartedCourses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">À commencer</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {notStartedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={course.progress}
                href={`/dashboard/courses/${course.id}`}
                totalModules={course.modules?.length || 0}
              />
            ))}
          </div>
        </div>
      )}

      {completedCourses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Terminés</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={course.progress}
                href={`/dashboard/courses/${course.id}`}
                totalModules={course.modules?.length || 0}
              />
            ))}
          </div>
        </div>
      )}

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery
              ? "Aucun cours ne correspond à votre recherche."
              : "Aucun cours n'est disponible pour le moment."}
          </p>
        </div>
      )}
    </div>
  );
}
