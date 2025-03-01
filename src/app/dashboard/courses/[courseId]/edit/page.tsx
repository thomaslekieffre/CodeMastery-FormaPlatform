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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Course } from "@/types/database";

interface CourseFormData {
  title: string;
  description: string;
  image_url: string;
  difficulty: "facile" | "intermediaire" | "avance";
  duration: string;
  sort_order: number;
}

export default function EditCoursePage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    image_url: "",
    difficulty: "facile",
    duration: "",
    sort_order: 0,
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();
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

        const data = await response.json();
        setCourse(data.course);
        setFormData({
          title: data.course.title,
          description: data.course.description,
          image_url: data.course.image_url,
          difficulty: data.course.difficulty,
          duration: data.course.duration,
          sort_order: data.course.sort_order,
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

  const handleSave = async () => {
    if (!course) return;

    try {
      setSaving(true);
      const supabase = createClientComponentClient();
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
        body: JSON.stringify({
          ...course,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      toast.success("Cours sauvegardé avec succès");
      router.push("/dashboard/courses");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de sauvegarder le cours");
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

  if (!course) {
    return (
      <Container>
        <SectionWrapper>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Cours non trouvé</h1>
            <p className="text-muted-foreground">
              Le cours que vous recherchez n'existe pas.
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
            <Link href="/dashboard/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <Heading as="h1" size="h1" className="mb-2">
                Modifier le cours
              </Heading>
              <p className="text-muted-foreground">{course.title}</p>
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

                <div>
                  <label
                    htmlFor="image_url"
                    className="block text-sm font-medium mb-2"
                  >
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="difficulty"
                    className="block text-sm font-medium mb-2"
                  >
                    Difficulté
                  </label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        difficulty: e.target
                          .value as CourseFormData["difficulty"],
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2"
                    required
                  >
                    <option value="facile">Facile</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium mb-2"
                  >
                    Durée
                  </label>
                  <input
                    type="text"
                    id="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    placeholder="ex: 2h30"
                    className="w-full rounded-md border bg-background px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="sort_order"
                    className="block text-sm font-medium mb-2"
                  >
                    Ordre
                  </label>
                  <input
                    type="number"
                    id="sort_order"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sort_order: parseInt(e.target.value),
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/dashboard/courses">
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
