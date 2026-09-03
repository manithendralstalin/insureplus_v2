"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-rose-400">*</span>}
      </Label>
      {children}
      <div className="min-h-[18px] pt-1">
        <AnimatePresence mode="wait" initial={false}>
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-xs font-medium text-rose-400"
            >
              {error}
            </motion.p>
          ) : hint ? (
            <p className="text-xs text-muted-foreground/70">{hint}</p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
