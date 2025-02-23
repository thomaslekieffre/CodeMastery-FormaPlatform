"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/use-app-store";
import type { Course, Module, UserCourseProgress } from "@/types/database";

interface CourseWithModules extends Course {
  modules: Module[];
}

export default function CoursePage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useAppStore();
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();

        // Récupérer le cours avec ses modules
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select(
            `
            *,
            modules (
              *
            )
          `
          )
          .eq("id", courseId)
          .single();

        if (courseError) throw courseError;

        // Récupérer la progression de l'utilisateur
        const { data: progressData, error: progressError } = await supabase
          .from("user_course_progress")
          .select("*")
          .eq("course_id", courseId)
          .eq("user_id", user?.id)
          .single();

        if (progressError && progressError.code !== "PGRST116") {
          throw progressError;
        }

        // Calculer le statut correct
        if (progressData && courseData.modules) {
          const isFullyCompleted = courseData.modules.every((module: Module) =>
            progressData.completed_modules.includes(module.id)
          );

          if (isFullyCompleted && progressData.status !== "completed") {
            // Mettre à jour le statut en base
            const { error: updateError } = await supabase
              .from("user_course_progress")
              .update({
                status: "completed",
                completed_at: new Date().toISOString(),
              })
              .eq("id", progressData.id);

            if (!updateError) {
              progressData.status = "completed";
              progressData.completed_at = new Date().toISOString();
            }
          }
        }

        setCourse(courseData);
        setProgress(progressData || null);
      } catch (err) {
        console.error("Erreur lors du chargement du cours:", err);
        setError("Une erreur est survenue lors du chargement du cours.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [courseId, user]);

  if (loading) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Cours non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <Link
          href="/dashboard/courses"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux parcours
        </Link>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="mt-2 text-muted-foreground">{course.description}</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-lg font-semibold mb-2">Progression</h2>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {progress ? (
                <>
                  {progress.completed_modules.length} / {course.modules.length}{" "}
                  modules complétés
                  {progress.status === "completed" && " • Parcours terminé"}
                </>
              ) : (
                "Pas encore commencé"
              )}
            </div>
            <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.round(
                    ((progress?.completed_modules.length || 0) /
                      course.modules.length) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Modules du parcours</h2>
          {course.modules.map((module) => (
            <Link
              key={module.id}
              href={`/dashboard/courses/${course.id}/modules/${module.id}`}
              className="block"
            >
              <div className="rounded-lg border bg-card p-4 hover:border-primary transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                  {progress?.completed_modules.includes(module.id) && (
                    <div className="text-sm font-medium text-green-500">
                      Terminé
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
