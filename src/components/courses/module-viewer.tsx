"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { updateCourseProgress, trackTime } from "@/lib/queries";
import { useAppStore } from "@/store/use-app-store";
import type { Module, Course } from "@/types/database";

interface ModuleViewerProps {
  module: Module;
  course: Course;
  nextModuleId?: string;
  prevModuleId?: string;
  onComplete?: () => void;
}

export function ModuleViewer({
  module,
  course,
  nextModuleId,
  prevModuleId,
  onComplete,
}: ModuleViewerProps) {
  const { user } = useAppStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [startTime] = useState(Date.now());

  // Tracker le temps passé quand l'utilisateur quitte le module
  useEffect(() => {
    return () => {
      if (user) {
        const duration = Math.round((Date.now() - startTime) / 1000); // en secondes
        trackTime({
          userId: user.id,
          courseId: course.id,
          moduleId: module.id,
          duration,
        }).catch(console.error);
      }
    };
  }, [user, course.id, module.id, startTime]);

  const handleComplete = async () => {
    if (!user || isCompleting) return;
    setIsCompleting(true);

    try {
      // Mettre à jour la progression du cours
      await updateCourseProgress({
        userId: user.id,
        courseId: course.id,
        moduleId: module.id,
        completed: true,
      });

      onComplete?.();
    } catch (error) {
      console.error("Erreur lors de la validation du module:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <Link
          href={`/courses/${course.id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au parcours
        </Link>
        <h1 className="text-3xl font-bold">{module.title}</h1>
        <p className="mt-2 text-muted-foreground">{module.description}</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
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

        <Markdown content={module.content} />
      </div>

      <div className="mt-8 flex items-center justify-between border-t pt-8">
        <div>
          {prevModuleId && (
            <Link href={`/courses/${course.id}/modules/${prevModuleId}`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Module précédent
              </Button>
            </Link>
          )}
        </div>

        <Button
          onClick={handleComplete}
          disabled={isCompleting}
          className="inline-flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {isCompleting ? "Validation..." : "Marquer comme terminé"}
        </Button>

        <div>
          {nextModuleId && (
            <Link href={`/courses/${course.id}/modules/${nextModuleId}`}>
              <Button variant="outline">
                Module suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
