import { useState, useEffect, useCallback } from 'react';

export interface GameProgress {
  totalScore: number;
  bestStreak: number;
  wordsLearned: string[];
  gamesPlayed: number;
  achievements: string[];
  soundEnabled: boolean;
  lastPlayed: string;
}

const DEFAULT_PROGRESS: GameProgress = {
  totalScore: 0,
  bestStreak: 0,
  wordsLearned: [],
  gamesPlayed: 0,
  achievements: [],
  soundEnabled: true,
  lastPlayed: new Date().toISOString(),
};

const STORAGE_KEY = 'galaxy-vocab-quest-progress';

export function useLocalStorage(): {
  progress: GameProgress;
  updateProgress: (updates: Partial<GameProgress>) => void;
  addLearnedWord: (wordId: string) => void;
  addAchievement: (achievement: string) => void;
  toggleSound: () => void;
  resetProgress: () => void;
} {
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
    return DEFAULT_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [progress]);

  const updateProgress = useCallback((updates: Partial<GameProgress>) => {
    setProgress(prev => ({
      ...prev,
      ...updates,
      lastPlayed: new Date().toISOString(),
    }));
  }, []);

  const addLearnedWord = useCallback((wordId: string) => {
    setProgress(prev => {
      if (prev.wordsLearned.includes(wordId)) return prev;
      return {
        ...prev,
        wordsLearned: [...prev.wordsLearned, wordId],
        lastPlayed: new Date().toISOString(),
      };
    });
  }, []);

  const addAchievement = useCallback((achievement: string) => {
    setProgress(prev => {
      if (prev.achievements.includes(achievement)) return prev;
      return {
        ...prev,
        achievements: [...prev.achievements, achievement],
        lastPlayed: new Date().toISOString(),
      };
    });
  }, []);

  const toggleSound = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
  }, []);

  return {
    progress,
    updateProgress,
    addLearnedWord,
    addAchievement,
    toggleSound,
    resetProgress,
  };
}
