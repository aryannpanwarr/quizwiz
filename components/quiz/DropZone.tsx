"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";

interface DropZoneProps {
  onDrop?: (answerId: string) => void;
}

export default function DropZone({ onDrop }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: "drop-zone" });

  return (
    <motion.div
      ref={setNodeRef}
      animate={{
        scale: isOver ? 1.12 : 1,
        boxShadow: isOver
          ? "0 0 30px 8px rgba(167,139,250,0.5)"
          : "0 0 0px 0px rgba(167,139,250,0)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        w-32 h-32 rounded-full flex items-center justify-center
        transition-colors duration-200
        ${isOver
          ? "border-2 border-solid border-purple-300 bg-purple-400/20"
          : "border-2 border-dashed border-white/40 bg-white/5"
        }
      `}
    >
      <span className={`text-sm font-medium select-none ${isOver ? "text-purple-200" : "text-white/50"}`}>
        {isOver ? "Release!" : "Drop here!"}
      </span>
    </motion.div>
  );
}
