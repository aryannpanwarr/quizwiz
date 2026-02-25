'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

interface GradientButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  className?: string;
}

export default function GradientButton({ children, className = '', ...props }: GradientButtonProps) {
  return (
    <motion.button
      className={`gradient-button px-8 py-4 text-white font-bold text-lg cursor-pointer ${className}`}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
