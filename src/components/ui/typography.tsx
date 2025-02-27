"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Heading
const headingVariants = cva("font-bold tracking-tight", {
  variants: {
    size: {
      h1: "text-4xl md:text-5xl lg:text-6xl",
      h2: "text-3xl md:text-4xl",
      h3: "text-2xl md:text-3xl",
      h4: "text-xl md:text-2xl",
      h5: "text-lg md:text-xl",
      h6: "text-base md:text-lg",
    },
    colorScheme: {
      default: "text-black dark:text-white",
      muted: "text-gray-800 dark:text-gray-200",
      accent: "text-violet-600 dark:text-violet-400",
      gradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-600",
    },
  },
  defaultVariants: {
    size: "h1",
    colorScheme: "default",
  },
});

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function Heading({
  className,
  size,
  colorScheme,
  as: Tag = "h1",
  ...props
}: HeadingProps) {
  return (
    <Tag
      className={cn(headingVariants({ size, colorScheme }), className)}
      {...props}
    />
  );
}

// Paragraph
const paragraphVariants = cva("", {
  variants: {
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      xl: "text-xl",
    },
    colorScheme: {
      default: "text-gray-200",
      muted: "text-gray-400",
      accent: "text-violet-400",
    },
    weight: {
      default: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    size: "default",
    colorScheme: "default",
    weight: "default",
  },
});

interface ParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphVariants> {}

export function Paragraph({
  className,
  size,
  colorScheme,
  weight,
  ...props
}: ParagraphProps) {
  return (
    <p
      className={cn(
        paragraphVariants({ size, colorScheme, weight }),
        className
      )}
      {...props}
    />
  );
}

// Inline text
const textVariants = cva("", {
  variants: {
    variant: {
      default: "",
      lead: "text-xl text-gray-300",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-gray-400",
      gradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TextProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof textVariants> {}

export function Text({ className, variant, ...props }: TextProps) {
  return (
    <span className={cn(textVariants({ variant }), className)} {...props} />
  );
}
