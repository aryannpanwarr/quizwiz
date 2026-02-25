'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import GradientButton from '@/components/ui/GradientButton';
import { APP_NAME, TAGLINE } from '@/lib/constants';

export default function HeroSection() {
  return (
    <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
      {/* Brain emoji */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="text-8xl mb-4 select-none"
      >
        🧠
      </motion.div>

      {/* App title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55, ease: 'easeOut' }}
        className="text-6xl font-extrabold text-white tracking-tight drop-shadow-lg mb-3"
      >
        {APP_NAME}
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
        className="text-xl text-white/70 mb-10 max-w-md"
      >
        {TAGLINE}
      </motion.p>

      {/* Start Quiz button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4"
      >
        <Link href="/upload">
          <GradientButton>
            🚀 Start Quiz!
          </GradientButton>
        </Link>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="text-white/50 text-sm"
        >
          Upload a PDF or paste any text to get started
        </motion.p>
      </motion.div>
    </main>
  );
}
