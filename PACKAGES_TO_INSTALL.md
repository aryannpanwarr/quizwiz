# Packages to Install

The following packages need to be installed for Agent 3's components to work:

```bash
npm install @dnd-kit/core @dnd-kit/utilities framer-motion canvas-confetti
npm install -D @types/canvas-confetti
```

## Package Details

| Package | Used In | Purpose |
|---------|---------|---------|
| `@dnd-kit/core` | `components/quiz/DraggableOption.tsx`, `components/quiz/DropZone.tsx`, `app/quiz/page.tsx` | Drag-and-drop primitives (useDraggable, useDroppable, DndContext) |
| `@dnd-kit/utilities` | `components/quiz/DraggableOption.tsx` | CSS transform utilities for dnd-kit |
| `framer-motion` | `components/quiz/DraggableOption.tsx`, `components/quiz/DropZone.tsx`, `app/quiz/page.tsx`, `app/results/page.tsx` | Animations (AnimatePresence, motion, transitions) |
| `canvas-confetti` | `app/results/page.tsx` | Confetti celebration effect on results page |
| `@types/canvas-confetti` | dev dep | TypeScript types for canvas-confetti |
