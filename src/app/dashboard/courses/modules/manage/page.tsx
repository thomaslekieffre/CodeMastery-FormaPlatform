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

export default function ManageModulePage() {
  const { moduleId } = useParams();
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
    order: 0,
    course_id: "",
  });

  useEffect(() => {
    if (moduleId) {
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
      const method = moduleId ? "PUT" : "POST";
      const url = moduleId ? `/api/modules/${moduleId}` : "/api/modules";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(module),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      toast.success("Module sauvegardé avec succès");
      if (!moduleId) {
        router.push("/dashboard/courses/modules");
      }
    } catch (error) {
      toast.error("Impossible de sauvegarder le module");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
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
              {moduleId ? "Modifier le module" : "Créer un module"}
            </Heading>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de module</label>
                <Select
                  value={module.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
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
                  placeholder="Titre du module"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={module.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Description du module"
                />
              </div>

              {module.type === "video" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL YouTube</label>
                  <Input
                    value={module.video_url}
                    onChange={(e) => handleChange("video_url", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Collez l'URL de la vidéo YouTube (format watch ou share)
                  </p>
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
                    placeholder="ID de l'exercice"
                  />
                </div>
              )}

              {module.type === "article" && (
                <div className="space-y-4">
                  <Tabs defaultValue="edit">
                    <TabsList>
                      <TabsTrigger value="edit">Éditer</TabsTrigger>
                      <TabsTrigger value="preview">Aperçu</TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="space-y-2">
                      <label className="text-sm font-medium">Contenu</label>
                      <Textarea
                        value={module.content}
                        onChange={(e) =>
                          handleChange("content", e.target.value)
                        }
                        placeholder="Contenu en Markdown..."
                        className="min-h-[400px] font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Utilisez la syntaxe Markdown pour formater le contenu.
                        Voir la documentation pour plus d'informations.
                      </p>
                    </TabsContent>

                    <TabsContent value="preview">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="prose prose-slate dark:prose-invert max-w-none">
                            <MarkdownRenderer content={module.content || ""} />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Ordre d'affichage</label>
                <Input
                  type="number"
                  value={module.order}
                  onChange={(e) => handleChange("order", e.target.value)}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </Container>
  );
}
