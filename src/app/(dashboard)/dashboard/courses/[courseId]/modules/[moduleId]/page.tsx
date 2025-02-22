"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import type { Course, Module, UserCourseProgress } from "@/types/database";

interface ModuleWithCourse extends Module {
  course: Course;
}

function extractYouTubeId(url: string): string {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}

// Configuration de marked pour le markdown
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Fonction pour convertir le markdown en HTML sécurisé
function markdownToHtml(markdown: string) {
  const parser = new marked.Parser();
  const lexer = new marked.Lexer();
  const rawHtml = parser.parse(lexer.lex(markdown));
  return DOMPurify.sanitize(rawHtml);
}

export default function ModulePage() {
  const { courseId, moduleId } = useParams();
  const router = useRouter();
  const { user } = useAppStore();
  const [module, setModule] = useState<ModuleWithCourse | null>(null);
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();

        // Récupérer le module avec son cours parent
        const { data: moduleData, error: moduleError } = await supabase
          .from("modules")
          .select(
            `
            *,
            course:courses (*)
          `
          )
          .eq("id", moduleId)
          .single();

        if (moduleError) throw moduleError;

        // Logs plus détaillés
        console.log(
          "Module data complet:",
          JSON.stringify(moduleData, null, 2)
        );
        console.log("Type de content_type:", typeof moduleData?.content_type);
        console.log("Type de type:", typeof moduleData?.type);

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

        setModule(moduleData);
        setProgress(progressData || null);
      } catch (err) {
        console.error("Erreur lors du chargement du module:", err);
        setError("Une erreur est survenue lors du chargement du module.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [courseId, moduleId, user]);

  const handleModuleComplete = async () => {
    try {
      const supabase = createClient();
      const completedModules = progress?.completed_modules || [];
      const isCompleted = completedModules.includes(moduleId as string);

      let newCompletedModules: string[];
      if (isCompleted) {
        newCompletedModules = completedModules.filter(
          (id) => id !== (moduleId as string)
        );
      } else {
        newCompletedModules = [...completedModules, moduleId as string];
      }

      const now = new Date().toISOString();
      const status =
        newCompletedModules.length === 0
          ? "not_started"
          : newCompletedModules.length === module?.course?.modules?.length
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
    }
  };

  if (loading) {
    return (
      <div className="container py-10 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="h-4 w-96 bg-muted rounded mb-8" />
        <div className="h-64 bg-muted rounded" />
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

  const isCompleted = progress?.completed_modules?.includes(moduleId as string);

  return (
    <div className="container py-10">
      <Link
        href={`/dashboard/courses/${courseId}`}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au cours
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{module.title}</h1>
        <p className="mt-2 text-muted-foreground">{module.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="rounded-lg border bg-card p-8">
          {module.type === "video" && (
            <div className="space-y-8">
              {module.video_url && (
                <YouTubeEmbed
                  videoId={extractYouTubeId(module.video_url)}
                  title={module.title}
                />
              )}
              {module.content && (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(module.content),
                  }}
                />
              )}
            </div>
          )}

          {module.type === "article" && module.content && (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(module.content),
              }}
            />
          )}

          {module.type === "exercise" && (
            <div>
              <p>Exercice à venir...</p>
              {/* On ajoutera ici le composant d'exercice */}
            </div>
          )}

          {!module.content &&
            !module.video_url &&
            module.type !== "exercise" && (
              <p className="text-muted-foreground">
                Aucun contenu disponible pour ce module.
              </p>
            )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-4">Validation du module</h3>
            <Button
              onClick={handleModuleComplete}
              className="w-full"
              variant={isCompleted ? "outline" : "default"}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isCompleted ? "Module terminé" : "Marquer comme terminé"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
