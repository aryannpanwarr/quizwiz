"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ConceptCard from "@/components/explain/ConceptCard";
import GlassCard from "@/components/ui/GlassCard";
import GradientButton from "@/components/ui/GradientButton";
import type { ExplanationData } from "@/lib/types";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`bg-white/10 rounded-xl animate-pulse ${className ?? ""}`}
    />
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ExplainPage() {
  const router = useRouter();
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [isLoadingExplain, setIsLoadingExplain] = useState(true);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("quizwiz-content");
    if (!raw) {
      router.push("/upload");
      return;
    }

    const content = JSON.parse(raw);
    fetchExplanation(content.text ?? "");
  }, [router]);

  const fetchExplanation = async (text: string) => {
    setIsLoadingExplain(true);
    setError(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to generate explanation.");
      const data: ExplanationData = await res.json();
      setExplanation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoadingExplain(false);
    }
  };

  const handleStartQuiz = async () => {
    const raw = sessionStorage.getItem("quizwiz-content");
    if (!raw) return;

    const content = JSON.parse(raw);
    setIsLoadingQuiz(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content.text ?? "" }),
      });
      if (!res.ok) throw new Error("Failed to generate quiz.");
      const questions = await res.json();
      sessionStorage.setItem("quizwiz-quiz", JSON.stringify(questions));
      router.push("/quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz.");
      setIsLoadingQuiz(false);
    }
  };

  if (isLoadingExplain) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 py-12">
        <SkeletonBlock className="h-10 w-72 mx-auto mb-10" />
        <SkeletonBlock className="h-40 w-full mb-8 rounded-2xl" />
        <div className="mb-8">
          <SkeletonBlock className="h-6 w-32 mb-4" />
          {[...Array(4)].map((_, i) => (
            <SkeletonBlock key={i} className="h-5 w-full mb-3" />
          ))}
        </div>
        <div>
          <SkeletonBlock className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonBlock key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center gap-6">
        <p className="text-red-400 text-lg text-center">{error}</p>
        <GradientButton onClick={() => router.push("/upload")}>
          Go Back
        </GradientButton>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8"
      >
        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl font-bold text-white text-center"
        >
          📖 Here&apos;s what you need to know
        </motion.h1>

        {/* Summary */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <p className="text-white/90 text-base leading-relaxed">{explanation.summary}</p>
          </GlassCard>
        </motion.div>

        {/* Key Points */}
        {explanation.keyPoints?.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-white font-bold text-xl mb-4">Key Points</h2>
            <GlassCard className="p-6">
              <ul className="flex flex-col gap-3">
                {explanation.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/85 text-sm leading-relaxed">
                    <span className="mt-0.5 shrink-0">✅</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        )}

        {/* Key Concepts */}
        {explanation.keyConcepts?.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-white font-bold text-xl mb-4">Key Concepts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {explanation.keyConcepts.map((concept, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                >
                  <ConceptCard term={concept.term} definition={concept.definition} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div variants={itemVariants} className="flex justify-center pt-4 pb-8">
          <GradientButton onClick={handleStartQuiz} disabled={isLoadingQuiz} className="px-10 py-4 text-lg">
            {isLoadingQuiz ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Quiz...
              </span>
            ) : (
              "Ready? Let's Quiz! 🎯"
            )}
          </GradientButton>
        </motion.div>
      </motion.div>
    </div>
  );
}
