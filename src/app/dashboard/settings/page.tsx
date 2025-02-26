"use client";

import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6 py-6">
          <Heading as="h1" size="h1" className="mb-2">
            Paramètres
          </Heading>
          <Paragraph className="text-gray-400 max-w-2xl">
            Configurez vos préférences et paramètres du compte.
          </Paragraph>

          <div className="grid gap-6 mt-8">
            <Card variant="elevated" className="border-violet-500/20">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <CardTitle>Paramètres à venir</CardTitle>
                  <Paragraph size="sm" className="text-gray-400">
                    Cette section est en cours de développement.
                  </Paragraph>
                </div>
              </CardHeader>
              <CardContent>
                <Paragraph>
                  Les paramètres du compte seront bientôt disponibles. Vous
                  pourrez personnaliser votre expérience et gérer vos
                  préférences.
                </Paragraph>
              </CardContent>
            </Card>
          </div>
        </div>
      </SectionWrapper>
    </Container>
  );
}
