"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionWrapper({ children, className }: SectionWrapperProps) {
  return (
    <section className={cn("py-24 relative overflow-hidden", className)}>
      {/* Unified subtle gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(109,40,217,0.05),transparent_80%)]" />

      <div className="container px-4 relative">{children}</div>
    </section>
  );
}
