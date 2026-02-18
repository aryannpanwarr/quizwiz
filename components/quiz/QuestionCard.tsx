"use client";

import GlassCard from "@/components/ui/GlassCard";

interface QuestionCardProps {
  question: string;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <GlassCard className="w-full max-w-2xl mx-auto mb-8 px-8 py-6">
      <p className="text-xl font-semibold text-white text-center leading-relaxed">
        {question}
      </p>
    </GlassCard>
  );
}
