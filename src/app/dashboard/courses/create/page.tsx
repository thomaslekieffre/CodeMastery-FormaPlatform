"use client";

import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export default function CreateCoursePage() {
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
              <form className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre du cours</Label>
                    <Input
                      id="title"
                      placeholder="ex: Introduction à JavaScript"
                      className="max-w-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre cours en quelques phrases..."
                      className="max-w-xl h-32"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée estimée (en heures)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="ex: 10"
                      className="max-w-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button>Créer le cours</Button>
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
