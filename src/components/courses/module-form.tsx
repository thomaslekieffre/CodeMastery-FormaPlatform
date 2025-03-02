"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Module } from "@/types/database";

interface ModuleFormProps {
  courseId: string;
  initialData?: Module;
  mode: "create" | "edit";
}

export function ModuleForm({ courseId, initialData, mode }: ModuleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Module>>(
    initialData || {
      course_id: courseId,
      title: "",
      description: "",
      content: "",
      type: "article",
      order: 0,
      exercise_id: null,
      video_url: null,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        mode === "create" ? "/api/modules" : `/api/modules/${initialData?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      router.push(`/admin/courses/${courseId}/modules`);
      router.refresh();
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <Link
        href={`/admin/courses/${courseId}/modules`}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux modules
      </Link>

      <h1 className="mb-8 text-3xl font-bold">
        {mode === "create" ? "Nouveau module" : "Modifier le module"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="text-sm font-medium text-foreground"
              >
                Titre
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev: Module) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev: Module) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="text-sm font-medium text-foreground"
              >
                Type de module
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev: Module) => ({
                    ...prev,
                    type: e.target.value as Module["type"],
                    exercise_id: null,
                    video_url: null,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                required
              >
                <option value="article">Article</option>
                <option value="video">Vidéo</option>
                <option value="exercise">Exercice</option>
              </select>
            </div>

            {formData.type === "video" && (
              <div>
                <label
                  htmlFor="video_url"
                  className="text-sm font-medium text-foreground"
                >
                  URL de la vidéo
                </label>
                <input
                  type="url"
                  id="video_url"
                  value={formData.video_url || ""}
                  onChange={(e) =>
                    setFormData((prev: Module) => ({
                      ...prev,
                      video_url: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  required
                />
              </div>
            )}

            <div>
              <label
                htmlFor="content"
                className="text-sm font-medium text-foreground"
              >
                Contenu (Markdown)
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev: Module) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                rows={10}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="order"
                className="text-sm font-medium text-foreground"
              >
                Ordre d'affichage
              </label>
              <input
                type="number"
                id="order"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev: Module) => ({
                    ...prev,
                    order: parseInt(e.target.value),
                  }))
                }
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                required
              />
            </div>
          </div>

          <div className="space-y-6">
            {formData.type === "video" && formData.video_url && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Aperçu de la vidéo
                </p>
                <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
                  <iframe
                    src={formData.video_url}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading
              ? "Enregistrement..."
              : mode === "create"
              ? "Créer le module"
              : "Enregistrer les modifications"}
          </button>
          <Link
            href={`/admin/courses/${courseId}/modules`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
