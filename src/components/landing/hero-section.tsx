"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2 } from "lucide-react";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0D0016]">
      {/* Badge "Apprenez à coder comme un pro" */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 md:top-16 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm backdrop-blur-sm"
      >
        ✨ Apprenez à coder comme un pro
      </motion.div>

      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent opacity-50" />
        {mounted && (
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: ["0vh", "100vh"],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
                className="absolute text-violet-500/30 font-mono"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 100}%`,
                }}
              >
                {["</>", "{}", "[]", "//"][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="container px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          >
            Devenez développeur{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600">
              web
            </span>{" "}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600">
              en 6 mois
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            Du HTML à Nuxt.js, apprenez avec des projets concrets et une
            communauté active. Formez-vous à votre rythme avec notre plateforme
            interactive.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-violet-500 hover:bg-violet-600 text-lg h-14 px-8 rounded-full"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg h-14 px-8 rounded-full border-2"
            >
              Voir le programme
              <Code2 className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex items-center justify-center gap-4 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10 max-w-fit mx-auto"
          >
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#0D0016] bg-gradient-to-br from-violet-400 to-violet-600"
                />
              ))}
            </div>
            <p className="text-gray-400">
              Rejoint par{" "}
              <span className="text-white font-semibold">2,000+</span>{" "}
              développeurs
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}