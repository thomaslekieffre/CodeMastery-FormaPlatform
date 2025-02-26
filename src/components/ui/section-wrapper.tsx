"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  withGradient?: boolean;
  withPadding?: boolean;
  withContainer?: boolean;
  id?: string;
}

export function SectionWrapper({
  children,
  className,
  withGradient = true,
  withPadding = true,
  withContainer = true,
  id,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden",
        withPadding && "py-16 md:py-24",
        className
      )}
    >
      {/* Unified subtle gradient background */}
      {withGradient && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(109,40,217,0.05),transparent_80%)]" />
      )}

      <div className={cn("relative", withContainer && "container px-4")}>
        {children}
      </div>
    </section>
  );
}
