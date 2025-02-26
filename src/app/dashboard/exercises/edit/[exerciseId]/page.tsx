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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileCode, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Exercise } from "@/types/database";

export default function EditExercisePage() {
  const { exerciseId } = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "beginner",
    duration: "",
    technologies: [] as string[],
    instructions: "",
    initial_code: "",
    language: "javascript",
  });
  const [techInput, setTechInput] = useState("");

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/exercises/${exerciseId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de l'exercice");
        }
        const data = await response.json();
        setExercise(data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          difficulty: data.difficulty || "beginner",
          duration: data.duration || "",
          technologies: data.technologies || [],
          instructions: data.instructions || "",
          initial_code: data.initial_code || "",
          language: data.language || "javascript",
        });
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger l'exercice");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'exercice");
      }

      toast.success("Exercice mis à jour avec succès");
      router.push("/dashboard/exercises");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de mettre à jour l'exercice");
    } finally {
      setSaving(false);
    }
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()],
      });
      setTechInput("");
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((t) => t !== tech),
    });
  };

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/exercises">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <Heading as="h1" size="h1" className="mb-2">
                Modifier l'exercice
              </Heading>
              <Paragraph className="text-muted-foreground">
                Modifiez les informations de l'exercice existant.
              </Paragraph>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : !exercise ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Exercice non trouvé
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 border-violet-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileCode className="h-8 w-8 text-violet-500" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Informations de l'exercice
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Modifiez les informations de base de l'exercice.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre de l'exercice *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="ex: Manipulation des tableaux en JavaScript"
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
                        placeholder="Décrivez l'exercice et ses objectifs..."
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
                          <SelectItem value="beginner">Débutant</SelectItem>
                          <SelectItem value="intermediate">
                            Intermédiaire
                          </SelectItem>
                          <SelectItem value="advanced">Avancé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Langage *</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            language: value,
                          }))
                        }
                      >
                        <SelectTrigger className="max-w-xl">
                          <SelectValue placeholder="Sélectionnez un langage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="technologies">Technologies</Label>
                      <div className="flex gap-2 max-w-xl">
                        <Input
                          id="technologies"
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          placeholder="ex: React"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addTechnology}
                        >
                          Ajouter
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.technologies.map((tech, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 bg-violet-100/10 text-violet-400 rounded-full"
                          >
                            <span className="text-sm">{tech}</span>
                            <button
                              type="button"
                              className="text-violet-400 hover:text-violet-300"
                              onClick={() => removeTechnology(tech)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">
                        Durée estimée (en minutes) *
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
                        placeholder="ex: 30"
                        className="max-w-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instructions">Instructions *</Label>
                      <Textarea
                        id="instructions"
                        value={formData.instructions}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            instructions: e.target.value,
                          }))
                        }
                        placeholder="Instructions détaillées pour l'exercice..."
                        className="max-w-xl h-32"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="initial_code">Code initial *</Label>
                      <Textarea
                        id="initial_code"
                        value={formData.initial_code}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            initial_code: e.target.value,
                          }))
                        }
                        placeholder="Code de départ pour l'exercice..."
                        className="max-w-xl h-32 font-mono"
                        required
                      />
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
                    <Link href="/dashboard/exercises">
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
