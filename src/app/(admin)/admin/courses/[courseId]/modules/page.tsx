"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash, GripVertical } from "lucide-react";
import type { Course, Module } from "@/types/database";

export default function CourseModulesPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du parcours");
        }
        const data = await response.json();
        setCourse(data);
        setModules(data.modules || []);
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

    fetchData();
  }, [courseId]);

  const handleDelete = async (moduleId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setModules((prev) => prev.filter((module) => module.id !== moduleId));
    } catch (err) {
      console.error("Erreur lors de la suppression du module:", err);
      alert("Une erreur est survenue lors de la suppression du module.");
    }
  };

  const handleReorder = async (draggedId: string, targetId: string) => {
    const draggedIndex = modules.findIndex((m) => m.id === draggedId);
    const targetIndex = modules.findIndex((m) => m.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newModules = [...modules];
    const [draggedModule] = newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, draggedModule);

    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order: index,
    }));

    setModules(updatedModules);

    try {
      const response = await fetch(`/api/courses/${courseId}/modules/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modules: updatedModules }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la réorganisation");
      }
    } catch (err) {
      console.error("Erreur lors de la réorganisation des modules:", err);
      alert("Une erreur est survenue lors de la réorganisation des modules.");
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container py-10">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error || "Parcours non trouvé"}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Link
        href="/admin/courses"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux parcours
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="mt-2 text-muted-foreground">{course.description}</p>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Modules du parcours</h2>
        <Link
          href={`/admin/courses/${courseId}/modules/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nouveau module
        </Link>
      </div>

      <div className="space-y-4">
        {modules.map((module) => (
          <div
            key={module.id}
            className="flex items-center justify-between rounded-lg border bg-card p-4"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("moduleId", module.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const draggedId = e.dataTransfer.getData("moduleId");
              handleReorder(draggedId, module.id);
            }}
          >
            <div className="flex items-center gap-4">
              <button className="cursor-move">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </button>
              <div>
                <h3 className="font-semibold">{module.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/courses/${courseId}/modules/${module.id}/edit`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Modifier</span>
              </Link>
              <button
                onClick={() => handleDelete(module.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Supprimer</span>
              </button>
            </div>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="font-semibold">Aucun module</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Commencez par créer votre premier module
            </p>
            <Link
              href={`/admin/courses/${courseId}/modules/new`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Nouveau module
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
