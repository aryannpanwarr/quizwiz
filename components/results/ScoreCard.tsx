"use client";

import GlassCard from "@/components/ui/GlassCard";

interface ScoreCardProps {
  score: number;
  total: number;
}

function getMotivation(pct: number): { message: string; sub: string } {
  if (pct === 100) return { message: "Perfect! You're a genius! 🏆", sub: "An absolutely flawless performance!" };
  if (pct >= 80)   return { message: "Amazing work! 🌟", sub: "You really know your stuff!" };
  if (pct >= 60)   return { message: "Good job! 👏", sub: "Practice makes perfect!" };
  if (pct >= 40)   return { message: "Keep trying! 💪", sub: "Every attempt makes you stronger!" };
  return              { message: "Don't give up! 📖", sub: "Review and come back stronger!" };
}

function getPercentageColor(pct: number): string {
  if (pct >= 60) return "text-emerald-400";
  if (pct >= 40) return "text-yellow-400";
  return "text-red-400";
}

export default function ScoreCard({ score, total }: ScoreCardProps) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const { message, sub } = getMotivation(pct);
  const colorClass = getPercentageColor(pct);

  return (
    <GlassCard className="w-full max-w-md mx-auto px-10 py-10 flex flex-col items-center gap-4 text-center">
      <div className="text-5xl">📚</div>

      <div className="text-6xl font-bold text-white">
        {score}<span className="text-white/50 text-4xl">/{total}</span>
      </div>

      <div className={`text-3xl font-bold ${colorClass}`}>{pct}%</div>

      <div className="text-2xl font-semibold text-white mt-1">{message}</div>
      <div className="text-white/60 text-base">{sub}</div>
    </GlassCard>
  );
}
