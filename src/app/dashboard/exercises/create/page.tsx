"use client";

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
import { FileCode } from "lucide-react";

export default function CreateExercisePage() {
  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div>
            <Heading as="h1" size="h1" className="mb-2">
              Créer un exercice
            </Heading>
            <Paragraph className="text-muted-foreground">
              Créez un nouvel exercice pour vos étudiants.
            </Paragraph>
          </div>

          <Card className="bg-card/50 border-violet-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileCode className="h-8 w-8 text-violet-500" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Informations de l'exercice
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Remplissez les informations de base de votre exercice.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de l'exercice</Label>
                    <Input
                      id="title"
                      placeholder="ex: Manipulation des tableaux en JavaScript"
                      className="max-w-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez l'exercice et ses objectifs..."
                      className="max-w-xl h-32"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Niveau de difficulté</Label>
                    <Select>
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
                    <Label htmlFor="category">Catégorie</Label>
                    <Select>
                      <SelectTrigger className="max-w-xl">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="css">CSS</SelectItem>
                        <SelectItem value="react">React</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée estimée (en minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="ex: 30"
                      className="max-w-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button>Créer l'exercice</Button>
                  <Button variant="outline">Annuler</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </Container>
  );
}
