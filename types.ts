
export type GameMode = 'ru-en' | 'en-ru' | 'choice-ru-en' | 'choice-en-ru';

export interface WordPair {
  id: string;
  ru: string;
  en: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameState {
  currentWordIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  status: 'start' | 'playing' | 'result';
  mode: GameMode;
  feedback: string | null;
  isCorrect: boolean | null;
  history: { word: WordPair; isCorrect: boolean; userTyped: string; mode: GameMode }[];
}

export interface AIRemark {
  text: string;
  type: 'encouragement' | 'fact' | 'hint';
}
