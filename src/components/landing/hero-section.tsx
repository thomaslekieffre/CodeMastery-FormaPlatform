"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Sparkles, Terminal } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function HeroSection() {
  const [windowWidth, setWindowWidth] = useState(0);
  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  const parallaxY = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black selection:bg-violet-500/30 selection:text-white">
      {/* Code Matrix Background */}
      <div className="absolute inset-0 w-full h-full opacity-10">
        {windowWidth > 0 &&
          [...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -100 }}
              animate={{
                opacity: [0, 1, 0],
                y: ["0vh", "100vh"],
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              className="absolute text-violet-500 font-mono text-sm"
              style={{
                left: `${Math.random() * 100}%`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
              }}
            >
              {[..."</>{}"].sort(() => Math.random() - 0.5).join("")}
            </motion.div>
          ))}
      </div>

      {/* Animated gradients */}
      <motion.div
        style={{ y: parallaxY }}
        className="absolute inset-0 flex items-center justify-center -z-10"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-[800px] h-[800px] bg-violet-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-3xl"
        />
      </motion.div>

      <div className="container px-4 md:px-6 relative" ref={containerRef}>
        <motion.div
          style={{ opacity }}
          className="flex flex-col items-center space-y-8 text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 backdrop-blur-sm hover:bg-violet-500/20 transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4 mr-2 animate-pulse" />
              <span className="text-sm font-medium">
                Apprenez à coder comme un pro
              </span>
            </motion.div>

            <div className="relative">
              <motion.h1
                className="text-4xl md:text-7xl font-bold tracking-tighter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                  Devenez développeur web
                </span>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 text-transparent bg-clip-text"
                >
                  {" "}
                  en 6 mois
                </motion.span>
              </motion.h1>

              {/* Decorative elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -right-10 top-0 w-20 h-20 bg-violet-500/10 rounded-full blur-xl"
              />
            </div>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-gray-400 text-xl md:text-2xl leading-relaxed"
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
              className="bg-violet-500 hover:bg-violet-600 text-base h-12 px-8 whitespace-nowrap rounded-full shadow-lg shadow-violet-500/25 hover:shadow-violet-500/50 transition-all duration-300"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 w-4 h-4 animate-pulse" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base h-12 px-8 whitespace-nowrap rounded-full border-2 hover:bg-white/10 transition-all duration-300"
            >
              Voir le programme
              <Code2 className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-4 text-base bg-white/5 px-6 py-3 rounded-2xl backdrop-blur-sm"
          >
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: -10 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                  className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-violet-400 to-violet-600 shadow-lg"
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                />
              ))}
            </div>
            <div className="text-gray-300">
              Rejoint par{" "}
              <span className="font-bold bg-gradient-to-r from-violet-400 to-violet-600 text-transparent bg-clip-text">
                2,000+
              </span>{" "}
              développeurs
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
