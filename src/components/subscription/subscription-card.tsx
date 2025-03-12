"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { supabase } from "@/lib/supabase/client";

interface Subscription {
  status: "active" | "inactive";
  current_period_end: string;
}

export function SubscriptionCard() {
  const { user } = useAppStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        if (!user?.id) {
          console.log("Pas d'utilisateur connecté");
          setLoading(false);
          return;
        }

        console.log(
          "Récupération de l'abonnement pour l'utilisateur:",
          user.id
        );

        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          console.log("Pas de session active");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_subscriptions")
          .select("status, current_period_end")
          .eq("user_id", user.id)
          .eq("status", "active")
          .gte("current_period_end", new Date().toISOString())
          .single();

        console.log("Résultat de la requête:", { data, error });

        if (error) {
          if (error.code === "PGRST116") {
            console.log("Pas d'abonnement trouvé");
            setSubscription(null);
          } else {
            console.error("Erreur lors de la récupération de l'abonnement:", {
              code: error.code,
              message: error.message,
              details: error.details,
            });
          }
        } else {
          console.log("Abonnement trouvé:", data);
          setSubscription(data);
        }
      } catch (error) {
        console.error("Erreur inattendue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-2/3 bg-muted rounded"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-violet-500" />
          <div>
            <h3 className="text-lg font-semibold">Abonnement Premium</h3>
            <p className="text-sm text-muted-foreground">
              {subscription
                ? "Accédez à tous les cours premium"
                : "Débloquez tous les cours premium"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Votre abonnement est actif jusqu'au{" "}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
            <Button className="w-full" disabled>
              Abonné
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Accédez à tous les cours premium pour seulement 9.99€/mois
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-violet-500" />
                  Accès à tous les cours
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-violet-500" />
                  Support prioritaire
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-violet-500" />
                  Certificats de complétion
                </li>
              </ul>
            </div>
            <Button className="w-full" onClick={() => alert("À implémenter")}>
              S'abonner
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
