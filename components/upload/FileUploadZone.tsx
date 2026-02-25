"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function FileUploadZone({ onFileSelect, selectedFile }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.type === "text/plain")) {
      onFileSelect(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full rounded-2xl border-2 border-dashed cursor-pointer
        flex flex-col items-center justify-center gap-4 py-16 px-8
        transition-all duration-200
        ${isDragging
          ? "border-purple-300 bg-white/20 scale-[1.02]"
          : "border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        className="hidden"
        onChange={handleChange}
      />

      {selectedFile ? (
        <>
          <div className="text-5xl">📄</div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">{selectedFile.name}</p>
            <p className="text-white/60 text-sm mt-1">{formatSize(selectedFile.size)}</p>
          </div>
          <p className="text-white/40 text-sm">Click or drop to replace</p>
        </>
      ) : (
        <>
          <div className="text-5xl">☁️</div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">Drop your PDF here</p>
            <p className="text-white/60 text-sm mt-1">or click to browse</p>
          </div>
          <p className="text-white/40 text-xs">Supports .pdf and .txt files</p>
        </>
      )}
    </div>
  );
}
