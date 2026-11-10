"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export const FadeIn = ({
  children,
  className,
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    {...props}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({
  children,
  className,
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode; delay?: number }) => (
  <motion.div
    className={className}
    initial={{ scale: 0.94, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.35, delay, type: "spring", stiffness: 280, damping: 24 }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({
  children,
  className,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.05 },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({
  children,
  className,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 14 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedCard = ({
  children,
  className,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode }) => (
  <motion.div
    className={className}
    whileHover={{ y: -4, boxShadow: "0 16px 32px -8px rgba(0, 105, 72, 0.12)" }}
    whileTap={{ scale: 0.985 }}
    transition={{ type: "spring", stiffness: 320, damping: 24 }}
    {...props}
  >
    {children}
  </motion.div>
);

export const MagneticButton = ({
  children,
  className,
  ...props
}: HTMLMotionProps<"button"> & { children: ReactNode }) => (
  <motion.button
    className={className}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.96 }}
    transition={{ type: "spring", stiffness: 350, damping: 20 }}
    {...props}
  >
    {children}
  </motion.button>
);

export function AnimatedCounter({
  value,
  duration = 900,
  prefix = "",
  suffix = "",
  formatter,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (val: number) => string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let rafId = 0;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {formatter ? formatter(display) : display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
