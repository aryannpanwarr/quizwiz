"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FileUploadZone from "@/components/upload/FileUploadZone";
import TextInputArea from "@/components/upload/TextInputArea";
import GlassCard from "@/components/ui/GlassCard";
import GradientButton from "@/components/ui/GradientButton";

type Tab = "upload" | "paste";

export default function UploadPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"extracting" | "generating" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (activeTab === "upload" && !selectedFile) {
      setError("Please select a file to upload.");
      return;
    }
    if (activeTab === "paste" && !pastedText.trim()) {
      setError("Please paste some text first.");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Extract text
      setLoadingStep("extracting");
      let uploadResponse: Response;

      if (activeTab === "upload" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
      } else {
        uploadResponse = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pastedText }),
        });
      }

      if (!uploadResponse.ok) throw new Error("Failed to process content. Please try again.");
      const uploadData = await uploadResponse.json();

      // Step 2: Generate quiz directly (skip explanation)
      setLoadingStep("generating");
      const quizResponse = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: uploadData.text }),
      });

      if (!quizResponse.ok) throw new Error("Failed to generate quiz. Please try again.");
      const questions = await quizResponse.json();

      sessionStorage.setItem("quizwiz-quiz", JSON.stringify(questions));
      router.push("/quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
      setLoadingStep(null);
    }
  };

  const loadingLabel =
    loadingStep === "extracting" ? "Extracting content..." :
    loadingStep === "generating" ? "Generating quiz..." :
    "Processing...";

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-white mb-3">
          📚 What do you want to be quizzed on?
        </h1>
        <p className="text-white/70 text-lg">
          Upload a PDF or paste any text — we&apos;ll generate a quiz instantly!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="p-8">
          {/* Tab Switcher */}
          <div className="flex gap-3 mb-6">
            {(["upload", "paste"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-1 py-2.5 px-5 rounded-xl font-medium text-sm transition-all duration-200
                  ${activeTab === tab
                    ? "bg-white/25 text-white border border-white/30"
                    : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80"
                  }
                `}
              >
                {tab === "upload" ? "📁 Upload File" : "📝 Paste Text"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === "upload" ? (
              <FileUploadZone
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            ) : (
              <TextInputArea value={pastedText} onChange={setPastedText} />
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}

          {/* Submit Button */}
          <GradientButton onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {loadingLabel}
              </span>
            ) : (
              "Generate Quiz ✨"
            )}
          </GradientButton>
        </GlassCard>
      </motion.div>
    </div>
  );
}
