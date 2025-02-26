"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Module, Course } from "@/types/database";

export default function ManageModulesPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/modules`);
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des modules");
      const data = await response.json();
      setModules(data.modules);
      setCourse(data.course);
    } catch (error) {
      toast.error("Impossible de charger les modules");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) return;

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      toast.success("Module supprimé avec succès");
      fetchModules();
    } catch (error) {
      toast.error("Impossible de supprimer le module");
    }
  };

  const getModuleTypeLabel = (type: string) => {
    switch (type) {
      case "article":
        return "Article";
      case "video":
        return "Vidéo";
      case "exercise":
        return "Exercice";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Container>
        <SectionWrapper>
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500" />
          </div>
        </SectionWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Heading as="h1" size="h1">
                Gérer les modules
              </Heading>
              <p className="text-muted-foreground mt-2">{course?.title}</p>
            </div>
            <Button
              onClick={() =>
                router.push(`/dashboard/courses/${courseId}/modules/manage/new`)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau module
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Ordre</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Aucun module trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    modules
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((module) => (
                        <TableRow key={module.id}>
                          <TableCell>
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell className="font-medium">
                            {module.title}
                          </TableCell>
                          <TableCell>
                            {getModuleTypeLabel(module.type)}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {module.description}
                          </TableCell>
                          <TableCell>{module.sort_order}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(
                                  `/dashboard/courses/${courseId}/modules/manage/${module.id}`
                                )
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(module.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </Container>
  );
}
