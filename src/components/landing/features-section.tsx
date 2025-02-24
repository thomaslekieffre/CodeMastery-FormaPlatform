"use client";

import { motion } from "framer-motion";
import { Code, Layout, Users, BookOpen, Trophy, Star } from "lucide-react";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { cardStyles } from "@/components/ui/card-styles";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Code,
    title: "Projets Concrets",
    description: "Apprenez en construisant de vrais projets professionnels",
  },
  {
    icon: Users,
    title: "Communauté Active",
    description: "Échangez et progressez avec d'autres développeurs",
  },
  {
    icon: BookOpen,
    title: "Cours Structurés",
    description: "Du HTML aux frameworks modernes comme Nuxt.js",
  },
  {
    icon: Trophy,
    title: "Certification",
    description: "Obtenez des certificats reconnus par l'industrie",
  },
  {
    icon: Layout,
    title: "Interface Interactive",
    description: "Environnement de code en direct pour pratiquer",
  },
  {
    icon: Star,
    title: "Mentorat",
    description: "Support personnalisé par des experts",
  },
];

export function FeaturesSection() {
  return (
    <SectionWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Tout ce dont vous avez besoin pour{" "}
          <span className="text-violet-400">réussir</span>
        </h2>
        <p className="text-xl text-gray-400">
          Une formation complète avec les meilleurs outils et ressources
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={cn("p-6", cardStyles.base, cardStyles.hover)}
          >
            <feature.icon className="w-12 h-12 text-violet-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
