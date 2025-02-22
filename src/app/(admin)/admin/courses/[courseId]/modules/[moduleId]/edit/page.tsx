"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ModuleForm } from "@/components/courses/module-form";
import type { Module } from "@/types/database";

export default function EditModulePage() {
  const { courseId, moduleId } = useParams();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/modules/${moduleId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du module");
        }
        const data = await response.json();
        setModule(data);
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

    fetchModule();
  }, [moduleId]);

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

  if (error || !module) {
    return (
      <div className="container py-10">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error || "Module non trouvé"}
        </div>
      </div>
    );
  }

  return (
    <ModuleForm
      courseId={courseId as string}
      initialData={module}
      mode="edit"
    />
  );
}
