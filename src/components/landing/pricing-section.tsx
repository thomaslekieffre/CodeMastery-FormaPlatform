"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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
    <section className="py-24">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-xl border ${
                plan.popular ? "border-violet-500 shadow-lg" : ""
              }`}
            >
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                )}
              </div>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-violet-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-8"
                variant={plan.popular ? "default" : "outline"}
              >
                Choisir {plan.name}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
