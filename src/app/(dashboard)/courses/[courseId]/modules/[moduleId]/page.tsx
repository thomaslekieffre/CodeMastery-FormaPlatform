"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourseById, getModuleById } from "@/lib/queries";
import { ModuleViewer } from "@/components/courses/module-viewer";
import type { Course, Module } from "@/types/database";

interface CourseWithModules extends Course {
  modules: Module[];
}

export default function ModulePage() {
  const { courseId, moduleId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, moduleData] = await Promise.all([
          getCourseById(courseId as string),
          getModuleById(moduleId as string),
        ]);

        setCourse(courseData);
        setModule(moduleData);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError("Une erreur est survenue lors du chargement du module.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, moduleId]);

  if (loading) {
    return (
      <div className="container max-w-4xl py-10 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="h-4 w-96 bg-muted rounded mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !course || !module) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error || "Module non trouvé"}
        </div>
      </div>
    );
  }

  const currentIndex = course.modules.findIndex((m) => m.id === moduleId);
  const prevModule = currentIndex > 0 ? course.modules[currentIndex - 1] : null;
  const nextModule =
    currentIndex < course.modules.length - 1
      ? course.modules[currentIndex + 1]
      : null;

  const handleModuleComplete = () => {
    if (nextModule) {
      router.push(`/courses/${courseId}/modules/${nextModule.id}`);
    } else {
      router.push(`/courses/${courseId}`);
    }
  };

  return (
    <ModuleViewer
      module={module}
      course={course}
      prevModuleId={prevModule?.id}
      nextModuleId={nextModule?.id}
      onComplete={handleModuleComplete}
    />
  );
}
