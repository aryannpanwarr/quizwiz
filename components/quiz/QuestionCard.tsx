"use client";

import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";

interface QuestionCardProps {
  question: string;
  imageUrl?: string | null;
  imageLoading?: boolean;
}

export default function QuestionCard({ question, imageUrl, imageLoading }: QuestionCardProps) {
  return (
    <GlassCard className="w-full max-w-2xl mx-auto mb-8 overflow-hidden">
      {/* AI-generated image area */}
      <AnimatePresence mode="wait">
        {imageLoading && !imageUrl && (
          <motion.div
            key="shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-48 bg-white/10 animate-pulse flex items-center justify-center gap-2"
          >
            <span className="w-3 h-3 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-3 h-3 bg-pink-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-3 h-3 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </motion.div>
        )}
        {imageUrl && (
          <motion.img
            key="image"
            src={imageUrl}
            alt="Question illustration"
            className="w-full h-48 object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Question text */}
      <div className="px-8 py-6">
        <p className="text-xl font-semibold text-white text-center leading-relaxed">
          {question}
        </p>
      </div>
    </GlassCard>
  );
}
