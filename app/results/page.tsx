"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import ScoreCard from "@/components/results/ScoreCard";
import SummaryList from "@/components/results/SummaryList";
import GradientButton from "@/components/ui/GradientButton";
import type { QuizQuestion, UserAnswer } from "@/lib/types";

interface ResultsData {
  questions: QuizQuestion[];
  answers: UserAnswer[];
  score: number;
  total: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<ResultsData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("quizwiz-results");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const parsed: ResultsData = JSON.parse(raw);
      setData(parsed);

      // Fire confetti if score >= 60%
      const pct = parsed.total > 0 ? (parsed.score / parsed.total) * 100 : 0;
      if (pct >= 60) {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#a78bfa", "#f472b6", "#fb923c", "#34d399"],
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#a78bfa", "#f472b6", "#fb923c", "#34d399"],
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading results...</div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.18, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl flex flex-col items-center gap-8"
      >
        <motion.div variants={itemVariants} className="w-full">
          <ScoreCard score={data.score} total={data.total} />
        </motion.div>

        <motion.div variants={itemVariants} className="w-full">
          <SummaryList questions={data.questions} answers={data.answers} />
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <GradientButton
            onClick={() => router.push("/quiz")}
            className="flex-1"
          >
            🔄 Play Again
          </GradientButton>

          <button
            onClick={() => router.push("/upload")}
            className="
              flex-1 px-6 py-3 rounded-full font-semibold text-white
              border-2 border-white/40 bg-white/10 backdrop-blur-sm
              hover:bg-white/20 hover:border-white/60
              transition-all duration-200
            "
          >
            🏠 New Topic
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
