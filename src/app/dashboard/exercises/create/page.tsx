"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Editor } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
];

const DURATIONS = [
  { value: "15min", label: "15 minutes" },
  { value: "30min", label: "30 minutes" },
  { value: "45min", label: "45 minutes" },
  { value: "1h", label: "1 heure" },
  { value: "1h30", label: "1 heure 30" },
  { value: "2h", label: "2 heures" },
];

interface FormData {
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  technologies: string[];
  instructions: string;
  initial_code: string;
  language: string;
  validation_code: string;
}

export default function CreateExercisePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [techInput, setTechInput] = useState("");
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    difficulty: "beginner",
    duration: "30min",
    technologies: [],
    instructions: "",
    initial_code: "",
    language: "javascript",
    validation_code: "",
  });

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

      // Création de l'exercice via l'API
      const response = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la création de l'exercice"
        );
      }

      toast.success("Exercice créé avec succès");
      router.push("/dashboard/exercises");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de créer l'exercice"
      );
    } finally {
      setSaving(false);
    }
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
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
            <Heading as="h1" size="h1">
              Nouvel exercice
            </Heading>
          </div>

          <Card className="bg-card/50 border-violet-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    Informations de l'exercice
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Remplissez les informations de votre exercice.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="ex: Calculer la moyenne d'un tableau"
                        required
                      />
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
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un langage" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((language) => (
                            <SelectItem
                              key={language.value}
                              value={language.value}
                            >
                              {language.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulté *</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            difficulty: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une difficulté" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTIES.map((difficulty) => (
                            <SelectItem
                              key={difficulty.value}
                              value={difficulty.value}
                            >
                              {difficulty.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Durée estimée *</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            duration: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une durée" />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATIONS.map((duration) => (
                            <SelectItem
                              key={duration.value}
                              value={duration.value}
                            >
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      placeholder="Décrivez brièvement l'exercice..."
                      className="h-32"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Technologies</Label>
                    <div className="flex gap-2">
                      <Input
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        placeholder="ex: React, Node.js, etc."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTechnology();
                          }
                        }}
                      />
                      <Button type="button" onClick={addTechnology}>
                        Ajouter
                      </Button>
                    </div>
                    {formData.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.technologies.map((tech) => (
                          <div
                            key={tech}
                            className="flex items-center gap-1 px-2 py-1 text-sm bg-violet-500/10 text-violet-500 rounded-md"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeTechnology(tech)}
                              className="text-violet-500 hover:text-violet-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Instructions *</Label>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList>
                        <TabsTrigger value="write">Écrire</TabsTrigger>
                        <TabsTrigger value="preview">Aperçu</TabsTrigger>
                      </TabsList>
                      <TabsContent value="write">
                        <Textarea
                          value={formData.instructions}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              instructions: e.target.value,
                            }))
                          }
                          placeholder="Écrivez les instructions en Markdown..."
                          className="h-64 font-mono"
                          required
                        />
                      </TabsContent>
                      <TabsContent
                        value="preview"
                        className="min-h-[16rem] p-4 border rounded-md"
                      >
                        <div className="prose dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formData.instructions}
                          </ReactMarkdown>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <Label>Code initial *</Label>
                    <div className="border rounded-md">
                      <Editor
                        height="200px"
                        defaultLanguage={formData.language}
                        language={formData.language}
                        value={formData.initial_code}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            initial_code: value || "",
                          }))
                        }
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tests *</Label>
                    <div className="border rounded-md">
                      <Editor
                        height="200px"
                        defaultLanguage={formData.language}
                        language={formData.language}
                        value={formData.validation_code}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            validation_code: value || "",
                          }))
                        }
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                        Création en cours...
                      </>
                    ) : (
                      "Créer l'exercice"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/exercises")}
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
