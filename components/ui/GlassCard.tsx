'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
