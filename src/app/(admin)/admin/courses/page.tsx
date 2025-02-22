"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash, GripVertical } from "lucide-react";
import { getCourses } from "@/lib/queries";
import type { Course } from "@/types/database";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
      } catch (err) {
        console.error("Erreur lors du chargement des parcours:", err);
        setError("Une erreur est survenue lors du chargement des parcours.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (courseId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce parcours ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (err) {
      console.error("Erreur lors de la suppression du parcours:", err);
      alert("Une erreur est survenue lors de la suppression du parcours.");
    }
  };

  const handleReorder = async (draggedId: string, targetId: string) => {
    const draggedIndex = courses.findIndex((c) => c.id === draggedId);
    const targetIndex = courses.findIndex((c) => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newCourses = [...courses];
    const [draggedCourse] = newCourses.splice(draggedIndex, 1);
    newCourses.splice(targetIndex, 0, draggedCourse);

    const updatedCourses = newCourses.map((course, index) => ({
      ...course,
      sort_order: index,
    }));

    setCourses(updatedCourses);

    try {
      const response = await fetch(`/api/courses/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courses: updatedCourses }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la réorganisation");
      }
    } catch (err) {
      console.error("Erreur lors de la réorganisation des parcours:", err);
      alert("Une erreur est survenue lors de la réorganisation des parcours.");
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

  if (error) {
    return (
      <div className="container py-10">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des parcours</h1>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nouveau parcours
        </Link>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between rounded-lg border bg-card p-4"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("courseId", course.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const draggedId = e.dataTransfer.getData("courseId");
              handleReorder(draggedId, course.id);
            }}
          >
            <div className="flex items-center gap-4">
              <button className="cursor-move">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </button>
              <div>
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {course.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/courses/${course.id}/modules`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Gérer les modules</span>
              </Link>
              <Link
                href={`/admin/courses/${course.id}/edit`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Modifier</span>
              </Link>
              <button
                onClick={() => handleDelete(course.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Supprimer</span>
              </button>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="font-semibold">Aucun parcours</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Commencez par créer votre premier parcours
            </p>
            <Link
              href="/admin/courses/new"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Nouveau parcours
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
