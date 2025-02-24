"use client";

import { motion } from "framer-motion";
import { Code2, Rocket, Terminal, Trophy } from "lucide-react";

const steps = [
  {
    icon: Terminal,
    title: "Bases solides",
    description:
      "HTML, CSS, JavaScript - Les fondamentaux du développement web moderne",
    duration: "2 mois",
    projects: ["Portfolio", "Landing Page", "Dashboard"],
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    icon: Code2,
    title: "Frontend avancé",
    description: "React, Vue.js - Maîtrisez les frameworks les plus demandés",
    duration: "2 mois",
    projects: ["E-commerce", "Réseau social", "App SaaS"],
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    icon: Rocket,
    title: "Nuxt.js & Full-Stack",
    description: "Développez des applications web complètes et performantes",
    duration: "2 mois",
    projects: ["Clone Twitter", "Plateforme E-learning", "App temps réel"],
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
];

export function LearningPathSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Single gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(109,40,217,0.08),transparent)]" />

      <div className="container px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Votre parcours vers le succès
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Un programme structuré de 6 mois pour devenir développeur web
            professionnel
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-violet-500/10 hidden md:block" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: index % 2 ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`relative grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 ${
                index % 2 ? "md:text-right" : ""
              }`}
            >
              <div className={`${index % 2 ? "md:order-2" : ""}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <span className="text-violet-400 font-mono">
                    {step.duration}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 mb-4">{step.description}</p>
                <div className="flex flex-wrap gap-2">
                  {step.projects.map((project) => (
                    <span
                      key={project}
                      className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-sm"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`relative ${index % 2 ? "md:order-1" : ""}`}>
                <div className="aspect-video rounded-xl overflow-hidden bg-[#1A0B2E] border border-violet-500/10">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-90"
                  >
                    <source src={step.video} type="video/mp4" />
                  </video>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
