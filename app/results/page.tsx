"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ScoreCard from "@/components/results/ScoreCard";
import SummaryList from "@/components/results/SummaryList";
import GradientButton from "@/components/ui/GradientButton";
import GlassCard from "@/components/ui/GlassCard";
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
  const [reportProgress, setReportProgress] = useState<string | null>(null);
  const [reportDone, setReportDone] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("quizwiz-results");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const parsed: ResultsData = JSON.parse(raw);
      setData(parsed);

      const pct = parsed.total > 0 ? (parsed.score / parsed.total) * 100 : 0;
      if (pct >= 60) {
        const duration = 3000;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#a78bfa", "#f472b6", "#fb923c", "#34d399"] });
          confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#a78bfa", "#f472b6", "#fb923c", "#34d399"] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleDownloadReport = async () => {
    if (!data) return;

    setReportProgress("Loading report generator…");
    setReportDone(false);

    try {
      const { generateQuizReport } = await import("@/lib/reportGenerator");
      await generateQuizReport(
        data.score,
        data.total,
        data.questions,
        data.answers,
        (msg) => setReportProgress(msg)
      );
      setReportDone(true);
      setReportProgress(null);
    } catch (err) {
      console.error("Report generation failed:", err);
      setReportProgress(null);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading results…</div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl flex flex-col items-center gap-8"
      >
        {/* Score */}
        <motion.div variants={itemVariants} className="w-full">
          <ScoreCard score={data.score} total={data.total} />
        </motion.div>

        {/* Summary */}
        <motion.div variants={itemVariants} className="w-full">
          <SummaryList questions={data.questions} answers={data.answers} />
        </motion.div>

        {/* Download Report card */}
        <motion.div variants={itemVariants} className="w-full">
          <GlassCard className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="text-4xl">📊</div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Download Your Report</h3>
              <p className="text-white/60 text-sm">
                Get a beautiful PDF with your score, question breakdown, AI-generated
                illustrations, and personalised focus areas.
              </p>
            </div>

            {/* Progress indicator */}
            <AnimatePresence>
              {reportProgress && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 text-violet-300 text-sm"
                >
                  <span className="w-3 h-3 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin" />
                  {reportProgress}
                </motion.div>
              )}
              {reportDone && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-emerald-400 text-sm font-medium"
                >
                  ✅ Report downloaded!
                </motion.p>
              )}
            </AnimatePresence>

            <GradientButton
              onClick={handleDownloadReport}
              disabled={!!reportProgress}
              className="px-8 py-3 text-base"
            >
              {reportProgress ? "Generating…" : "📥 Download PDF Report"}
            </GradientButton>
          </GlassCard>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-sm"
        >
          <GradientButton onClick={() => router.push("/quiz")} className="flex-1">
            🔄 Play Again
          </GradientButton>
          <button
            onClick={() => router.push("/upload")}
            className="flex-1 px-6 py-3 rounded-full font-semibold text-white border-2 border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/60 transition-all duration-200"
          >
            🏠 New Topic
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
