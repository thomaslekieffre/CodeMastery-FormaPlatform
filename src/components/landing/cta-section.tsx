"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { cardStyles } from "@/components/ui/card-styles";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <SectionWrapper>
      <div className="flex flex-col items-center space-y-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className={cn(
            "max-w-3xl p-12 relative",
            cardStyles.base,
            "border-violet-500/20"
          )}
        >
          <div className="absolute inset-0 bg-violet-500/5 rounded-xl" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative">
            Prêt à commencer votre voyage ?
          </h2>
          <p className="text-xl text-gray-400 mb-12 relative">
            Rejoignez plus de 2000 développeurs qui ont déjà commencé leur
            formation avec CodeMastery
          </p>
          <Button
            size="lg"
            className="bg-violet-500 hover:bg-violet-600 text-white text-lg h-14 px-8 rounded-full relative"
          >
            Commencer gratuitement
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
