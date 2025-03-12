"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { BookOpen, Edit, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useAppStore } from "@/store/use-app-store";
import type { Course } from "@/types/database";
import { supabase } from "@/lib/supabase/client";
import { SubscriptionCard } from "@/components/subscription/subscription-card";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppStore();
  const isAdmin =
    user?.role === "admin" || user?.user_metadata?.role === "admin";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error("Vous devez être connecté");
          return;
        }

        const response = await fetch("/api/courses", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des cours");
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les cours");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Vous devez être connecté");
        return;
      }

      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }

      setCourses((prev) => prev.filter((course) => course.id !== id));
      toast.success("Le cours a été supprimé");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de supprimer le cours");
    }
  };

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Heading as="h1" size="h1" className="mb-2">
                Mes cours
              </Heading>
              <Paragraph className="text-muted-foreground">
                Accédez à tous vos cours et suivez votre progression.
              </Paragraph>
            </div>
            {isAdmin && (
              <Link href="/dashboard/courses/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un cours
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                </div>
              ) : courses.length === 0 ? (
                <Card className="bg-card/50 border-violet-500/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-violet-500" />
                      <div>
                        <h3 className="text-lg font-semibold">
                          Aucun cours disponible
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Il n'y a pas encore de cours disponibles.
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Les cours seront bientôt disponibles. Revenez plus tard
                      pour découvrir notre contenu éducatif.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-violet-500/20 to-violet-700/20 relative">
                        {course.image_url && (
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-violet-500" />
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold">
                            {course.title}
                          </h3>
                          <div className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 text-xs rounded-full">
                            {course.difficulty}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Durée: {course.duration}
                          </span>
                          <div className="flex gap-2">
                            <Link href={`/dashboard/courses/${course.id}`}>
                              <Button variant="outline" size="sm">
                                Voir
                              </Button>
                            </Link>
                            {isAdmin && (
                              <>
                                <Link
                                  href={`/dashboard/courses/edit/${course.id}`}
                                >
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(course.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            <div>
              <SubscriptionCard />
            </div>
          </div>
        </div>
      </SectionWrapper>
    </Container>
  );
}
