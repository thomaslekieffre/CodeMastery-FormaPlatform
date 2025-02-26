import { cva } from "class-variance-authority";

export const cardStyles = cva(
  "rounded-lg border border-violet-900/20 bg-black/40 backdrop-blur-sm shadow-md transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/5",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-lg shadow-violet-500/10",
        bordered: "border-violet-500/30",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
