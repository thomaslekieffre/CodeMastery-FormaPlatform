"use client";

import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Sun, Moon, Bell, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/store/use-settings-store";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { notifications, animations, setNotifications, setAnimations } =
    useSettingsStore();

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
            {/* Apparence */}
            <Card variant="elevated" className="border-violet-500/20">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Sun className="h-6 w-6 text-violet-500 dark:hidden" />
                  <Moon className="h-6 w-6 text-violet-500 hidden dark:block" />
                </div>
                <div>
                  <CardTitle>Apparence</CardTitle>
                  <Paragraph size="sm" className="text-gray-400">
                    Personnalisez l'apparence de l'application
                  </Paragraph>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Mode sombre</Label>
                    <Paragraph size="sm" className="text-gray-400">
                      Basculer entre le mode clair et sombre
                    </Paragraph>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) =>
                      setTheme(checked ? "dark" : "light")
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card variant="elevated" className="border-violet-500/20">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <Paragraph size="sm" className="text-gray-400">
                    Gérez vos préférences de notifications
                  </Paragraph>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notifications push</Label>
                    <Paragraph size="sm" className="text-gray-400">
                      Recevoir des notifications push
                    </Paragraph>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Accessibilité */}
            <Card variant="elevated" className="border-violet-500/20">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <CardTitle>Accessibilité</CardTitle>
                  <Paragraph size="sm" className="text-gray-400">
                    Paramètres d'accessibilité et d'animations
                  </Paragraph>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Animations</Label>
                    <Paragraph size="sm" className="text-gray-400">
                      Activer/désactiver les animations de l'interface
                    </Paragraph>
                  </div>
                  <Switch
                    checked={animations}
                    onCheckedChange={setAnimations}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SectionWrapper>
    </Container>
  );
}
