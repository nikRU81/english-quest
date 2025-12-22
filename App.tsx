
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameState, WordPair, AIRemark, GameMode, MatchingCard, SparkMood, Planet } from './types';
import { DEFAULT_WORDS } from './constants';
import { getAIRemark } from './services/gemini';
import { sounds } from './services/audio';

// ============================================
// PARTICLE SYSTEM FOR EFFECTS
// ============================================
class Particle {
  x: number;
  y: number;
  color: string;
  velocity: { x: number; y: number };
  alpha: number;
  friction: number;
  gravity: number;
  size: number;
  type: 'firework' | 'gold' | 'star';

  constructor(x: number, y: number, color: string, type: 'firework' | 'gold' | 'star' = 'firework') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = type;
    this.size = type === 'gold' ? 3 + Math.random() * 3 : 2;

    if (type === 'gold') {
      this.velocity = {
        x: (Math.random() - 0.5) * 4,
        y: -Math.random() * 8 - 2,
      };
      this.gravity = 0.2;
    } else {
      this.velocity = {
        x: (Math.random() - 0.5) * (Math.random() * 14),
        y: (Math.random() - 0.5) * (Math.random() * 14),
      };
      this.gravity = 0.12;
    }
    this.alpha = 1;
    this.friction = 0.96;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    if (this.type === 'gold') {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.type === 'gold' ? 0.008 : 0.012;
  }
}

// ============================================
// CAT PAW COMPONENT (Thumbs Up on Correct Answer)
// ============================================
const CatPaw: React.FC<{ show: boolean }> = ({ show }) => (
  <div className={`fixed bottom-0 right-4 sm:right-10 transition-transform duration-500 z-50 pointer-events-none ${show ? 'translate-y-0' : 'translate-y-full'}`}>
    <div className="relative w-24 sm:w-32 h-36 sm:h-48 bg-gradient-to-b from-orange-300 to-orange-400 rounded-t-full border-4 border-orange-500 shadow-2xl flex flex-col items-center pt-3 sm:pt-4">
      {/* Pads */}
      <div className="flex gap-1 sm:gap-2 mb-1 sm:mb-2">
        <div className="w-3 sm:w-4 h-4 sm:h-5 bg-pink-300 rounded-full shadow-inner" />
        <div className="w-4 sm:w-5 h-5 sm:h-6 bg-pink-300 rounded-full -translate-y-1 sm:-translate-y-2 shadow-inner" />
        <div className="w-3 sm:w-4 h-4 sm:h-5 bg-pink-300 rounded-full shadow-inner" />
      </div>
      <div className="w-10 sm:w-12 h-8 sm:h-10 bg-pink-300 rounded-full mb-2 sm:mb-4 shadow-inner" />

      {/* Thumbs Up */}
      <div className="absolute -top-10 sm:-top-12 -right-2 sm:-right-4 text-5xl sm:text-6xl animate-bounce drop-shadow-lg">👍</div>

      {/* Fur detail */}
      <div className="absolute top-8 sm:top-10 left-2 w-1 h-6 sm:h-8 bg-orange-500 rounded-full opacity-40" />
      <div className="absolute top-10 sm:top-14 right-2 sm:right-3 w-1 h-4 sm:h-6 bg-orange-500 rounded-full opacity-40" />
    </div>
  </div>
);

// ============================================
// SPARKY MASCOT COMPONENT
// ============================================
interface SparkyProps {
  mood: SparkMood;
  message?: string;
  isLoading?: boolean;
}

