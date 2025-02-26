"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import type { Module } from "@/types/database";

export default function EditModulePage() {
  const { courseId, moduleId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [module, setModule] = useState<Partial<Module>>({
    title: "",
    description: "",
    content: "",
    type: "article",
    video_url: "",
    exercise_id: "",
    sort_order: 0,
    course_id: courseId as string,
  });

  useEffect(() => {
    if (moduleId && moduleId !== "new") {
      fetchModule();
    } else {
      setLoading(false);
    }
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`);
      if (!response.ok)
        throw new Error("Erreur lors de la récupération du module");
      const data = await response.json();
      setModule(data.module);
    } catch (error) {
      toast.error("Impossible de charger le module");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = moduleId && moduleId !== "new" ? "PUT" : "POST";
      const url =
        moduleId && moduleId !== "new"
          ? `/api/modules/${moduleId}`
          : "/api/modules";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(module),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      toast.success("Module sauvegardé avec succès");
      router.push(`/dashboard/courses/${courseId}/modules/manage`);
    } catch (error) {
      toast.error("Impossible de sauvegarder le module");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setModule((prev) => ({ ...prev, [field]: value }));
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
            <Heading as="h1" size="h1">
              {moduleId && moduleId !== "new"
                ? "Modifier le module"
                : "Créer un module"}
            </Heading>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/dashboard/courses/${courseId}/modules/manage`)
                }
              >
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de module</label>
                  <Select
                    value={module.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="video">Vidéo</SelectItem>
                      <SelectItem value="exercise">Exercice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input
                    value={module.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={module.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                </div>
              </div>

              {module.type === "article" && (
                <div className="space-y-4">
                  <Tabs defaultValue="edit">
                    <TabsList>
                      <TabsTrigger value="edit">Éditer</TabsTrigger>
                      <TabsTrigger value="preview">Aperçu</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <Textarea
                        value={module.content}
                        onChange={(e) =>
                          handleChange("content", e.target.value)
                        }
                        className="min-h-[400px] font-mono"
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <Card>
                        <CardContent>
                          <MarkdownRenderer content={module.content || ""} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {module.type === "video" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL YouTube</label>
                    <Input
                      value={module.video_url}
                      onChange={(e) =>
                        handleChange("video_url", e.target.value)
                      }
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <Tabs defaultValue="edit">
                    <TabsList>
                      <TabsTrigger value="edit">
                        Contenu additionnel
                      </TabsTrigger>
                      <TabsTrigger value="preview">Aperçu</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <Textarea
                        value={module.content}
                        onChange={(e) =>
                          handleChange("content", e.target.value)
                        }
                        className="min-h-[400px] font-mono"
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <Card>
                        <CardContent>
                          <MarkdownRenderer content={module.content || ""} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {module.type === "exercise" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    ID de l'exercice
                  </label>
                  <Input
                    value={module.exercise_id}
                    onChange={(e) =>
                      handleChange("exercise_id", e.target.value)
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Ordre d'affichage</label>
                <Input
                  type="number"
                  value={module.sort_order}
                  onChange={(e) =>
                    handleChange("sort_order", parseInt(e.target.value))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </Container>
  );
}
