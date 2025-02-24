"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { cardStyles } from "@/components/ui/card-styles";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    features: [
      "Accès aux cours de base",
      "Communauté Discord",
      "Exercices pratiques",
      "Projets guidés",
    ],
  },
  {
    name: "Premium",
    price: "19.99€",
    period: "/mois",
    popular: true,
    features: [
      "Tous les cours avancés",
      "Certificats officiels",
      "Support prioritaire",
      "Sessions de mentorat",
      "Projets professionnels",
      "Ressources exclusives",
    ],
  },
];

export function PricingSection() {
  return (
    <SectionWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Tarifs <span className="text-violet-400">simples</span>
        </h2>
        <p className="text-xl text-gray-400">
          Choisissez le plan qui correspond à vos besoins
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={cn(
              cardStyles.base,
              cardStyles.hover,
              "p-8",
              plan.popular && "border-violet-500/50"
            )}
          >
            <div className="flex justify-between items-baseline mb-8">
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <div className="text-right">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-lg text-gray-400">{plan.period}</span>
                )}
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-gray-400">
                  <Check className="w-5 h-5 text-violet-400 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={cn(
                "w-full",
                plan.popular
                  ? "bg-violet-500 hover:bg-violet-600"
                  : "bg-violet-500/10 hover:bg-violet-500/20"
              )}
            >
              Choisir {plan.name}
            </Button>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
