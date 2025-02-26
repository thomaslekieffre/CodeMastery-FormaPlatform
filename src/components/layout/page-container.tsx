"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll } from "framer-motion";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withGrid?: boolean;
  withGradient?: boolean;
  withProgressBar?: boolean;
}

export function PageContainer({
  children,
  className,
  withGrid = false,
  withGradient = true,
  withProgressBar = true,
}: PageContainerProps) {
  const { scrollYProgress } = useScroll();

  return (
    <div
      className={cn(
        "min-h-screen w-full",
        withGradient &&
          "bg-gradient-to-b from-[#0D0016] via-[#130822] to-[#0D0016]",
        className
      )}
    >
      {withProgressBar && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-violet-500 z-50 origin-left"
          style={{ scaleX: scrollYProgress }}
        />
      )}
      {withGrid && (
        <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(109,40,217,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(109,40,217,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
