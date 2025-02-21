"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getExerciseById } from "@/lib/queries";
import { useAppStore } from "@/store/use-app-store";
import type { Exercise, ExerciseTest } from "@/types/database";
import { Markdown } from "@/components/markdown";
import { CodeEditor } from "@/components/exercises/code-editor";

interface FormData extends Omit<Exercise, "id" | "created_at" | "updated_at"> {
  tests: Omit<ExerciseTest, "id" | "exercise_id" | "created_at">[];
}

const initialFormData: FormData = {
  title: "",
  description: "",
  instructions: "",
  difficulty: "facile",
  duration: "30 min",
  technologies: [],
  initial_code: "",
  tests: [],
  created_by: "",
};

export default function EditExercisePage() {
  const router = useRouter();
  const { exerciseId } = useParams();
  const { user } = useAppStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newTech, setNewTech] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      created_by: user.id,
    }));

    const loadExercise = async () => {
      try {
        const exercise = await getExerciseById(exerciseId as string);
        if (exercise) {
          const { id, created_at, updated_at, ...rest } = exercise;
          setFormData({
            ...rest,
            tests:
              exercise.tests?.map(
                ({
                  id,
                  exercise_id,
                  created_at,
                  created_by,
                  ...test
                }: ExerciseTest) => test
              ) || [],
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'exercice:", error);
        router.push("/admin/exercises");
      } finally {
        setLoading(false);
      }
    };

    loadExercise();
  }, [exerciseId, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      router.push("/admin/exercises");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Une erreur est survenue lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const addTest = () => {
    setFormData((prev) => ({
      ...prev,
      tests: [
        ...prev.tests,
        {
          name: "",
          description: "",
          validation_code: "",
          error_message: "",
          created_by: user?.id || "",
        },
      ],
    }));
  };

  const removeTest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index),
    }));
  };

  const updateTest = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.map((test, i) =>
        i === index ? { ...test, [field]: value } : test
      ),
    }));
  };

  const addTechnology = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTech.trim()) {
      e.preventDefault();
      if (!formData.technologies.includes(newTech.trim())) {
        setFormData((prev) => ({
          ...prev,
          technologies: [...prev.technologies, newTech.trim()],
        }));
      }
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/exercises"
            className="text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Modifier l'exercice</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Titre
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm font-medium">
                Difficulté
              </label>
              <select
                id="difficulty"
                required
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    difficulty: e.target.value as Exercise["difficulty"],
                  }))
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="facile">Débutant</option>
                <option value="moyen">Intermédiaire</option>
                <option value="difficile">Avancé</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Durée estimée
              </label>
              <input
                id="duration"
                type="text"
                required
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration: e.target.value }))
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Technologies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.technologies.map((tech) => (
                  <div
                    key={tech}
                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="hover:text-primary/80"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={addTechnology}
                placeholder="Ajouter une technologie (Entrée pour valider)"
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="instructions" className="text-sm font-medium">
                  Instructions (Markdown)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  {showPreview ? "Éditer" : "Aperçu"}
                </button>
              </div>
              {showPreview ? (
                <div className="prose dark:prose-invert max-w-none p-4 bg-background border border-input rounded-md">
                  <Markdown content={formData.instructions} />
                </div>
              ) : (
                <textarea
                  id="instructions"
                  required
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  placeholder="# Titre de l'exercice

## Description
Décrivez l'exercice ici...

## Objectifs
- Premier objectif
- Deuxième objectif

## Conseils
> Astuce : utilisez le markdown pour formater vos instructions !"
                  rows={10}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="initial_code" className="text-sm font-medium">
                Code initial
              </label>
              <CodeEditor
                code={formData.initial_code}
                onChange={(value: string | undefined) =>
                  setFormData((prev) => ({
                    ...prev,
                    initial_code: value || "",
                  }))
                }
                language="javascript"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tests</h2>
                <button
                  type="button"
                  onClick={addTest}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                >
                  Ajouter un test
                </button>
              </div>
              {formData.tests.map((test, index) => (
                <div
                  key={index}
                  className="space-y-4 p-4 border border-input rounded-md"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">Test #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeTest(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Supprimer
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom du test</label>
                      <input
                        type="text"
                        value={test.name}
                        onChange={(e) =>
                          updateTest(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        value={test.description}
                        onChange={(e) =>
                          updateTest(index, "description", e.target.value)
                        }
                        rows={2}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Code de validation
                      </label>
                      <CodeEditor
                        code={test.validation_code}
                        onChange={(value: string | undefined) =>
                          updateTest(index, "validation_code", value || "")
                        }
                        language="javascript"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Message d'erreur
                      </label>
                      <input
                        type="text"
                        value={test.error_message}
                        onChange={(e) =>
                          updateTest(index, "error_message", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/admin/exercises"
              className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