const Sparky: React.FC<SparkyProps> = ({ mood, message, isLoading }) => {
  const getAnimationClass = () => {
    switch (mood.emotion) {
      case 'happy': return 'sparky-happy';
      case 'excited': return 'sparky-happy';
      case 'sad': return 'sparky-sad';
      case 'cheering': return 'sparky-happy';
      default: return 'sparky-idle';
    }
  };

  const getEyeStyle = () => {
    switch (mood.emotion) {
      case 'happy':
      case 'excited':
      case 'cheering':
        return 'h-1 rounded-full'; // Happy squint
      case 'sad':
        return 'h-3 rounded-t-full'; // Droopy
      default:
        return 'h-4 rounded-full eye-blink';
    }
  };

  const getAntennaColor = () => {
    switch (mood.emotion) {
      case 'happy':
      case 'excited':
      case 'cheering':
        return 'bg-green-400';
      case 'sad':
        return 'bg-red-400';
      default:
        return 'bg-cyan-400';
    }
  };

  return (
    <div className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 z-50 flex flex-col items-start gap-1 sm:gap-2 scale-75 sm:scale-100 origin-bottom-left">
      {/* Speech Bubble */}
      {(message || isLoading) && (
        <div className="glass rounded-xl sm:rounded-2xl px-2 py-2 sm:px-4 sm:py-3 max-w-[140px] sm:max-w-[200px] relative animate-float"
             style={{ animationDuration: '2s' }}>
          <div className="absolute -bottom-2 left-6 sm:left-8 w-3 h-3 sm:w-4 sm:h-4 glass rotate-45" />
          <p className="text-xs sm:text-sm font-medium text-white relative z-10">
            {isLoading ? (
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            ) : message}
          </p>
        </div>
      )}

      {/* Robot Body */}
      <div className={`relative ${getAnimationClass()}`}>
        {/* Antenna */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className={`w-4 h-4 rounded-full ${getAntennaColor()} antenna-pulse`} />
          <div className="w-1 h-4 bg-slate-600" />
        </div>

        {/* Head */}
        <div className="w-20 h-16 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl border-2 border-slate-600 relative overflow-hidden">
          {/* Screen Face */}
          <div className="absolute inset-2 bg-slate-900 rounded-lg flex items-center justify-center gap-3">
            {/* Eyes */}
            <div className={`w-3 ${getEyeStyle()} bg-cyan-400`}
                 style={{ boxShadow: '0 0 10px #22d3ee' }} />
            <div className={`w-3 ${getEyeStyle()} bg-cyan-400`}
                 style={{ boxShadow: '0 0 10px #22d3ee' }} />
          </div>

          {/* Visor Reflection */}
          <div className="absolute top-1 left-1 right-1/2 h-2 bg-white/10 rounded-full" />
        </div>

        {/* Body */}
        <div className="w-16 h-12 mx-auto bg-gradient-to-b from-slate-600 to-slate-700 rounded-b-xl border-2 border-t-0 border-slate-500 relative">
          {/* Chest Light */}
          <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${
            mood.emotion === 'happy' || mood.emotion === 'excited' ? 'bg-green-400' :
            mood.emotion === 'sad' ? 'bg-red-400' : 'bg-blue-400'
          } neon-pulse`} />

          {/* Panel Lines */}
          <div className="absolute bottom-2 left-2 right-2 h-px bg-slate-500" />
        </div>

        {/* Arms */}
        {(mood.emotion === 'cheering' || mood.emotion === 'excited') && (
          <>
            <div className="absolute top-14 -left-4 w-4 h-8 bg-slate-600 rounded-full origin-bottom animate-bounce"
                 style={{ transform: 'rotate(-30deg)', animationDuration: '0.3s' }} />
            <div className="absolute top-14 -right-4 w-4 h-8 bg-slate-600 rounded-full origin-bottom animate-bounce"
                 style={{ transform: 'rotate(30deg)', animationDuration: '0.3s', animationDelay: '0.1s' }} />
          </>
        )}
      </div>
    </div>
  );
};

// ============================================
// PARALLAX STARFIELD
// ============================================
const Starfield: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stars = useMemo(() => {
    return [...Array(80)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      layer: Math.floor(Math.random() * 3),
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3
    }));
  }, []);

  const shootingStars = useMemo(() => {
    return [...Array(5)].map((_, i) => ({
      id: i,
      x: Math.random() * 80,
      y: Math.random() * 40,
      delay: i * 4 + Math.random() * 2
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Nebula Layers */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at ${30 + mousePos.x * 0.5}% ${40 + mousePos.y * 0.5}%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)`,
          transition: 'background 0.3s ease-out'
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at ${70 - mousePos.x * 0.3}% ${60 - mousePos.y * 0.3}%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)`,
          transition: 'background 0.3s ease-out'
        }}
      />

      {/* Stars with Parallax */}
      {stars.map(star => {
        const parallaxFactor = (star.layer + 1) * 0.3;
        return (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: 0.3 + star.layer * 0.25,
              transform: `translate(${mousePos.x * parallaxFactor}px, ${mousePos.y * parallaxFactor}px)`,
              transition: 'transform 0.2s ease-out',
              animation: `pulse ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              boxShadow: star.size > 1.5 ? '0 0 4px rgba(255,255,255,0.5)' : 'none'
            }}
          />
        );
      })}

      {/* Shooting Stars */}
      {shootingStars.map(ss => (
        <div
          key={ss.id}
          className="shooting-star"
          style={{
            left: `${ss.x}%`,
            top: `${ss.y}%`,
            animationDelay: `${ss.delay}s`,
            animationDuration: '4s'
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// COMBO EFFECTS OVERLAY
// ============================================
interface ComboEffectProps {
  streak: number;
}

const ComboEffect: React.FC<ComboEffectProps> = ({ streak }) => {
  if (streak < 3) return null;

  const getComboLevel = () => {
    if (streak >= 10) return { name: 'LEGENDARY', effect: 'legendary-border', color: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500' };
    if (streak >= 5) return { name: 'ON FIRE', effect: 'fire-border gold-shimmer', color: 'text-yellow-400' };
    return { name: 'COMBO', effect: 'fire-border', color: 'text-orange-400' };
  };

  const combo = getComboLevel();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className={`px-6 py-2 rounded-full ${combo.effect} bg-slate-900/90`}>
        <span className={`font-display text-2xl font-bold ${combo.color}`}>
          {combo.name} x{streak}
        </span>
      </div>
    </div>
  );
};

// ============================================
// GALAXY MAP COMPONENT
// ============================================
interface GalaxyMapProps {
  currentProgress: number;
  onBack: () => void;
}

const GalaxyMap: React.FC<GalaxyMapProps> = ({ currentProgress, onBack }) => {
  const planets: Planet[] = [
    { id: 1, name: 'Terra Nova', unlocked: true, completed: currentProgress >= 5, wordsRequired: 5, x: 15, y: 70 },
    { id: 2, name: 'Lexicon Prime', unlocked: currentProgress >= 5, completed: currentProgress >= 10, wordsRequired: 10, x: 30, y: 45 },
    { id: 3, name: 'Syntax Nebula', unlocked: currentProgress >= 10, completed: currentProgress >= 15, wordsRequired: 15, x: 50, y: 60 },
    { id: 4, name: 'Grammar Station', unlocked: currentProgress >= 15, completed: currentProgress >= 20, wordsRequired: 20, x: 65, y: 35 },
    { id: 5, name: 'Fluency Core', unlocked: currentProgress >= 20, completed: currentProgress >= 25, wordsRequired: 25, x: 85, y: 55 },
  ];

  return (
    <div className="h-full flex flex-col p-3 sm:p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 sm:gap-2 font-medium text-sm"
        >
          <span className="text-lg sm:text-xl">←</span> <span className="hidden sm:inline">Back to Launch Bay</span><span className="sm:hidden">Back</span>
        </button>
        <div className="font-display text-cyan-400 text-xs sm:text-base">
          Progress: {currentProgress}/25
        </div>
      </div>

      <div className="flex-1 relative">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          {planets.slice(0, -1).map((planet, i) => {
            const next = planets[i + 1];
            return (
              <line
                key={planet.id}
                x1={`${planet.x}%`}
                y1={`${planet.y}%`}
                x2={`${next.x}%`}
                y2={`${next.y}%`}
                stroke={planet.completed ? '#22d3ee' : '#334155'}
                strokeWidth="2"
                strokeDasharray={planet.completed ? 'none' : '8 4'}
                className={planet.completed ? 'neon-pulse' : ''}
                style={{ filter: planet.completed ? 'drop-shadow(0 0 6px #22d3ee)' : 'none' }}
              />
            );
          })}
        </svg>

        {/* Planets */}
        {planets.map((planet, index) => (
          <div
            key={planet.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${planet.x}%`,
              top: `${planet.y}%`,
              zIndex: 1,
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div
              className={`relative flex flex-col items-center animate-float`}
              style={{ animationDelay: `${index * 0.5}s` }}
            >
              {/* Planet */}
              <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-lg sm:text-2xl
                ${planet.completed ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                  planet.unlocked ? 'bg-gradient-to-br from-purple-500 to-indigo-700' :
                  'bg-gradient-to-br from-slate-600 to-slate-800'}
                ${planet.unlocked ? 'cursor-pointer hover:scale-110 transition-transform' : 'opacity-50'}
                border-2 sm:border-4 ${planet.completed ? 'border-green-300' : planet.unlocked ? 'border-purple-400' : 'border-slate-500'}
              `}
              style={{
                boxShadow: planet.completed
                  ? '0 0 20px rgba(52, 211, 153, 0.5), inset 0 0 20px rgba(255,255,255,0.1)'
                  : planet.unlocked
                    ? '0 0 20px rgba(124, 58, 237, 0.5), inset 0 0 20px rgba(255,255,255,0.1)'
                    : 'none'
              }}
            >
              {planet.completed ? '⭐' : planet.unlocked ? '🌍' : '🔒'}
            </div>

              {/* Planet Name */}
              <div className="mt-1 sm:mt-2 text-center">
                <p className={`font-display text-[8px] sm:text-xs ${planet.unlocked ? 'text-white' : 'text-slate-500'}`}>
                  {planet.name}
                </p>
                <p className="text-[8px] sm:text-[10px] text-slate-400">
                  {planet.wordsRequired} words
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Rocket Ship at current progress */}
        <div
          className="absolute w-8 h-8 sm:w-12 sm:h-12 transform -translate-x-1/2 -translate-y-1/2 z-10 animate-float"
          style={{
            left: `${planets[Math.min(Math.floor(currentProgress / 5), 4)].x + 5}%`,
            top: `${planets[Math.min(Math.floor(currentProgress / 5), 4)].y - 10}%`
          }}
        >
          <div className="text-2xl sm:text-4xl" style={{ filter: 'drop-shadow(0 0 10px #fbbf24)' }}>🚀</div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MATCHING GAME COMPONENT
// ============================================
interface MatchingGameProps {
  words: WordPair[];
  onComplete: (score: number, moves: number) => void;
  onExit: () => void;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ words, onComplete, onExit }) => {
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

    sounds.playClick();
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);

      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id)!);

      if (first.wordId === second.wordId && first.type !== second.type) {
        sounds.playCorrect();
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, first.wordId]);
          setFlippedCards([]);
          setIsChecking(false);

          if (matchedPairs.length + 1 === cards.length / 2) {
            onComplete((cards.length / 2) * 50, moves + 1);
          }
        }, 500);
      } else {
        sounds.playIncorrect();
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

// ============================================
// BOSS BATTLE COMPONENT
// ============================================
interface BossBattleProps {
  word: WordPair;
  bossHealth: number;
  maxHealth: number;
  onAnswer: (answer: string) => void;
  isCorrect: boolean | null;
  userInput: string;
  setUserInput: (val: string) => void;
}

const BossBattle: React.FC<BossBattleProps> = ({
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

// ============================================
// MAIN APP COMPONENT
// ============================================
const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    status: 'start',
    mode: 'ru-en',
    feedback: null,
    isCorrect: null,
    history: [],
    lives: 3,
    bossHealth: 100,
    maxBossHealth: 100,
    wordsPerMinute: 0,
    totalTime: 0
  });

  const [shuffledWords, setShuffledWords] = useState<WordPair[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentRemark, setCurrentRemark] = useState<AIRemark | null>(null);
  const [isLoadingRemark, setIsLoadingRemark] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [sparkyMood, setSparkyMood] = useState<SparkMood>({ emotion: 'idle', intensity: 1 });

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const isChoiceMode = gameState.mode.startsWith('choice-');
  const isSpeedRun = gameState.mode === 'speed-run';
  const isSurvival = gameState.mode === 'survival';
  const isBossBattle = gameState.mode === 'boss-battle';
  const isMatching = gameState.mode === 'matching';

  // Timer Logic
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.isCorrect === null && !isMatching) {
      const timeLimit = isSpeedRun ? 60 : isBossBattle ? 20 : 30;
      setTimeLeft(timeLimit);

      if (isSpeedRun && startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            if (isSpeedRun) {
              setGameState(prev => ({ ...prev, status: 'result', totalTime: 60 }));
            } else {
              handleCheckAnswer(undefined, "TIMEOUT_EXPIRED");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState.status, gameState.currentWordIndex, gameState.isCorrect, isSpeedRun, isMatching]);

  // Particle Animation
  const createFirework = useCallback((x: number, y: number, type: 'firework' | 'gold' = 'firework') => {
    const colors = type === 'gold'
      ? ['#fbbf24', '#f59e0b', '#fcd34d', '#ffffff']
      : ['#7c3aed', '#ec4899', '#22d3ee', '#34d399', '#fbbf24'];
    const particleCount = type === 'gold' ? 30 : 80;

    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.current.push(new Particle(x, y, color, type));
    }
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.current = particles.current.filter(particle => {
      if (particle.alpha > 0) {
        particle.update();
        particle.draw(ctx);
        return true;
      }
      return false;
    });

    animationFrameId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    animate();
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [animate]);

  // Effects on correct/incorrect
  useEffect(() => {
    if (gameState.isCorrect === true) {
      sounds.playCorrect();
      setSparkyMood({ emotion: gameState.streak >= 5 ? 'cheering' : 'happy', intensity: 1 });

      const launchCount = 3 + Math.floor(gameState.streak * 0.5);
      for (let i = 0; i < launchCount; i++) {
        setTimeout(() => {
          createFirework(
            window.innerWidth * (0.2 + Math.random() * 0.6),
            window.innerHeight * (0.3 + Math.random() * 0.4)
          );
        }, i * 150);
      }

      // Gold rain for streak >= 5
      if (gameState.streak >= 5) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createFirework(
              window.innerWidth * (0.3 + Math.random() * 0.4),
              50,
              'gold'
            );
          }, i * 100 + 200);
        }
      }
    } else if (gameState.isCorrect === false) {
      sounds.playIncorrect();
      setSparkyMood({ emotion: 'sad', intensity: 1 });
    }

    // Reset mood after delay
    const timer = setTimeout(() => {
      setSparkyMood({ emotion: 'idle', intensity: 1 });
    }, 2000);

    return () => clearTimeout(timer);
  }, [gameState.isCorrect, gameState.streak, createFirework]);

  useEffect(() => {
    if (gameState.status === 'playing' && inputRef.current && !isChoiceMode && !isMatching) {
      inputRef.current.focus();
    }
    if (gameState.status === 'result') {
      sounds.playLevelComplete();
    }
  }, [gameState.status, gameState.currentWordIndex, isChoiceMode, isMatching]);

  // Generate options for choice mode
  const generateOptions = (wordIndex: number, words: WordPair[], mode: GameMode) => {
    const currentWord = words[wordIndex];
    const isRuSource = mode === 'choice-ru-en';
    const correctAnswer = isRuSource ? currentWord.en : currentWord.ru;

    const others = words.filter((_, idx) => idx !== wordIndex);
    const distractors = others
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => isRuSource ? w.en : w.ru);

    return [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (gameState.status === 'playing' && isChoiceMode && shuffledWords.length > 0) {
      const options = generateOptions(gameState.currentWordIndex, shuffledWords, gameState.mode);
      setCurrentOptions(options);
    }
  }, [gameState.status, gameState.currentWordIndex, gameState.mode, shuffledWords, isChoiceMode]);

  const handleStartGame = (mode: GameMode) => {
    sounds.playClick();

    let wordsToUse = [...DEFAULT_WORDS];

    if (mode === 'boss-battle') {
      wordsToUse = DEFAULT_WORDS.filter(w => w.difficulty === 'hard');
      if (wordsToUse.length < 5) {
        wordsToUse = [...DEFAULT_WORDS].sort(() => Math.random() - 0.5).slice(0, 10);
      }
    }

    const shuffled = wordsToUse.sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    startTimeRef.current = 0;

    setGameState({
      currentWordIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      status: mode === 'galaxy-map' as any ? 'galaxy-map' : 'playing',
      mode: mode,
      feedback: null,
      isCorrect: null,
      history: [],
      lives: mode === 'survival' ? 3 : 0,
      bossHealth: mode === 'boss-battle' ? 100 : 0,
      maxBossHealth: 100,
      wordsPerMinute: 0,
      totalTime: 0
    });
    setUserInput('');
    setCurrentRemark(null);
    setTimeLeft(mode === 'speed-run' ? 60 : mode === 'boss-battle' ? 20 : 30);
    setSparkyMood({ emotion: 'idle', intensity: 1 });
  };

  const handleCheckAnswer = async (e?: React.FormEvent, choiceValue?: string) => {
    if (e) e.preventDefault();
    if (timerRef.current) clearInterval(timerRef.current);

    const valueToCheck = (choiceValue !== undefined ? choiceValue : userInput).trim();
    if (!valueToCheck && choiceValue !== "TIMEOUT_EXPIRED" && gameState.isCorrect !== null) return;

    const currentWord = shuffledWords[gameState.currentWordIndex];
    const mode = gameState.mode;

    const answer = valueToCheck.toLowerCase();
    let isCorrect = false;

    if (valueToCheck === "TIMEOUT_EXPIRED") {
      isCorrect = false;
    } else if (mode === 'ru-en' || mode === 'choice-ru-en' || mode === 'speed-run' || mode === 'survival' || mode === 'boss-battle') {
      isCorrect = answer === currentWord.en.toLowerCase();
    } else {
      const synonyms = currentWord.ru.split(',').map(s => s.trim().toLowerCase());
      isCorrect = synonyms.includes(answer);
    }

    let newScore = isCorrect ? gameState.score + (10 * (gameState.streak + 1)) : gameState.score;
    const newStreak = isCorrect ? gameState.streak + 1 : 0;
    const newBestStreak = Math.max(gameState.bestStreak, newStreak);
    let newLives = gameState.lives;
    let newBossHealth = gameState.bossHealth;

    // Mode-specific logic
    if (isSurvival && !isCorrect) {
      newLives = gameState.lives - 1;
    }

    if (isBossBattle && isCorrect) {
      newBossHealth = Math.max(0, gameState.bossHealth - 20);
      newScore += 50; // Bonus for boss damage
    }

    setGameState(prev => ({
      ...prev,
      score: newScore,
      streak: newStreak,
      bestStreak: newBestStreak,
      isCorrect,
      lives: newLives,
      bossHealth: newBossHealth,
      history: [...prev.history, {
        word: currentWord,
        isCorrect,
        userTyped: valueToCheck === "TIMEOUT_EXPIRED" ? "⏳ Time Out" : valueToCheck,
        mode: gameState.mode
      }]
    }));

    // Get AI remark
    setIsLoadingRemark(true);
    getAIRemark(currentWord.en, isCorrect, newStreak).then(remark => {
      setCurrentRemark(remark);
      setIsLoadingRemark(false);
    });

    // Check for game over conditions
    setTimeout(() => {
      // Survival mode - out of lives
      if (isSurvival && newLives <= 0) {
        setGameState(prev => ({ ...prev, status: 'result' }));
        return;
      }

      // Boss battle - boss defeated
      if (isBossBattle && newBossHealth <= 0) {
        setGameState(prev => ({ ...prev, status: 'result' }));
        return;
      }

      // Normal progression
      if (gameState.currentWordIndex + 1 < shuffledWords.length) {
        setGameState(prev => ({
          ...prev,
          currentWordIndex: prev.currentWordIndex + 1,
          isCorrect: null,
          feedback: null
        }));
        setUserInput('');
        setCurrentRemark(null);
      } else {
        const totalTime = isSpeedRun ? 60 - timeLeft : 0;
        setGameState(prev => ({ ...prev, status: 'result', totalTime }));
      }
    }, 1500);
  };

  const handleMatchingComplete = (score: number, moves: number) => {
    setGameState(prev => ({
      ...prev,
      score: score,
      status: 'result'
    }));
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-start sm:justify-center min-h-full text-center p-4 sm:p-6 overflow-y-auto stagger-enter pt-6 sm:pt-0">
      {/* Logo */}
      <div className="mb-4 sm:mb-6 relative">
        <div className="text-5xl sm:text-7xl animate-float" style={{ filter: 'drop-shadow(0 0 20px #7c3aed)' }}>
          🚀
        </div>
        <div className="absolute -inset-4 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-xl" />
      </div>

      <h1 className="text-3xl sm:text-6xl font-display mb-2 sm:mb-3 text-hologram">
        GALAXY VOCAB QUEST
      </h1>
      <p className="text-sm sm:text-lg text-slate-300 mb-4 sm:mb-8 max-w-md font-light px-2">
        Welcome, Space Cadet! Master English words across the cosmos.
      </p>

      {/* Game Mode Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-4xl pb-4">

        {/* Classic Training */}
        <div className="glass rounded-2xl p-4 space-y-3" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-cyan-400 text-xs font-display uppercase tracking-wider flex items-center gap-2">
            <span className="text-lg">⌨️</span> Classic Training
          </h3>
          <button
            onClick={() => handleStartGame('ru-en')}
            className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600
              rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-95 btn-cosmic
              border border-indigo-400/30"
          >
            <div className="flex justify-between items-center">
              <span>RU → EN</span>
              <span className="text-xs opacity-70 font-mono">TYPING</span>
            </div>
          </button>
          <button
            onClick={() => handleStartGame('en-ru')}
            className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600
              rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-95 btn-cosmic
              border border-indigo-400/30"
          >
            <div className="flex justify-between items-center">
              <span>EN → RU</span>
              <span className="text-xs opacity-70 font-mono">TYPING</span>
            </div>
          </button>
        </div>

        {/* Card Games */}
        <div className="glass rounded-2xl p-4 space-y-3" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-green-400 text-xs font-display uppercase tracking-wider flex items-center gap-2">
            <span className="text-lg">🃏</span> Card Games
          </h3>
          <button
            onClick={() => handleStartGame('choice-ru-en')}
            className="w-full p-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600
              rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-95 btn-cosmic
              border border-emerald-400/30"
          >
            <div className="flex justify-between items-center">
              <span>RU → EN</span>
              <span className="text-xs opacity-70 font-mono">CHOICE</span>
            </div>
          </button>
          <button
            onClick={() => handleStartGame('matching')}
            className="w-full p-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600
              rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-95 btn-cosmic
              border border-emerald-400/30"
          >
            <div className="flex justify-between items-center">
              <span>Memory Match</span>
              <span className="text-xs opacity-70 font-mono">PAIRS</span>
            </div>
          </button>
        </div>

        {/* Challenge Modes */}
        <div className="glass rounded-2xl p-4 space-y-3" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-orange-400 text-xs font-display uppercase tracking-wider flex items-center gap-2">
            <span className="text-lg">⚡</span> Challenge Modes
          </h3>
          <button
            onClick={() => handleStartGame('speed-run')}
            className="w-full p-4 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600
              rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-95 btn-cosmic
              border border-amber-400/30"
          >
            <div className="flex justify-between items-center">
              <span>Speed Run</span>
              <span className="text-xs opacity-70 font-mono">60 SEC</span>
            </div>
          </button>
          <button
            onClick={() => handleStartGame('survival')}
            className="w-full p-4 bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600
              rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-95 btn-cosmic
              border border-rose-400/30"
          >
            <div className="flex justify-between items-center">
              <span>Survival</span>
              <span className="text-xs opacity-70 font-mono">3 LIVES</span>
            </div>
          </button>
        </div>

        {/* Boss Battle - Full Width */}
        <div className="sm:col-span-2 lg:col-span-3 glass rounded-2xl p-4" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => handleStartGame('boss-battle')}
            className="w-full p-6 bg-gradient-to-r from-red-700 via-purple-700 to-red-700
              hover:from-red-600 hover:via-purple-600 hover:to-red-600
              rounded-xl text-white font-display text-xl transition-all hover:scale-[1.01] active:scale-[0.99]
              btn-cosmic border border-red-400/30 relative overflow-hidden"
            style={{ backgroundSize: '200% 100%', animation: 'hologram-shift 3s ease-in-out infinite' }}
          >
            <div className="flex justify-center items-center gap-4">
              <span className="text-3xl">👾</span>
              <span>BOSS BATTLE</span>
              <span className="text-3xl">⚔️</span>
            </div>
            <p className="text-xs opacity-70 mt-1">Defeat the Vocabulary Monster!</p>
          </button>
        </div>

        {/* Galaxy Map */}
        <div className="sm:col-span-2 lg:col-span-3" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={() => setGameState(prev => ({ ...prev, status: 'galaxy-map' }))}
            className="w-full p-4 glass rounded-xl text-cyan-400 font-display transition-all
              hover:bg-cyan-900/20 hover:scale-[1.01] border border-cyan-500/30"
          >
            <div className="flex justify-center items-center gap-3">
              <span className="text-2xl">🗺️</span>
              <span>View Galaxy Map</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    const currentWord = shuffledWords[gameState.currentWordIndex];
    if (!currentWord) return null;

    const progress = ((gameState.currentWordIndex + 1) / shuffledWords.length) * 100;
    const isRuSource = ['ru-en', 'choice-ru-en', 'speed-run', 'survival', 'boss-battle'].includes(gameState.mode);
    const sourceWord = isRuSource ? currentWord.ru : currentWord.en;
    const targetLang = isRuSource ? 'English' : 'Russian';

    const timerColor = timeLeft > 15 ? 'text-green-400' : timeLeft > 5 ? 'text-yellow-400' : 'text-red-500';
    const timerPercent = isSpeedRun ? (timeLeft / 60) * 100 : (timeLeft / 30) * 100;

    return (
      <div className="flex flex-col h-full max-w-2xl mx-auto p-3 sm:p-6">
        <ComboEffect streak={gameState.streak} />
        <CatPaw show={gameState.isCorrect === true} />

        {/* Header */}
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <button
            onClick={() => { sounds.playClick(); setGameState(prev => ({ ...prev, status: 'start' })); }}
            className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <span>🚪</span> EXIT
          </button>

          {/* Timer */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32" cy="32" r="28"
                fill="transparent"
                stroke="rgba(100, 116, 139, 0.3)"
                strokeWidth="4"
              />
              <circle
                cx="32" cy="32" r="28"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={176}
                strokeDashoffset={176 - (176 * timerPercent / 100)}
                className={`${timerColor} transition-all duration-1000 ease-linear`}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px currentColor)` }}
              />
            </svg>
            <span className={`text-lg sm:text-xl font-display ${timerColor}`}>{timeLeft}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-1 sm:gap-2">
            {isSurvival && (
              <div className="flex gap-0.5 sm:gap-1">
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-base sm:text-xl ${i < gameState.lives ? 'heart-beat' : 'opacity-30'}`}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            )}
            <div className="glass rounded-full px-2 sm:px-4 py-1 sm:py-2 flex items-center gap-1 sm:gap-2">
              <span className="text-yellow-400 text-sm sm:text-base">⭐</span>
              <span className="font-display text-yellow-400 text-sm sm:text-base">{gameState.score}</span>
            </div>
            <div className="glass rounded-full px-2 sm:px-4 py-1 sm:py-2 flex items-center gap-1 sm:gap-2">
              <span className="text-orange-400 text-sm sm:text-base">🔥</span>
              <span className="font-display text-orange-400 text-sm sm:text-base">{gameState.streak}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full mb-4 sm:mb-6 overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              isSpeedRun ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
              isSurvival ? 'bg-gradient-to-r from-rose-500 to-pink-500' :
              'bg-gradient-to-r from-cyan-500 to-purple-500'
            }`}
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 10px currentColor'
            }}
          />
        </div>

        {/* Word Card */}
        <div className={`relative flex-1 flex flex-col items-center justify-center glass rounded-2xl sm:rounded-3xl p-4 sm:p-8 transition-all duration-300 ${
          gameState.isCorrect === true ? 'border-2 border-green-500' :
          gameState.isCorrect === false ? 'border-2 border-red-500 animate-shake' :
          'border border-slate-700/50'
        }`}
        style={{
          boxShadow: gameState.isCorrect === true
            ? '0 0 30px rgba(52, 211, 153, 0.3), inset 0 0 30px rgba(52, 211, 153, 0.1)'
            : gameState.isCorrect === false
              ? '0 0 30px rgba(239, 68, 68, 0.3), inset 0 0 30px rgba(239, 68, 68, 0.1)'
              : 'none'
        }}>

          <div className="text-center mb-4 sm:mb-6 w-full">
            <span className={`px-2 sm:px-3 py-1 rounded-md text-[9px] sm:text-[10px] font-display uppercase tracking-widest mb-2 sm:mb-4 inline-block ${
              isSpeedRun ? 'bg-amber-500/20 text-amber-300' :
              isSurvival ? 'bg-rose-500/20 text-rose-300' :
              'bg-purple-500/20 text-purple-300'
            }`}>
              {currentWord.category}
              {currentWord.difficulty === 'hard' && ' • HARD'}
            </span>
            <h2 className="text-2xl sm:text-5xl font-display text-white mb-1 sm:mb-2 leading-tight px-2">{sourceWord}</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Translate to {targetLang}:</p>
          </div>

          <div className="w-full max-w-md px-2 sm:px-0">
            {!isChoiceMode ? (
              <form onSubmit={(e) => { sounds.playClick(); handleCheckAnswer(e); }} className="w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={gameState.isCorrect !== null}
                  className={`w-full bg-slate-900/80 border-2 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-2xl text-center outline-none transition-all font-mono ${
                    gameState.isCorrect === true ? 'border-green-500 text-green-400 bg-green-900/10' :
                    gameState.isCorrect === false ? 'border-red-500 text-red-400 bg-red-900/10' :
                    'border-slate-600 focus:border-purple-500 text-white'
                  }`}
                  placeholder="Type your answer..."
                  autoFocus
                  autoComplete="off"
                />

                {gameState.isCorrect === null && (
                  <button
                    type="submit"
                    className={`mt-3 sm:mt-4 w-full py-3 sm:py-4 rounded-xl text-white font-display text-lg sm:text-xl transition-all active:scale-95 btn-cosmic ${
                      isSpeedRun ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500' :
                      isSurvival ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500' :
                      'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                    }`}
                  >
                    CHECK IT!
                  </button>
                )}
              </form>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:gap-3 w-full">
                {currentOptions.map((option, idx) => {
                  const isThisCorrectAnswer = isRuSource
                    ? option.toLowerCase() === currentWord.en.toLowerCase()
                    : currentWord.ru.split(',').map(s => s.trim().toLowerCase()).includes(option.toLowerCase());

                  let btnClass = "bg-slate-900/80 border-slate-600 sm:hover:border-emerald-500 sm:hover:bg-emerald-900/10 text-white";

                  if (gameState.isCorrect !== null) {
                    if (isThisCorrectAnswer) {
                      btnClass = "bg-green-900/30 border-green-500 text-green-400";
                    } else if (gameState.isCorrect === false && gameState.history[gameState.history.length-1]?.userTyped === option) {
                      btnClass = "bg-red-900/30 border-red-500 text-red-400";
                    } else {
                      btnClass = "opacity-30 border-slate-800 text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={`${gameState.currentWordIndex}-${idx}`}
                      onClick={() => { sounds.playClick(); handleCheckAnswer(undefined, option); }}
                      disabled={gameState.isCorrect !== null}
                      className={`choice-btn w-full p-3 sm:p-4 rounded-xl border-2 text-base sm:text-lg font-medium transition-all ${btnClass} ${
                        gameState.isCorrect === null ? 'sm:hover:scale-[1.02] active:scale-95' : ''
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {gameState.isCorrect === false && (
              <div className="mt-3 sm:mt-4 text-center">
                <p className="text-slate-500 text-xs uppercase tracking-wider">Correct Answer:</p>
                <p className="text-green-400 text-xl sm:text-2xl font-display">
                  {isRuSource ? currentWord.en : currentWord.ru}
                </p>
              </div>
            )}

            {gameState.isCorrect === true && (
              <div className="mt-3 sm:mt-4 text-center">
                <p className="text-green-400 text-xl sm:text-2xl font-display">
                  {gameState.streak >= 5 ? 'INCREDIBLE!' : 'AWESOME!'} +{10 * gameState.streak}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const correctAnswers = gameState.history.filter(h => h.isCorrect).length;
    const accuracy = gameState.history.length > 0
      ? Math.round((correctAnswers / gameState.history.length) * 100)
      : 0;

    const getTitle = () => {
      if (isBossBattle && gameState.bossHealth <= 0) return 'BOSS DEFEATED!';
      if (isSurvival && gameState.lives <= 0) return 'GAME OVER';
      if (accuracy >= 80) return 'STELLAR PERFORMANCE!';
      if (accuracy >= 50) return 'MISSION COMPLETE';
      return 'KEEP TRAINING, CADET';
    };

    return (
      <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 overflow-y-auto stagger-enter">
        <div className="mb-3 sm:mb-4 text-5xl sm:text-7xl animate-float">
          {isBossBattle && gameState.bossHealth <= 0 ? '🏆' :
           isSurvival && gameState.lives <= 0 ? '💔' :
           accuracy >= 80 ? '🌟' : '🚀'}
        </div>

        <h2 className="text-2xl sm:text-5xl font-display mb-2 text-hologram text-center px-2">
          {getTitle()}
        </h2>

        <p className="text-slate-400 text-sm sm:text-lg mb-4 sm:mb-8 text-center">
          Mission: <span className="text-cyan-400 font-display uppercase">
            {gameState.mode.replace(/-/g, ' ')}
          </span>
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8 w-full max-w-2xl">
          <div className="glass rounded-xl sm:rounded-2xl p-2 sm:p-4 text-center">
            <p className="text-slate-500 text-[8px] sm:text-[10px] uppercase tracking-wider mb-1">Score</p>
            <p className="text-xl sm:text-3xl font-display text-yellow-400">{gameState.score}</p>
          </div>
          <div className="glass rounded-xl sm:rounded-2xl p-2 sm:p-4 text-center">
            <p className="text-slate-500 text-[8px] sm:text-[10px] uppercase tracking-wider mb-1">Best Streak</p>
            <p className="text-xl sm:text-3xl font-display text-orange-400">{gameState.bestStreak}</p>
          </div>
          <div className="glass rounded-xl sm:rounded-2xl p-2 sm:p-4 text-center">
            <p className="text-slate-500 text-[8px] sm:text-[10px] uppercase tracking-wider mb-1">Accuracy</p>
            <p className="text-xl sm:text-3xl font-display text-emerald-400">{accuracy}%</p>
          </div>
          <div className="glass rounded-xl sm:rounded-2xl p-2 sm:p-4 text-center">
            <p className="text-slate-500 text-[8px] sm:text-[10px] uppercase tracking-wider mb-1">Words</p>
            <p className="text-xl sm:text-3xl font-display text-cyan-400">{correctAnswers}/{gameState.history.length}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => handleStartGame(gameState.mode)}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500
              rounded-full text-white font-display text-lg sm:text-xl transition-all hover:scale-105 active:scale-95 btn-cosmic"
          >
            TRY AGAIN 🔄
          </button>
          <button
            onClick={() => { sounds.playClick(); setGameState(prev => ({ ...prev, status: 'start' })); }}
            className="px-6 sm:px-8 py-3 sm:py-4 glass rounded-full text-white font-display text-lg sm:text-xl transition-all
              hover:bg-slate-800/50 active:scale-95"
          >
            NEW MISSION
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white">
      {/* Background */}
      <Starfield />

      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full h-full overflow-hidden flex flex-col">
        {gameState.status === 'start' && renderStartScreen()}
        {gameState.status === 'galaxy-map' && (
          <GalaxyMap
            currentProgress={gameState.history.filter(h => h.isCorrect).length}
            onBack={() => setGameState(prev => ({ ...prev, status: 'start' }))}
          />
        )}
        {gameState.status === 'playing' && !isMatching && !isBossBattle && renderGame()}
        {gameState.status === 'playing' && isMatching && (
          <MatchingGame
            words={shuffledWords}
            onComplete={handleMatchingComplete}
            onExit={() => setGameState(prev => ({ ...prev, status: 'start' }))}
          />
        )}
        {gameState.status === 'playing' && isBossBattle && shuffledWords[gameState.currentWordIndex] && (
          <BossBattle
            word={shuffledWords[gameState.currentWordIndex]}
            bossHealth={gameState.bossHealth}
            maxHealth={gameState.maxBossHealth}
            onAnswer={(answer) => handleCheckAnswer(undefined, answer)}
            isCorrect={gameState.isCorrect}
            userInput={userInput}
            setUserInput={setUserInput}
          />
        )}
        {gameState.status === 'result' && renderResult()}
      </div>

      {/* Sparky Mascot */}
      {gameState.status === 'playing' && !isMatching && (
        <Sparky
          mood={sparkyMood}
          message={currentRemark?.text}
          isLoading={isLoadingRemark}
        />
      )}
    </div>
  );
};

export default App;
