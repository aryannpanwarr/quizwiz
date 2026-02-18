"use client";

interface QuizHeaderProps {
  currentIndex: number;
  total: number;
  score: number;
}

export default function QuizHeader({ currentIndex, total, score }: QuizHeaderProps) {
  const progress = total > 0 ? ((currentIndex) / total) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="text-white font-semibold text-lg">
          Question {currentIndex + 1} / {total}
        </span>
        <span className="text-white font-semibold text-lg">
          Score: {score}
        </span>
      </div>
      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-300 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
