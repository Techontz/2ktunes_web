import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "glass" | "outline" | "dark";
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({ 
  children, 
  className, 
  variant = "outline", 
  padding = "md",
  ...props 
}: CardProps) {
  const variants = {
    glass: "bg-brand-primary/5 border-brand-primary",
    outline: "border-white/10 bg-brand-black/50 hover:border-brand-primary/50",
    dark: "bg-brand-black/20 border-white/5",
  };

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-8",
    lg: "p-10",
  };

  return (
    <motion.div
      className={cn(
        "border transition-colors relative",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
