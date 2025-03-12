"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Course } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  is_free: boolean;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  difficulty: "facile",
  duration: "2h",
  image_url: "",
  sort_order: 0,
  is_free: false,
};

export function CourseForm({ initialData, mode }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    difficulty: initialData?.difficulty || "facile",
    duration: initialData?.duration || "",
    image_url: initialData?.image_url || "",
    sort_order: initialData?.sort_order || 0,
    is_free: initialData?.is_free || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Titre du cours"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description du cours"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulté</Label>
              <Select
                name="difficulty"
                value={formData.difficulty}
                onValueChange={(value) =>
                  handleChange({
                    target: { name: "difficulty", value },
                  } as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la difficulté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facile">Facile</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="difficile">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée estimée</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="ex: 2h30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de l'image</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Ordre d'affichage</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_free"
                name="is_free"
                checked={formData.is_free}
                onChange={(e) =>
                  handleChange({
                    target: { name: "is_free", value: e.target.checked },
                  } as any)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_free">Cours gratuit</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-current" />
                  <span>Enregistrement...</span>
                </div>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
