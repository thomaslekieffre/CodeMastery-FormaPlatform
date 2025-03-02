"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  PlayCircle,
  Plus,
  Trash2,
  Edit,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Course, Module } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const getModuleIcon = (type: string) => {
  switch (type) {
    case "video":
      return PlayCircle;
    case "article":
      return FileText;
    default:
      return BookOpen;
  }
};

interface SortableModuleItemProps {
  module: Module;
  onDelete: (id: string) => void;
}

function SortableModuleItem({ module, onDelete }: SortableModuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getModuleIcon(module.type);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="bg-card/50 border-violet-500/20"
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <button
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Icon className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h3 className="font-medium">{module.title}</h3>
            <p className="text-sm text-muted-foreground">
              {module.type === "video" ? "Vidéo" : "Article"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/courses/${module.course_id}/modules/edit/${module.id}`}
          >
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(module.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManageModulesPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchCourseAndModules = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error("Vous devez être connecté");
          router.push("/login");
          return;
        }

        const [courseRes, modulesRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }),
          fetch(`/api/courses/${courseId}/modules`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }),
        ]);

        if (!courseRes.ok || !modulesRes.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const [{ course }, { modules }] = await Promise.all([
          courseRes.json(),
          modulesRes.json(),
        ]);

        setCourse(course);
        setModules(modules);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndModules();
  }, [courseId, router]);

  const handleDelete = async (moduleId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) return;

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Vous devez être connecté");
        return;
      }

      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      toast.success("Module supprimé avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de supprimer le module");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Mettre à jour l'ordre sur le serveur
        const updateOrder = async () => {
          try {
            const supabase = createClient();
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
              toast.error("Vous devez être connecté");
              return;
            }

            const response = await fetch(
              `/api/courses/${courseId}/modules/reorder`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  modules: newItems.map((item, index) => ({
                    id: item.id,
                    order: index,
                  })),
                }),
              }
            );

            if (!response.ok) {
              throw new Error("Erreur lors de la réorganisation");
            }
          } catch (error) {
            console.error("Erreur lors de la réorganisation:", error);
            toast.error("Impossible de sauvegarder l'ordre des modules");
          }
        };

        updateOrder();
        return newItems;
      });
    }
  };

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/courses/${courseId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <Heading as="h1" size="h1" className="mb-2">
                Gérer les modules
              </Heading>
              <Paragraph className="text-muted-foreground">
                {course?.title || "Chargement..."}
              </Paragraph>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Modules du cours</h2>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/courses/${courseId}/modules/create?type=article`}
                  >
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Article
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/courses/${courseId}/modules/create?type=video`}
                  >
                    <Button>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Vidéo
                    </Button>
                  </Link>
                </div>
              </div>

              {modules.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      Aucun module n'a encore été créé pour ce cours.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={modules}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {modules.map((module) => (
                        <SortableModuleItem
                          key={module.id}
                          module={module}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
        </div>
      </SectionWrapper>
    </Container>
  );
}
