"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

interface DraggableOptionProps {
  id: string;
  text: string;
}

export default function DraggableOption({ id, text }: DraggableOptionProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      animate={{
        scale: isDragging ? 1.1 : 1,
        rotate: isDragging ? 3 : 0,
        zIndex: isDragging ? 50 : 1,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`
        bg-white/90 text-purple-900 rounded-xl px-6 py-3 shadow-lg font-medium
        select-none touch-none
        ${isDragging ? "cursor-grabbing shadow-2xl" : "cursor-grab hover:shadow-xl hover:bg-white"}
        transition-shadow duration-200
      `}
    >
      {text}
    </motion.div>
  );
}
