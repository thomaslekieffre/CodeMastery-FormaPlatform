"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Timer,
  Users,
} from "lucide-react";
import Image from "next/image";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { cardStyles } from "@/components/ui/card-styles";
import { cn } from "@/lib/utils";

const stats = [
  {
    value: "85%",
    label: "Taux d'embauche",
    description: "de nos étudiants trouvent un emploi dans les 3 mois",
    icon: Briefcase,
  },
  {
    value: "2K+",
    label: "Apprenants",
    description: "une communauté active et grandissante",
    icon: Users,
  },
  {
    value: "35K€",
    label: "Salaire junior",
    description: "salaire moyen de nos diplômés",
    icon: GraduationCap,
  },
];

const successStories = [
  {
    name: "Marie L.",
    role: "Frontend Developer @Company",
    image: "https://i.pravatar.cc/150?img=36",
    quote:
      "J'ai commencé de zéro et aujourd'hui je travaille sur des projets React passionnants.",
  },
  {
    name: "Thomas D.",
    role: "Freelance Developer",
    image: "https://i.pravatar.cc/150?img=12",
    quote:
      "La formation m'a donné les compétences pour me lancer en freelance. Je gère maintenant mes propres clients.",
  },
  {
    name: "Sarah K.",
    role: "Full-Stack Developer",
    image: "https://i.pravatar.cc/150?img=23",
    quote:
      "Le focus sur Nuxt.js m'a permis de me démarquer lors des entretiens. Merci CodeMastery !",
  },
];

const projectImages = [
  {
    title: "Clone Twitter",
    image:
      "https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/examples/twitter-clone.png",
    tech: "Next.js • Supabase • TailwindCSS",
  },
  {
    title: "E-commerce",
    image:
      "https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/examples/ecommerce.png",
    tech: "Vue.js • Stripe • Node.js",
  },
  {
    title: "Dashboard Analytics",
    image:
      "https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/examples/dashboard.png",
    tech: "Nuxt.js • Chart.js • MongoDB",
  },
];

export function StatisticsSection() {
  return (
    <SectionWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Des résultats <span className="text-violet-400">prouvés</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Nos étudiants réussissent grâce à une formation pratique et un
          accompagnement personnalisé
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
            className={cn("group", cardStyles.base, cardStyles.hover)}
          >
            <div className="relative bg-[#1A0B2E] backdrop-blur-sm border border-violet-500/10 p-8 rounded-2xl hover:border-violet-500/20 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <stat.icon className="w-6 h-6 text-violet-400" />
                <ArrowUpRight className="w-5 h-5 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-lg text-violet-400">{stat.label}</span>
              </div>
              <p className="text-gray-400">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Showcase */}
      <div className="mb-24">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl font-bold text-center text-white mb-12"
        >
          Projets réalisés par nos étudiants
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectImages.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="group relative rounded-xl overflow-hidden"
            >
              <Image
                src={project.image}
                alt={project.title}
                width={600}
                height={400}
                className="object-cover w-full aspect-video"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="text-xl font-bold text-white mb-2">
                    {project.title}
                  </h4>
                  <p className="text-violet-300">{project.tech}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {successStories.map((story, i) => (
          <motion.div
            key={story.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(cardStyles.base, cardStyles.hover)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={story.image}
                  alt={story.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-white font-semibold">{story.name}</h4>
                <p className="text-violet-400">{story.role}</p>
              </div>
            </div>
            <p className="text-gray-400">{story.quote}</p>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
