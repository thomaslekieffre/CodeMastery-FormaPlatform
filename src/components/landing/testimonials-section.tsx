"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { cardStyles } from "@/components/ui/card-styles";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sophie M.",
    role: "Développeuse Frontend",
    image: "https://i.pravatar.cc/150?img=44",
    rating: 5,
    text: "La qualité des cours et le support de la communauté sont exceptionnels. J'ai appris plus en 3 mois qu'en 1 an d'auto-formation.",
  },
  {
    name: "Lucas D.",
    role: "Développeur Full-Stack",
    image: "https://i.pravatar.cc/150?img=68",
    rating: 5,
    text: "Les projets pratiques m'ont permis de construire un portfolio solide. J'ai décroché mon premier job après seulement 4 mois de formation.",
  },
  {
    name: "Emma L.",
    role: "Freelance Developer",
    image: "https://i.pravatar.cc/150?img=45",
    rating: 5,
    text: "Le focus sur Nuxt.js et les technologies modernes m'a donné un vrai avantage sur le marché. Je recommande à 100% !",
  },
];

export function TestimonialsSection() {
  return (
    <SectionWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Ce que disent nos <span className="text-violet-400">étudiants</span>
        </h2>
        <p className="text-xl text-gray-400">
          Découvrez les retours d'expérience de notre communauté
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={cn("p-6", cardStyles.base, cardStyles.hover)}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-14 h-14 rounded-full overflow-hidden">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-white">{testimonial.name}</h3>
                <p className="text-violet-400 text-sm">{testimonial.role}</p>
              </div>
            </div>

            <div className="flex mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-violet-500 text-violet-500"
                />
              ))}
            </div>

            <p className="text-gray-400">{testimonial.text}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
