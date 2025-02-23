"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marie L.",
    role: "Développeuse Frontend",
    text: "CodeMastery m'a permis de passer de débutante à développeuse professionnelle en 6 mois.",
    stars: 5,
  },
  {
    name: "Thomas D.",
    role: "Freelance",
    text: "La meilleure formation que j'ai suivie. Le contenu est pratique et la communauté très active.",
    stars: 5,
  },
  {
    name: "Sarah M.",
    role: "Étudiante",
    text: "J'ai adoré l'approche progressive et les projets concrets. Je me sens prête pour le marché du travail.",
    stars: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-card rounded-xl border"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-violet-500 text-violet-500"
                  />
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {testimonial.text}
              </p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
