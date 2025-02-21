"use client";

import { useAppStore } from "@/store/use-app-store";

export default function DashboardPage() {
  const { user } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Bienvenue sur CodeMastery
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold text-lg">Votre progression</h3>
          <p className="text-muted-foreground">
            Continuez votre apprentissage où vous l'aviez laissé.
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold text-lg">Cours disponibles</h3>
          <p className="text-muted-foreground">
            Découvrez nos nouveaux cours et formations.
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold text-lg">Forum</h3>
          <p className="text-muted-foreground">
            Échangez avec la communauté et trouvez de l'aide.
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold text-lg">Exercices</h3>
          <p className="text-muted-foreground">
            Pratiquez et testez vos connaissances.
          </p>
        </div>
      </div>
    </div>
  );
}
