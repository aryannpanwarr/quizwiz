"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import QuizHeader from "@/components/quiz/QuizHeader";
import QuestionCard from "@/components/quiz/QuestionCard";
import DraggableOption from "@/components/quiz/DraggableOption";
import DropZone from "@/components/quiz/DropZone";
import type { QuizQuestion, UserAnswer } from "@/lib/types";

const CORNER_POSITIONS = [
  { top: "8%",  left: "5%"  },
  { top: "8%",  right: "5%" },
  { bottom: "8%", left: "5%" },
  { bottom: "8%", right: "5%" },
];

type FeedbackState = {
  type: "correct" | "wrong";
  correctAnswer: string;
} | null;

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [glowColor, setGlowColor] = useState<"green" | "red" | null>(null);

  // Image generation state
  const [questionImages, setQuestionImages] = useState<Record<number, string | null>>({});
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
  const generatingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const raw = sessionStorage.getItem("quizwiz-quiz");
    if (!raw) {
      router.replace("/upload");
      return;
    }
    try {
      const parsed: QuizQuestion[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        router.replace("/upload");
        return;
      }
      setQuestions(parsed);
    } catch {
      router.replace("/upload");
    }
  }, [router]);

  // Background image generation
  const generateImage = useCallback(async (idx: number, question: string) => {
    if (generatingRef.current.has(idx)) return;
    generatingRef.current.add(idx);
    setLoadingImages(prev => new Set([...prev, idx]));

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setQuestionImages(prev => ({ ...prev, [idx]: data.imageUrl ?? null }));
    } catch {
      setQuestionImages(prev => ({ ...prev, [idx]: null }));
    } finally {
      setLoadingImages(prev => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  }, []);

  // Trigger image generation for current + next question
  useEffect(() => {
    if (questions.length === 0) return;

    const q = questions[currentIndex];
    if (q && !generatingRef.current.has(currentIndex)) {
      generateImage(currentIndex, q.question);
    }

    const nextIdx = currentIndex + 1;
    const nextQ = questions[nextIdx];
    if (nextQ && !generatingRef.current.has(nextIdx)) {
      generateImage(nextIdx, nextQ.question);
    }
  }, [currentIndex, questions, generateImage]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { over, active } = event;
      if (!over || over.id !== "drop-zone" || isTransitioning) return;

      const question = questions[currentIndex];
      if (!question) return;

      const selectedOptionId = active.id as string;
      const optionIndex = parseInt(selectedOptionId.replace("opt-", ""), 10);
      const selectedText = question.options[optionIndex];
      const isCorrect = selectedText === question.correctAnswer;

      const newScore = isCorrect ? score + 1 : score;
      const newAnswers: UserAnswer[] = [
        ...answers,
        {
          questionIndex: currentIndex,
          selectedAnswer: selectedText,
          isCorrect,
        },
      ];

      setScore(newScore);
      setAnswers(newAnswers);
      setFeedback({
        type: isCorrect ? "correct" : "wrong",
        correctAnswer: question.correctAnswer,
      });
      setGlowColor(isCorrect ? "green" : "red");
      setIsTransitioning(true);

      setTimeout(() => {
        setFeedback(null);
        setGlowColor(null);
        const nextIndex = currentIndex + 1;

        if (nextIndex >= questions.length) {
          const results = {
            questions,
            answers: newAnswers,
            score: newScore,
            total: questions.length,
          };
          sessionStorage.setItem("quizwiz-results", JSON.stringify(results));
          router.push("/results");
        } else {
          setCurrentIndex(nextIndex);
          setIsTransitioning(false);
        }
      }, 1500);
    },
    [questions, currentIndex, score, answers, isTransitioning, router]
  );

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading quiz...</div>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8">
      <div className="w-full max-w-4xl">
        <QuizHeader currentIndex={currentIndex} total={questions.length} score={score} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-4xl flex flex-col items-center"
        >
          <QuestionCard
            question={question.question}
            imageUrl={questionImages[currentIndex]}
            imageLoading={loadingImages.has(currentIndex)}
          />

          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div
              className="relative w-full"
              style={{ height: "360px" }}
            >
              {question.options.map((optionText, i) => {
                const pos = CORNER_POSITIONS[i] ?? {};
                return (
                  <div
                    key={`opt-${i}`}
                    className="absolute"
                    style={pos}
                  >
                    <DraggableOption id={`opt-${i}`} text={optionText} />
                  </div>
                );
              })}

              <div
                className={`
                  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  transition-all duration-300
                  ${glowColor === "green" ? "drop-shadow-[0_0_30px_rgba(52,211,153,0.8)]" : ""}
                  ${glowColor === "red" ? "drop-shadow-[0_0_30px_rgba(248,113,113,0.8)]" : ""}
                `}
              >
                <DropZone />
              </div>
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="bg-white/90 text-purple-900 rounded-xl px-6 py-3 shadow-2xl font-medium rotate-3 scale-110">
                  {question.options[parseInt(activeId.replace("opt-", ""), 10)]}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Feedback toast */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`
                  mt-6 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl
                  ${feedback.type === "correct"
                    ? "bg-emerald-500/80 text-white border border-emerald-300/40"
                    : "bg-red-500/80 text-white border border-red-300/40"
                  }
                `}
              >
                {feedback.type === "correct" ? (
                  <span>✅ Correct!</span>
                ) : (
                  <span>❌ Wrong! It was: <strong>{feedback.correctAnswer}</strong></span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
