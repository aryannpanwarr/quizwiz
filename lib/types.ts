export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answers: UserAnswer[];
  status: 'idle' | 'loading' | 'explaining' | 'playing' | 'finished';
}

export interface UserAnswer {
  /** Index of the question in the questions array */
  questionIndex: number;
  /** Original question ID (optional, for future use) */
  questionId?: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface ExplanationData {
  title: string;
  summary: string;
  keyPoints: string[];
  concepts: { term: string; definition: string }[];
  /** Alias for concepts, used by explain page */
  keyConcepts: { term: string; definition: string }[];
}

export interface UploadResponse {
  text: string;
  filename?: string;
}
