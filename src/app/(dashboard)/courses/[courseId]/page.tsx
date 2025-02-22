"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getCourseById, getCourseProgress } from "@/lib/queries";
import { useAppStore } from "@/store/use-app-store";
import { ModuleList } from "@/components/courses/module-list";
import type { Course, Module } from "@/types/database";

interface CourseWithModules extends Course {
  modules: Module[];
}

export default function CoursePage() {
  const { courseId } = useParams();
  const { user } = useAppStore();
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await getCourseById(courseId as string);
        setCourse(courseData);

        if (user) {
          const progressData = await getCourseProgress(
            user.id,
            courseId as string
          );
          if (progressData) {
            setCompletedModules(progressData.completed_modules);
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement du parcours:", err);
        setError("Une erreur est survenue lors du chargement du parcours.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user]);

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
          {error || "Parcours non trouvé"}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Link
        href="/courses"
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
          <ModuleList
            modules={course.modules}
            completedModules={completedModules}
          />
        </div>

        <div className="space-y-6 rounded-lg border bg-card p-4">
          <div>
            <h3 className="font-semibold">Progression</h3>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {completedModules.length} / {course.modules.length} modules
                </span>
                <span>
                  {Math.round(
                    (completedModules.length / course.modules.length) * 100
                  )}
                  %
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.round(
                      (completedModules.length / course.modules.length) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Informations</h3>
            <dl className="mt-2 space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Durée estimée</dt>
                <dd>{course.duration}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Difficulté</dt>
                <dd className="capitalize">{course.difficulty}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
