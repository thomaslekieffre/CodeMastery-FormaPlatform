"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import Editor from "@monaco-editor/react";
import type { Module } from "@/types/database";

interface ModuleFormData {
  title: string;
  description: string;
  content?: string;
  video_url?: string;
  exercise_id?: string;
}

export default function EditModulePage() {
  const { courseId, moduleId } = useParams();
  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ModuleFormData>({
    title: "",
    description: "",
  });

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/modules/${moduleId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du module");
        }
        const data = await response.json();
        console.log("Module reçu:", JSON.stringify(data, null, 2));
        const moduleData = data.module;
        setModule(moduleData);

        const initialFormData: ModuleFormData = {
          title: moduleData.title,
          description: moduleData.description,
        };

        if (moduleData.type === "article") {
          initialFormData.content = moduleData.content;
        } else if (moduleData.type === "video") {
          initialFormData.video_url = moduleData.video_url;
          initialFormData.content = moduleData.content;
        } else if (moduleData.type === "exercise") {
          initialFormData.exercise_id = moduleData.exercise_id;
        }

        setFormData(initialFormData);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger le module");
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  const handleSave = async () => {
    if (!module) return;

    try {
      setSaving(true);

      const dataToSend = {
        ...module,
        title: formData.title,
        description: formData.description,
      };

      if (module.type === "article" && formData.content) {
        dataToSend.content = formData.content;
      } else if (module.type === "video") {
        if (formData.content) dataToSend.content = formData.content;
        if (formData.video_url) dataToSend.video_url = formData.video_url;
      } else if (module.type === "exercise" && formData.exercise_id) {
        dataToSend.exercise_id = formData.exercise_id;
      }

      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      toast.success("Module sauvegardé avec succès");
      router.push(`/dashboard/courses/${courseId}/modules/manage`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de sauvegarder le module");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <SectionWrapper>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-muted rounded"></div>
            <div className="h-[500px] w-full bg-muted rounded-lg"></div>
          </div>
        </SectionWrapper>
      </Container>
    );
  }

  if (!module) {
    return (
      <Container>
        <SectionWrapper>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Module non trouvé</h1>
            <p className="text-muted-foreground">
              Le module que vous recherchez n'existe pas.
            </p>
          </div>
        </SectionWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/courses/${courseId}/modules/manage`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <Heading as="h1" size="h1" className="mb-2">
                Modifier le module
              </Heading>
              <p className="text-muted-foreground">{module.title}</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-2"
                  >
                    Titre
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-2"
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
                    rows={3}
                    required
                  />
                </div>

                {module.type === "article" ? (
                  <div className="space-y-4">
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList>
                        <TabsTrigger value="edit">Éditer le cours</TabsTrigger>
                        <TabsTrigger value="preview">Aperçu</TabsTrigger>
                      </TabsList>

                      <TabsContent value="edit" className="min-h-[500px]">
                        <Editor
                          height="500px"
                          defaultLanguage="markdown"
                          value={formData.content || ""}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              content: value || "",
                            }))
                          }
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: "on",
                          }}
                        />
                      </TabsContent>

                      <TabsContent value="preview">
                        <div className="border rounded-md p-4 min-h-[500px] prose prose-violet dark:prose-invert max-w-none">
                          <MarkdownRenderer content={formData.content || ""} />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : module.type === "video" ? (
                  <div className="space-y-4">
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList>
                        <TabsTrigger value="edit">Éditer le cours</TabsTrigger>
                        <TabsTrigger value="preview">Aperçu</TabsTrigger>
                      </TabsList>

                      <TabsContent value="edit" className="min-h-[500px]">
                        <Editor
                          height="500px"
                          defaultLanguage="markdown"
                          value={formData.content || ""}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              content: value || "",
                            }))
                          }
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: "on",
                          }}
                        />
                      </TabsContent>

                      <TabsContent value="preview">
                        <div className="border rounded-md p-4 min-h-[500px] prose prose-violet dark:prose-invert max-w-none">
                          <MarkdownRenderer content={formData.content || ""} />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div>
                      <label
                        htmlFor="video_url"
                        className="block text-sm font-medium mb-2"
                      >
                        URL de la vidéo
                      </label>
                      <input
                        type="url"
                        id="video_url"
                        value={formData.video_url || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            video_url: e.target.value,
                          }))
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full rounded-md border bg-background px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                ) : module.type === "exercise" ? (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="exercise_id"
                        className="block text-sm font-medium mb-2"
                      >
                        ID de l'exercice
                      </label>
                      <input
                        type="text"
                        id="exercise_id"
                        value={formData.exercise_id || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            exercise_id: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border bg-background px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end gap-4">
                <Link href={`/dashboard/courses/${courseId}/modules/manage`}>
                  <Button variant="outline">Annuler</Button>
                </Link>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </Container>
  );
}
