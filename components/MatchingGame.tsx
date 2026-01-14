import React, { useState, useEffect } from 'react';
import { WordPair, MatchingCard } from '../types';

interface MatchingGameProps {
  words: WordPair[];
  onComplete: (score: number, moves: number) => void;
  onExit: () => void;
  playSound: (type: 'click' | 'correct' | 'incorrect') => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ words, onComplete, onExit, playSound }) => {
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const selectedWords = words.slice(0, 8);
    const gameCards: MatchingCard[] = [];

    selectedWords.forEach(word => {
      gameCards.push({
        id: `ru-${word.id}`,
        content: word.ru.split(',')[0],
        type: 'ru',
        wordId: word.id,
        isFlipped: false,
        isMatched: false
      });
      gameCards.push({
        id: `en-${word.id}`,
        content: word.en,
        type: 'en',
        wordId: word.id,
        isFlipped: false,
        isMatched: false
      });
    });

    setCards(gameCards.sort(() => Math.random() - 0.5));
  }, [words]);

  const handleCardClick = (cardId: string) => {
    if (isChecking || flippedCards.length >= 2 || flippedCards.includes(cardId)) return;
    if (matchedPairs.includes(cards.find(c => c.id === cardId)?.wordId || '')) return;

    playSound('click');
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);

      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id)!);

      if (first.wordId === second.wordId && first.type !== second.type) {
        playSound('correct');
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, first.wordId]);
          setFlippedCards([]);
          setIsChecking(false);

          if (matchedPairs.length + 1 === cards.length / 2) {
            onComplete((cards.length / 2) * 50, moves + 1);
          }
        }, 500);
      } else {
        playSound('incorrect');
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-6">
      <div className="flex justify-between items-center mb-3 sm:mb-6">
        <button
          onClick={onExit}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 sm:gap-2 text-sm"
        >
          <span>🚪</span> <span className="hidden sm:inline">EXIT</span>
        </button>
        <div className="flex gap-2 sm:gap-4">
          <div className="glass px-2 sm:px-4 py-1 sm:py-2 rounded-full">
            <span className="text-cyan-400 font-display text-xs sm:text-base">Moves: {moves}</span>
          </div>
          <div className="glass px-2 sm:px-4 py-1 sm:py-2 rounded-full">
            <span className="text-green-400 font-display text-xs sm:text-base">Pairs: {matchedPairs.length}/{cards.length / 2}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 max-w-2xl">
          {cards.map((card, index) => {
            const isFlipped = flippedCards.includes(card.id) || matchedPairs.includes(card.wordId);
            const isMatched = matchedPairs.includes(card.wordId);

            return (
              <div
                key={card.id}
                className={`flip-card w-16 h-20 sm:w-24 sm:h-28 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
                onClick={() => handleCardClick(card.id)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flip-card-inner w-full h-full relative">
                  {/* Back */}
                  <div className={`flip-card-front absolute inset-0 rounded-lg sm:rounded-xl
                    bg-gradient-to-br from-purple-600 to-indigo-800
                    border-2 border-purple-400 flex items-center justify-center
                    hover:from-purple-500 hover:to-indigo-700 transition-colors`}
                    style={{ boxShadow: '0 0 15px rgba(124, 58, 237, 0.3)' }}
                  >
                    <span className="text-xl sm:text-3xl">❓</span>
                  </div>

                  {/* Front */}
                  <div className={`flip-card-back absolute inset-0 rounded-lg sm:rounded-xl p-1 sm:p-2
                    flex items-center justify-center text-center
                    ${isMatched
                      ? 'bg-gradient-to-br from-green-500 to-emerald-700 border-green-400'
                      : card.type === 'ru'
                        ? 'bg-gradient-to-br from-pink-500 to-rose-700 border-pink-400'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-700 border-cyan-400'
                    } border-2`}
                    style={{
                      boxShadow: isMatched
                        ? '0 0 20px rgba(52, 211, 153, 0.5)'
                        : `0 0 15px ${card.type === 'ru' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(34, 211, 238, 0.3)'}`
                    }}
                  >
                    <span className="font-medium text-[10px] sm:text-sm text-white leading-tight">
                      {card.content}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
