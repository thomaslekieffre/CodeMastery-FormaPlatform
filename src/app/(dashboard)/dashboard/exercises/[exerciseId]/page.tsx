"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Code2, Timer, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CodeEditor } from "@/components/exercises/code-editor";
import { Markdown } from "@/components/markdown";
import {
  getExerciseById,
  getExerciseProgress,
  updateExerciseProgress,
} from "@/lib/queries";
import { useAppStore } from "@/store/use-app-store";
import type { Exercise, ExerciseTest, ProgressStatus } from "@/types/database";

type TestStatus = "pending" | "success" | "error";

interface LoadedExercise extends Exercise {
  tests: ExerciseTest[];
}

export default function ExercisePage() {
  const router = useRouter();
  const { exerciseId } = useParams();
  const { user } = useAppStore();
  const [exercise, setExercise] = useState<LoadedExercise | null>(null);
  const [code, setCode] = useState("");
  const [tests, setTests] = useState<(ExerciseTest & { status: TestStatus })[]>(
    []
  );
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadExercise = async () => {
      try {
        // Charger l'exercice et ses tests
        const exerciseData = await getExerciseById(exerciseId as string);
        setExercise(exerciseData as LoadedExercise);

        // Initialiser les tests avec le statut "pending"
        setTests(
          exerciseData.tests.map((test: ExerciseTest) => ({
            ...test,
            status: "pending" as TestStatus,
          }))
        );

        // Charger la progression de l'utilisateur
        const progress = await getExerciseProgress(
          user.id,
          exerciseId as string
        );
        if (progress) {
          setCode(progress.code || exerciseData.initial_code);
        } else {
          setCode(exerciseData.initial_code);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'exercice:", error);
        router.push("/dashboard/exercises");
      }
    };

    loadExercise();
  }, [exerciseId, user, router]);

  if (!exercise || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chargement de l'exercice...</p>
      </div>
    );
  }

  const resetCode = () => {
    setCode(exercise.initial_code);
    setTests(
      tests.map((test) => ({ ...test, status: "pending" as TestStatus }))
    );
  };

  const saveProgress = async (newStatus: ProgressStatus) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await updateExerciseProgress({
        userId: user.id,
        exerciseId: exercise.id,
        code,
        status: newStatus,
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const runTests = async () => {
    console.log("Code actuel :", code);

    const updatedTests = tests.map((test) => {
      // Dans un environnement sécurisé, on devrait exécuter ça côté serveur
      const validate = new Function("code", test.validation_code);
      const passed = validate(code);

      console.log(`Test "${test.name}" :`, passed ? "✅ Réussi" : "❌ Échoué");
      if (!passed) {
        console.log("Message d'erreur :", test.error_message);
      }

      return {
        ...test,
        status: passed ? ("success" as const) : ("error" as const),
      };
    });

    setTests(updatedTests);

    const allTestsPassed = updatedTests.every(
      (test) => test.status === "success"
    );

    // Sauvegarder la progression
    await saveProgress(allTestsPassed ? "completed" : "in_progress");

    if (allTestsPassed) {
      console.log("🎉 Tous les tests sont passés !");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/exercises"
          className="text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">{exercise.title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Timer className="h-4 w-4" />
              <span>{exercise.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Code2 className="h-4 w-4" />
              <span className="capitalize">{exercise.difficulty}</span>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-4">
            <div className="text-muted-foreground">{exercise.description}</div>
            <div className="markdown-content">
              <Markdown content={exercise.instructions} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {exercise.technologies.map((tech) => (
              <div
                key={tech}
                className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted flex items-center justify-between">
              <h2 className="font-medium">Éditeur de code</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-primary hover:underline"
                >
                  {showPreview ? "Masquer l'aperçu" : "Voir l'aperçu"}
                </button>
                <button
                  onClick={resetCode}
                  className="text-xs text-primary hover:underline"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
            <CodeEditor
              code={code}
              language="html"
              onChange={(value) => {
                setCode(value || "");
                saveProgress("in_progress");
              }}
            />
          </div>

          {showPreview && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-medium">Aperçu</h2>
              </div>
              <div className="p-4">
                <iframe
                  srcDoc={code}
                  className="w-full h-[400px] border-0 bg-white"
                  title="Aperçu"
                />
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-medium">Tests</h2>
              <button
                onClick={runTests}
                disabled={isSaving}
                className={cn(
                  "px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md transition",
                  isSaving
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary/90"
                )}
              >
                {isSaving ? "Sauvegarde..." : "Lancer les tests"}
              </button>
            </div>
            <div className="divide-y divide-border">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {test.description}
                    </p>
                    {test.status === "error" && test.error_message && (
                      <p className="text-sm text-red-500 mt-1">
                        {test.error_message}
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      test.status === "success"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : test.status === "error"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    )}
                  >
                    {test.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
