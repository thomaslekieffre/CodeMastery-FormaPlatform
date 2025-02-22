"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CourseForm } from "@/components/courses/course-form";
import type { Course } from "@/types/database";

export default function EditCoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du parcours");
        }
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        console.error("Erreur:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur inattendue est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-8 space-y-6">
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-32 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-1/2 animate-pulse rounded bg-muted" />
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

  return <CourseForm mode="edit" initialData={course} />;
}
