"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, Code, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Course } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

interface FormData {
  title: string;
  description: string;
  type: "article" | "video" | "exercise";
  content?: string;
  video_url?: string;
  exercise_id?: string;
}

export default function CreateModulePage() {
  const { courseId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleType = searchParams.get("type") as
    | "article"
    | "video"
    | "exercise";
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    type: moduleType || "article",
    content: "",
    video_url: "",
    exercise_id: "",
  });

  useEffect(() => {
    const fetchCourse = async () => {
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

        const response = await fetch(`/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du cours");
        }
        const { course } = await response.json();
        setCourse(course);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger le cours");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Vous devez être connecté");
        return;
      }

      // Nettoyage des données selon le type
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        content: "", // Valeur par défaut pour satisfaire la contrainte not-null
      } as FormData;

      if (formData.type === "article" && formData.content) {
        dataToSend.content = formData.content;
      } else if (formData.type === "video" && formData.video_url) {
        dataToSend.video_url = formData.video_url;
        dataToSend.content = formData.video_url; // On utilise l'URL comme contenu pour les vidéos
      } else if (formData.type === "exercise") {
        if (!formData.exercise_id) {
          toast.error("L'ID de l'exercice est requis");
          return;
        }
        // Validation basique du format UUID
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(formData.exercise_id)) {
          toast.error("L'ID de l'exercice n'est pas un UUID valide");
          return;
        }
        dataToSend.exercise_id = formData.exercise_id;
        dataToSend.content = formData.exercise_id; // On utilise l'ID comme contenu pour les exercices
      }

      const response = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du module");
      }

      toast.success("Module créé avec succès");
      router.push(`/dashboard/courses/${courseId}/modules/manage`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de créer le module");
    } finally {
      setSaving(false);
    }
  };

  const getModuleTypeIcon = () => {
    switch (moduleType) {
      case "video":
        return PlayCircle;
      case "exercise":
        return Code;
      default:
        return FileText;
    }
  };

  const getModuleTypeLabel = () => {
    switch (moduleType) {
      case "video":
        return "Vidéo";
      case "exercise":
        return "Exercice";
      default:
        return "Article";
    }
  };

  const Icon = getModuleTypeIcon();

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
                Nouveau module - {getModuleTypeLabel()}
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
            <Card className="bg-card/50 border-violet-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Icon className="h-6 w-6 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Informations du module
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Remplissez les informations de votre module.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre du module *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="ex: Introduction aux variables"
                        className="max-w-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Décrivez le contenu de ce module..."
                        className="max-w-xl h-32"
                        required
                      />
                    </div>

                    {moduleType === "article" && (
                      <div className="space-y-2">
                        <Label htmlFor="content">Contenu de l'article *</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          placeholder="Écrivez votre article en Markdown..."
                          className="max-w-xl h-96 font-mono"
                          required
                        />
                      </div>
                    )}

                    {moduleType === "video" && (
                      <div className="space-y-2">
                        <Label htmlFor="video_url">URL de la vidéo *</Label>
                        <Input
                          id="video_url"
                          type="url"
                          value={formData.video_url}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              video_url: e.target.value,
                            }))
                          }
                          placeholder="https://youtube.com/..."
                          className="max-w-xl"
                          required
                        />
                      </div>
                    )}

                    {moduleType === "exercise" && (
                      <div className="space-y-2">
                        <Label htmlFor="exercise_id">ID de l'exercice *</Label>
                        <Input
                          id="exercise_id"
                          value={formData.exercise_id}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              exercise_id: e.target.value,
                            }))
                          }
                          placeholder="ex: 123e4567-e89b-12d3-a456-426614174000"
                          className="max-w-xl"
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Entrez l'ID de l'exercice créé dans la section
                          Exercices.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                          Création en cours...
                        </>
                      ) : (
                        "Créer le module"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/dashboard/courses/${courseId}/modules/manage`
                        )
                      }
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </SectionWrapper>
    </Container>
  );
}
