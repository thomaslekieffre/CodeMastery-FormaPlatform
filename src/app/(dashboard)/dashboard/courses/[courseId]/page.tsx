"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
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
          // PGRST116 signifie qu'aucun enregistrement n'a été trouvé
          throw progressError;
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

  const handleModuleComplete = async (moduleId: string) => {
    try {
      const supabase = createClient();
      const completedModules = progress?.completed_modules || [];
      const isCompleted = completedModules.includes(moduleId);

      let newCompletedModules: string[];
      if (isCompleted) {
        // Retirer le module de la liste des modules complétés
        newCompletedModules = completedModules.filter((id) => id !== moduleId);
      } else {
        // Ajouter le module à la liste des modules complétés
        newCompletedModules = [...completedModules, moduleId];
      }

      const now = new Date().toISOString();
      const status =
        newCompletedModules.length === 0
          ? "not_started"
          : newCompletedModules.length === (course?.modules?.length || 0)
          ? "completed"
          : "in_progress";

      if (progress) {
        // Mettre à jour la progression existante
        const { data, error } = await supabase
          .from("user_course_progress")
          .update({
            completed_modules: newCompletedModules,
            status,
            completed_at: status === "completed" ? now : null,
          })
          .eq("id", progress.id)
          .select()
          .single();

        if (error) throw error;
        setProgress(data);
      } else {
        // Créer une nouvelle progression
        const { data, error } = await supabase
          .from("user_course_progress")
          .insert([
            {
              user_id: user?.id,
              course_id: courseId,
              completed_modules: newCompletedModules,
              status,
              started_at: now,
              completed_at: status === "completed" ? now : null,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        setProgress(data);
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la progression:", err);
      // On pourrait ajouter une notification d'erreur ici
    }
  };

  if (loading) {
    return (
      <div className="container py-10 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="h-4 w-96 bg-muted rounded mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container py-10">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error || "Cours non trouvé"}
        </div>
      </div>
    );
  }

  const completedModules = progress?.completed_modules || [];
  const totalModules = course.modules?.length || 0;
  const progressPercentage =
    totalModules > 0
      ? Math.round((completedModules.length / totalModules) * 100)
      : 0;

  return (
    <div className="container py-10">
      <Link
        href="/dashboard/courses"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux parcours
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="mt-2 text-muted-foreground">{course.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Modules du parcours</h2>
          <div className="space-y-2">
            {course.modules?.map((module) => {
              const isCompleted = completedModules.includes(module.id);

              return (
                <Link
                  key={module.id}
                  href={`/dashboard/courses/${courseId}/modules/${module.id}`}
                  className="block rounded-lg border bg-card p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        isCompleted ? "bg-primary" : "bg-muted-foreground"
                      }`}
                    />
                    <div>
                      <h3 className="font-medium">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Progression</h3>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {completedModules.length} / {totalModules} modules
                </span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Durée estimée</dt>
                <dd>{course.duration}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Difficulté</dt>
                <dd className="capitalize">{course.difficulty}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Statut</dt>
                <dd className="capitalize">
                  {progress?.status || "non commencé"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
