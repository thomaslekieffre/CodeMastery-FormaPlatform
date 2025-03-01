"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/types/database";

export default function EditCoursePage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    duration: "",
    difficulty: "facile",
    sort_order: 0,
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
        setFormData({
          title: course.title || "",
          description: course.description || "",
          image_url: course.image_url || "",
          duration: course.duration || "",
          difficulty: course.difficulty || "facile",
          sort_order: course.sort_order || 0,
        });
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

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSaving(true);
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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du cours");
      }

      toast.success("Cours mis à jour avec succès");
      router.push("/dashboard/courses");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de mettre à jour le cours");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <Heading as="h1" size="h1" className="mb-2">
                Modifier le cours
              </Heading>
              <Paragraph className="text-muted-foreground">
                Modifiez les informations du cours existant.
              </Paragraph>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : !course ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Cours non trouvé
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 border-violet-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Edit className="h-8 w-8 text-violet-500" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Informations du cours
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Modifiez les informations de base du cours.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre du cours *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="ex: Introduction à JavaScript"
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
                        placeholder="Décrivez votre cours en quelques phrases..."
                        className="max-w-xl h-32"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url">URL de l'image</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            image_url: e.target.value,
                          }))
                        }
                        placeholder="https://example.com/image.jpg"
                        className="max-w-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">
                        Durée estimée (en heures) *
                      </Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            duration: e.target.value,
                          }))
                        }
                        placeholder="ex: 10"
                        className="max-w-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Niveau de difficulté *</Label>
                      <select
                        id="difficulty"
                        value={formData.difficulty}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            difficulty: e.target.value,
                          }))
                        }
                        className="w-full max-w-xl rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="facile">Facile</option>
                        <option value="moyen">Moyen</option>
                        <option value="difficile">Difficile</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enregistrer les modifications
                        </>
                      )}
                    </Button>
                    <Link href="/dashboard/courses">
                      <Button variant="outline">Annuler</Button>
                    </Link>
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
