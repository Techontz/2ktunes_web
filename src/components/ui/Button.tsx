'use client';

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "yellow";
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Button({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-white hover:text-brand-black",
    secondary: "bg-white text-brand-black hover:bg-brand-primary hover:text-white",
    outline: "border border-white/20 text-white hover:border-white hover:bg-white hover:text-brand-black",
    ghost: "text-white hover:bg-white/10",
    yellow: "bg-brand-yellow text-brand-black hover:bg-white shadow-[0_20px_50px_rgba(255,255,0,0.15)]",
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-2.5 text-xs",
    lg: "px-8 py-3 text-sm md:text-base",
    xl: "px-8 py-4 md:px-16 md:py-6 text-lg md:text-2xl",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "font-display font-bold uppercase tracking-widest transition-all cursor-pointer inline-flex items-center justify-center text-center",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
