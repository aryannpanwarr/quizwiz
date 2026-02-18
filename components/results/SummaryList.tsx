"use client";

import GlassCard from "@/components/ui/GlassCard";
import type { QuizQuestion, UserAnswer } from "@/lib/types";

interface SummaryListProps {
  questions: QuizQuestion[];
  answers: UserAnswer[];
}

export default function SummaryList({ questions, answers }: SummaryListProps) {
  return (
    <GlassCard className="w-full max-w-2xl mx-auto px-6 py-6">
      <h2 className="text-xl font-bold text-white mb-4">Summary</h2>

      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
        {questions.map((q, i) => {
          const answer = answers.find((a) => a.questionIndex === i);
          const isCorrect = answer?.isCorrect ?? false;

          return (
            <div
              key={i}
              className="flex items-start gap-3 py-3 border-b border-white/10 last:border-0"
            >
              <span className="text-xl mt-0.5 shrink-0">{isCorrect ? "✅" : "❌"}</span>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white leading-snug">{q.question}</p>
                <p className="text-white/60 text-sm mt-1">
                  Your answer:{" "}
                  <span className={isCorrect ? "text-white/80" : "text-red-300"}>
                    {answer?.selectedAnswer ?? "—"}
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-emerald-400 text-sm mt-0.5">
                    → {q.correctAnswer}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
