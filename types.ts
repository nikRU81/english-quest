
export type GameMode =
  | 'ru-en'
  | 'en-ru'
  | 'choice-ru-en'
  | 'choice-en-ru'
  | 'speed-run'
  | 'matching'
  | 'survival'
  | 'boss-battle';

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
  status: 'start' | 'playing' | 'result' | 'galaxy-map';
  mode: GameMode;
  feedback: string | null;
  isCorrect: boolean | null;
  history: HistoryEntry[];
  lives: number;
  bossHealth: number;
  maxBossHealth: number;
  wordsPerMinute: number;
  totalTime: number;
}

export interface HistoryEntry {
  word: WordPair;
  isCorrect: boolean;
  userTyped: string;
  mode: GameMode;
  responseTime?: number;
}

export interface AIRemark {
  text: string;
  type: 'encouragement' | 'fact' | 'hint';
}

export interface MatchingCard {
  id: string;
  content: string;
  type: 'ru' | 'en';
  wordId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface SparkMood {
  emotion: 'idle' | 'happy' | 'excited' | 'sad' | 'thinking' | 'cheering';
  intensity: number;
}

export interface ComboLevel {
  threshold: number;
  name: string;
  color: string;
  effect: 'none' | 'fire' | 'gold' | 'legendary' | 'supernova';
}

export interface Planet {
  id: number;
  name: string;
  unlocked: boolean;
  completed: boolean;
  wordsRequired: number;
  x: number;
  y: number;
}
