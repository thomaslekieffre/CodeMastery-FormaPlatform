"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Course } from "@/types/database";

interface CourseFormProps {
  initialData?: Course;
  mode: "create" | "edit";
}

interface FormData {
  title: string;
  description: string;
  difficulty: Course["difficulty"];
  duration: string;
  image_url: string;
  sort_order: number;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  difficulty: "facile",
  duration: "2h",
  image_url: "",
  sort_order: 0,
};

export function CourseForm({ initialData, mode }: CourseFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(
    initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          difficulty: initialData.difficulty,
          duration: initialData.duration,
          image_url: initialData.image_url || "",
          sort_order: initialData.sort_order,
        }
      : initialFormData
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(
        mode === "create" ? "/api/courses" : `/api/courses/${initialData?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      router.push("/admin/courses");
    } catch (err) {
      console.error("Erreur:", err);
      alert(
        "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-10">
      <Link
        href="/admin/courses"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux parcours
      </Link>

      <h1 className="mb-8 text-3xl font-bold">
        {mode === "create" ? "Nouveau parcours" : "Modifier le parcours"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium">
              Titre
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded-md border bg-background px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2"
              rows={4}
              required
            />
          </div>

          <div>
            <label
              htmlFor="difficulty"
              className="mb-2 block text-sm font-medium"
            >
              Difficulté
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  difficulty: e.target.value as Course["difficulty"],
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2"
              required
            >
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="difficile">Difficile</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="duration"
              className="mb-2 block text-sm font-medium"
            >
              Durée estimée
            </label>
            <input
              type="text"
              id="duration"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duration: e.target.value,
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="image_url"
              className="mb-2 block text-sm font-medium"
            >
              URL de l'image (optionnel)
            </label>
            <input
              type="url"
              id="image_url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  image_url: e.target.value,
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving
              ? "Enregistrement..."
              : mode === "create"
              ? "Créer le parcours"
              : "Enregistrer les modifications"}
          </button>
          <Link
            href="/admin/courses"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
