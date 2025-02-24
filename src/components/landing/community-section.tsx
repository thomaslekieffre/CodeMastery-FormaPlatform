"use client";

import { motion } from "framer-motion";
import { Users, MessageCircle, Trophy, Heart } from "lucide-react";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { cardStyles } from "@/components/ui/card-styles";
import { cn } from "@/lib/utils";

const communityStats = [
  {
    icon: Users,
    value: "2,000+",
    label: "Apprenants actifs",
    description: "Une communauté grandissante",
  },
  {
    icon: MessageCircle,
    value: "24/7",
    label: "Support Discord",
    description: "Aide en temps réel",
  },
  {
    icon: Trophy,
    value: "150+",
    label: "Événements coding",
    description: "Challenges hebdomadaires",
  },
  {
    icon: Heart,
    value: "98%",
    label: "Satisfaction",
    description: "Avis positifs",
  },
];

export function CommunitySection() {
  return (
    <SectionWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Rejoignez une communauté{" "}
          <span className="text-violet-400">passionnée</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Évoluez aux côtés de développeurs motivés et entraidez-vous pour
          progresser plus rapidement
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {communityStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn("group", cardStyles.base, cardStyles.hover)}
          >
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="w-16 h-16 mx-auto mb-4 bg-violet-500/10 rounded-full flex items-center justify-center group-hover:bg-violet-500/20"
              >
                <stat.icon className="w-8 h-8 text-violet-400" />
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {stat.value}
              </h3>
              <p className="text-lg font-semibold text-violet-400 mb-2">
                {stat.label}
              </p>
              <p className="text-gray-400">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Discord Preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        className={cn("mt-20", cardStyles.base)}
      >
        <div className="bg-violet-500/10 p-4 rounded-t-xl flex items-center gap-4">
          <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-white font-semibold">CodeMastery Community</h3>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 animate-pulse opacity-50"
            >
              <div className="w-10 h-10 bg-violet-500/20 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-violet-500/10 rounded w-1/4 mb-2" />
                <div className="h-3 bg-violet-500/5 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
