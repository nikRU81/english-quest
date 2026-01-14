import React, { useState, useEffect } from 'react';
import { WordPair } from '../types';

interface BossBattleProps {
  word: WordPair;
  bossHealth: number;
  maxHealth: number;
  onAnswer: (answer: string) => void;
  isCorrect: boolean | null;
  userInput: string;
  setUserInput: (val: string) => void;
}

export const BossBattle: React.FC<BossBattleProps> = ({
  word, bossHealth, maxHealth, onAnswer, isCorrect, userInput, setUserInput
}) => {
  const healthPercent = (bossHealth / maxHealth) * 100;
  const [showDamage, setShowDamage] = useState(false);

  useEffect(() => {
    if (isCorrect === true) {
      setShowDamage(true);
      setTimeout(() => setShowDamage(false), 300);
    }
  }, [isCorrect]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 sm:gap-8 p-4 sm:p-6">
      {/* Boss */}
      <div className={`relative ${showDamage ? 'boss-damaged' : 'boss-float'}`}>
        <div className="text-6xl sm:text-8xl" style={{ filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.6))' }}>
          👾
        </div>

        {/* Health Bar */}
        <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 w-36 sm:w-48">
          <div className="h-3 sm:h-4 bg-slate-800 rounded-full overflow-hidden border-2 border-red-900">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 progress-glow"
              style={{ width: `${healthPercent}%`, color: 'rgba(239, 68, 68, 0.8)' }}
            />
          </div>
          <p className="text-center text-[10px] sm:text-xs text-red-400 mt-1 font-mono">
            {bossHealth}/{maxHealth} HP
          </p>
        </div>
      </div>

      {/* Word Card */}
      <div className={`glass rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center max-w-lg w-full ${
        isCorrect === true ? 'border-green-500 border-2' :
        isCorrect === false ? 'border-red-500 border-2 animate-shake' : ''
      }`}>
        <span className="px-2 sm:px-3 py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-red-500/20 text-red-300">
          {word.category} • HARD
        </span>
        <h2 className="text-2xl sm:text-4xl font-display text-white my-3 sm:my-4">{word.ru}</h2>
        <p className="text-slate-400 text-xs sm:text-base">Defeat the boss with the correct translation!</p>

        <form onSubmit={(e) => { e.preventDefault(); onAnswer(userInput); }} className="mt-4 sm:mt-6">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isCorrect !== null}
            className={`w-full bg-slate-900/80 border-2 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-2xl text-center outline-none transition-all font-mono ${
              isCorrect === true ? 'border-green-500 text-green-400' :
              isCorrect === false ? 'border-red-500 text-red-400' :
              'border-slate-600 focus:border-red-500 text-white'
            }`}
            placeholder="Your attack..."
            autoFocus
            autoComplete="off"
          />

          {isCorrect === null && (
            <button
              type="submit"
              className="mt-3 sm:mt-4 w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600
                hover:from-red-500 hover:to-orange-500 text-white font-display text-lg sm:text-xl
                transition-all active:scale-95 btn-cosmic"
            >
              ⚔️ ATTACK!
            </button>
          )}
        </form>

        {isCorrect === false && (
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-slate-500 text-[10px] sm:text-xs">CORRECT ANSWER:</p>
            <p className="text-green-400 text-lg sm:text-xl font-display">{word.en}</p>
          </div>
        )}

        {isCorrect === true && (
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-green-400 text-xl sm:text-2xl font-display">CRITICAL HIT! 💥</p>
          </div>
        )}
      </div>
    </div>
  );
};
