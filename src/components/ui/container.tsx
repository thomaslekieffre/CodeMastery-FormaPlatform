"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "default" | "sm" | "lg" | "xl" | "full";
  centered?: boolean;
}

export function Container({
  children,
  className,
  size = "default",
  centered = false,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 mx-auto",
        {
          "max-w-7xl": size === "default",
          "max-w-5xl": size === "sm",
          "max-w-screen-2xl": size === "lg",
          "max-w-none": size === "full",
          "flex flex-col items-center": centered,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
