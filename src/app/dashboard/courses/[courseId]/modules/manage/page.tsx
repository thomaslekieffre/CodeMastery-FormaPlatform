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
  Code,
  PlayCircle,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Course, Module } from "@/types/database";

export default function ManageModulesPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseAndModules = async () => {
      try {
        setLoading(true);
        const [courseRes, modulesRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch(`/api/courses/${courseId}/modules`),
        ]);

        if (!courseRes.ok || !modulesRes.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const [courseData, modulesData] = await Promise.all([
          courseRes.json(),
          modulesRes.json(),
        ]);

        setCourse(courseData);
        setModules(modulesData);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndModules();
  }, [courseId]);

  const handleDelete = async (moduleId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) return;

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
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

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video":
        return PlayCircle;
      case "article":
        return FileText;
      case "exercise":
        return Code;
      default:
        return BookOpen;
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
                    <Button variant="outline">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Vidéo
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/courses/${courseId}/modules/create?type=exercise`}
                  >
                    <Button>
                      <Code className="mr-2 h-4 w-4" />
                      Exercice
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
                <div className="space-y-4">
                  {modules.map((module) => {
                    const Icon = getModuleIcon(module.type);
                    return (
                      <Card
                        key={module.id}
                        className="bg-card/50 border-violet-500/20"
                      >
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-violet-500/10">
                              <Icon className="h-6 w-6 text-violet-500" />
                            </div>
                            <div>
                              <h3 className="font-medium">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {module.type === "video"
                                  ? "Vidéo"
                                  : module.type === "article"
                                  ? "Article"
                                  : "Exercice"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              href={`/dashboard/courses/${courseId}/modules/edit/${module.id}`}
                            >
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(module.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </SectionWrapper>
    </Container>
  );
}
