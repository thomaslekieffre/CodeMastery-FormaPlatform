"use client";

import { motion, useScroll } from "framer-motion";
import {
  CommunitySection,
  CtaSection,
  FeaturesSection,
  HeroSection,
  LearningPathSection,
  PricingSection,
  ProjectsShowcase,
  StatisticsSection,
  TestimonialsSection,
} from "@/components/landing";
import { TechStackSection } from "@/components/landing/tech-stack-section";
import { Footer } from "@/components/layout/footer";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();

  return (
    <>
      <main className="relative min-h-screen bg-gradient-to-b from-[#0D0016] via-[#130822] to-[#0D0016]">
        {/* Progress bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-violet-500 z-50 origin-left"
          style={{ scaleX: scrollYProgress }}
        />

        {/* Global subtle grid */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(109,40,217,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(109,40,217,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative">
          <HeroSection />
          <div className="bg-gradient-to-b from-[#0D0016] via-[#130822] to-[#0D0016]">
            <TechStackSection />
            <FeaturesSection />
            <ProjectsShowcase />
            <StatisticsSection />
            <LearningPathSection />
            <TestimonialsSection />
            <CommunitySection />
            <PricingSection />
            <CtaSection />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
