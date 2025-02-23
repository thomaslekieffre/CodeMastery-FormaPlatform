"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 w-full h-full bg-grid-white/[0.02] -z-10" />
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 1 }}
          className="w-[500px] h-[500px] bg-violet-500/30 rounded-full blur-3xl"
        />
      </div>

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Apprenez à coder comme un pro
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter">
              Devenez développeur web
              <span className="text-violet-500"> en 6 mois</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-gray-500 text-xl md:text-2xl dark:text-gray-400"
          >
            Du HTML à Nuxt.js, apprenez avec des projets concrets et une
            communauté active. Formez-vous à votre rythme avec notre plateforme
            interactive.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex gap-4 w-full max-w-md justify-center"
          >
            <Button
              size="lg"
              className="bg-violet-500 hover:bg-violet-600 text-base h-11 px-6 whitespace-nowrap"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base h-11 px-6 border-[1px] whitespace-nowrap"
            >
              Voir le programme
              <Code2 className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-4 text-base"
          >
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background bg-violet-500"
                />
              ))}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Rejoint par{" "}
              <span className="font-semibold text-foreground">2,000+</span>{" "}
              développeurs
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
