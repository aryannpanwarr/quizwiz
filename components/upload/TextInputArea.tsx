"use client";

import { ChangeEvent } from "react";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TextInputArea({ value, onChange }: TextInputAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      placeholder="Or paste your text here..."
      className="
        w-full rounded-2xl border border-white/20 bg-white/10
        text-white placeholder-white/40
        px-6 py-4 text-base leading-relaxed
        focus:outline-none focus:border-white/50 focus:bg-white/15
        resize-y transition-all duration-200
      "
      style={{ minHeight: "200px" }}
    />
  );
}
