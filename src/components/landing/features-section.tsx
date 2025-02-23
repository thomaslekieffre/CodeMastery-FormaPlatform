"use client";

import { motion } from "framer-motion";
import { Code, Layout, Users, BookOpen, Trophy, Star } from "lucide-react";

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
    <section className="py-24 bg-background/50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Une formation complète avec les meilleurs outils et ressources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-violet-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
