"use client";

import GlassCard from "@/components/ui/GlassCard";

interface ConceptCardProps {
  term: string;
  definition: string;
}

export default function ConceptCard({ term, definition }: ConceptCardProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">💡</span>
        <div>
          <p className="text-white font-bold text-sm mb-1">{term}</p>
          <p className="text-white/70 text-sm leading-relaxed">{definition}</p>
        </div>
      </div>
    </GlassCard>
  );
}
