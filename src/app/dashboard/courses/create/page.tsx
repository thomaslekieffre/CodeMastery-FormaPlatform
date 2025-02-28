"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormData {
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  image_url: string;
  sort_order: number;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  difficulty: "facile",
  duration: "",
  image_url: "",
  sort_order: 0,
};

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du cours");
      }

      toast.success("Cours créé avec succès");
      router.push("/dashboard/courses");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de créer le cours");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div>
            <Heading as="h1" size="h1" className="mb-2">
              Créer un nouveau cours
            </Heading>
            <Paragraph className="text-muted-foreground">
              Créez un nouveau cours pour vos étudiants.
            </Paragraph>
          </div>

          <Card className="bg-card/50 border-violet-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <PlusCircle className="h-8 w-8 text-violet-500" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Informations du cours
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Remplissez les informations de base de votre cours.
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
                    <Label htmlFor="difficulty">Niveau de difficulté *</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          difficulty: value,
                        }))
                      }
                    >
                      <SelectTrigger className="max-w-xl">
                        <SelectValue placeholder="Sélectionnez un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facile">Débutant</SelectItem>
                        <SelectItem value="intermediaire">
                          Intermédiaire
                        </SelectItem>
                        <SelectItem value="avance">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
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
                      placeholder="ex: 10h"
                      className="max-w-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image du cours (URL)</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          image_url: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="max-w-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Ordre d'affichage</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sort_order: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                      className="max-w-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                        Création en cours...
                      </>
                    ) : (
                      "Créer le cours"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/courses")}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </Container>
  );
}
