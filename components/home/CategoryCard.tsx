'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

interface CategoryCardProps {
  name: string;
  emoji: string;
  index: number;
}

export default function CategoryCard({ name, emoji, index }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.07, y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <GlassCard className="flex flex-col items-center gap-2 px-5 py-4 cursor-pointer min-w-[100px] glass-card-hover">
        <span className="text-3xl">{emoji}</span>
        <span className="text-white font-semibold text-sm">{name}</span>
      </GlassCard>
    </motion.div>
  );
}
