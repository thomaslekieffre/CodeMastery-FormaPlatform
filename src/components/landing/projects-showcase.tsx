"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { cardStyles } from "@/components/ui/card-styles";
import { cn } from "@/lib/utils";

const projects = [
  {
    title: "Clone Twitter",
    description: "Créez un clone de Twitter avec Next.js et Supabase",
    image:
      "https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/examples/twitter-clone.png",
    tags: ["Next.js", "Supabase", "TailwindCSS"],
  },
  {
    title: "E-commerce",
    description: "Développez une boutique en ligne complète",
    image:
      "https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/examples/ecommerce.png",
    tags: ["Vue.js", "Stripe", "Node.js"],
  },
  {
    title: "SaaS Platform",
    description: "Construisez une plateforme SaaS de A à Z",
    image:
      "https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/examples/dashboard.png",
    tags: ["Nuxt.js", "Auth", "API"],
  },
];

export function ProjectsShowcase() {
  return (
    <SectionWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Projets <span className="text-violet-400">Professionnels</span>
        </h2>
        <p className="text-xl text-gray-400">
          Construisez des projets concrets valorisables sur votre CV
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={cn("group", cardStyles.base, cardStyles.hover)}
          >
            <div className="relative aspect-video rounded-t-xl overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                {project.title}
              </h3>
              <p className="text-gray-400 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
