"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getModuleById } from "@/lib/queries";
import { Markdown } from "@/components/markdown";
import { CodeEditor } from "@/components/exercises/code-editor";
import type { Module, Exercise } from "@/types/database";

interface ModuleWithExercise extends Module {
  exercises?: Exercise;
}

export default function ModulePage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState<ModuleWithExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const moduleData = await getModuleById(moduleId as string);
        setModule(moduleData);
      } catch (err) {
        console.error("Erreur lors du chargement du module:", err);
        setError("Une erreur est survenue lors du chargement du module.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="container py-10 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="h-4 w-96 bg-muted rounded mb-8" />
        <div className="h-[400px] bg-muted rounded" />
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
    <div className="container py-10">
      <Link
        href={`/courses/${module.course_id}`}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au parcours
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{module.title}</h1>
        <p className="mt-2 text-muted-foreground">{module.description}</p>
      </div>

      <div className="prose prose-violet dark:prose-invert max-w-none">
        {module.type === "video" && module.video_url && (
          <div className="aspect-video mb-8">
            <iframe
              src={module.video_url}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {module.type === "exercise" &&
          module.exercise_id &&
          module.exercises && (
            <div className="not-prose">
              <CodeEditor
                code={module.exercises.initial_code}
                language={module.exercises.language}
                onChange={() => {}}
                readOnly={false}
              />
            </div>
          )}

        <div className="mt-8">
          <Markdown content={module.content} />
        </div>
      </div>
    </div>
  );
}
