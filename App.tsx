
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, WordPair, AIRemark, GameMode } from './types';
import { DEFAULT_WORDS } from './constants';
import { getAIRemark } from './services/gemini';
import { sounds } from './services/audio';

// --- Firework Particle System ---
class Particle {
  x: number;
  y: number;
  color: string;
  velocity: { x: number; y: number };
  alpha: number;
  friction: number;
  gravity: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = {
      x: (Math.random() - 0.5) * (Math.random() * 12),
      y: (Math.random() - 0.5) * (Math.random() * 12),
    };
    this.alpha = 1;
    this.friction = 0.95;
    this.gravity = 0.15;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
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
    this.alpha -= 0.01;
  }
}

const CatPaw: React.FC<{ show: boolean }> = ({ show }) => (
  <div className={`fixed bottom-0 right-10 transition-transform duration-500 z-50 pointer-events-none ${show ? 'translate-y-0' : 'translate-y-full'}`}>
    <div className="relative w-32 h-48 bg-orange-400 rounded-t-full border-4 border-orange-600 shadow-2xl flex flex-col items-center pt-4">
      {/* Pads */}
      <div className="flex gap-2 mb-2">
        <div className="w-4 h-5 bg-pink-300 rounded-full" />
        <div className="w-5 h-6 bg-pink-300 rounded-full -translate-y-2" />
        <div className="w-4 h-5 bg-pink-300 rounded-full" />
      </div>
      <div className="w-12 h-10 bg-pink-300 rounded-full mb-4" />
      
      {/* Thumbs Up Hand */}
      <div className="absolute -top-12 -right-4 text-6xl animate-bounce">👍</div>
      
      {/* Fur detail */}
      <div className="absolute top-10 left-2 w-1 h-8 bg-orange-500 rounded-full opacity-50" />
      <div className="absolute top-14 right-3 w-1 h-6 bg-orange-500 rounded-full opacity-50" />
    </div>
  </div>
);

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
    history: []
  });

  const [shuffledWords, setShuffledWords] = useState<WordPair[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentRemark, setCurrentRemark] = useState<AIRemark | null>(null);
  const [isLoadingRemark, setIsLoadingRemark] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  // Using any to avoid NodeJS.Timeout namespace error in browser environment
  const timerRef = useRef<any>(null);

  const isChoiceMode = gameState.mode.startsWith('choice-');

  // --- Timer Logic ---
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.isCorrect === null) {
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCheckAnswer(undefined, "TIMEOUT_EXPIRED");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState.status, gameState.currentWordIndex, gameState.isCorrect]);

  // --- Firework Logic ---
  const createFirework = useCallback((x: number, y: number) => {
    const colors = ['#8b5cf6', '#ec4899', '#34d399', '#fbbf24', '#ffffff'];
    const particleCount = 80;
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < particleCount; i++) {
      particles.current.push(new Particle(x, y, color));
    }
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.current.forEach((particle, index) => {
      if (particle.alpha > 0) {
        particle.update();
        particle.draw(ctx);
      } else {
        particles.current.splice(index, 1);
      }
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

  useEffect(() => {
    if (gameState.isCorrect === true) {
      sounds.playCorrect();
      const launchCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < launchCount; i++) {
        setTimeout(() => {
          createFirework(
            window.innerWidth * (0.2 + Math.random() * 0.6),
            window.innerHeight * (0.3 + Math.random() * 0.4)
          );
        }, i * 200);
      }
    } else if (gameState.isCorrect === false) {
      sounds.playIncorrect();
    }
  }, [gameState.isCorrect, createFirework]);

  useEffect(() => {
    if (gameState.status === 'playing' && inputRef.current && !isChoiceMode) {
      inputRef.current.focus();
    }
    if (gameState.status === 'result') {
      sounds.playLevelComplete();
    }
  }, [gameState.status, gameState.currentWordIndex, isChoiceMode]);

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
    const shuffled = [...DEFAULT_WORDS].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setGameState({
      currentWordIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      status: 'playing',
      mode: mode,
      feedback: null,
      isCorrect: null,
      history: []
    });
    setUserInput('');
    setCurrentRemark(null);
    setTimeLeft(30);
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
    } else if (mode === 'ru-en' || mode === 'choice-ru-en') {
        isCorrect = answer === currentWord.en.toLowerCase();
    } else {
        const synonyms = currentWord.ru.split(',').map(s => s.trim().toLowerCase());
        isCorrect = synonyms.includes(answer);
    }
    
    const newScore = isCorrect ? gameState.score + (10 * (gameState.streak + 1)) : gameState.score;
    const newStreak = isCorrect ? gameState.streak + 1 : 0;
    const newBestStreak = Math.max(gameState.bestStreak, newStreak);

    setGameState(prev => ({
      ...prev,
      score: newScore,
      streak: newStreak,
      bestStreak: newBestStreak,
      isCorrect,
      history: [...prev.history, { 
        word: currentWord, 
        isCorrect, 
        userTyped: valueToCheck === "TIMEOUT_EXPIRED" ? "⏳ Time Out" : valueToCheck, 
        mode: gameState.mode 
      }]
    }));

    setIsLoadingRemark(true);
    // Don't await remark to keep the game feel snappier
    getAIRemark(currentWord.en, isCorrect, newStreak).then(remark => {
      setCurrentRemark(remark);
      setIsLoadingRemark(false);
    });

    // Snappier transition: 1.8s instead of 2.5s
    setTimeout(() => {
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
        setGameState(prev => ({ ...prev, status: 'result' }));
      }
    }, 1800);
  };

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 overflow-y-auto">
      <div className="mb-4 animate-float">
        <svg className="w-24 h-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h1 className="text-4xl sm:text-5xl font-game mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
        Galaxy Vocab Quest
      </h1>
      <p className="text-lg text-slate-300 mb-8 max-w-md">
        Welcome Cadet! 30 seconds for each word. Can you handle the pressure? 🚀
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="flex flex-col gap-3 p-4 bg-slate-900/50 rounded-3xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span>⌨️</span> Writing Training
          </h3>
          <button
            onClick={() => handleStartGame('ru-en')}
            className="w-full px-4 py-4 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-95 text-left flex justify-between items-center"
          >
            <span>RU ➡️ EN</span>
            <span className="text-xs bg-black/20 px-2 py-1 rounded">TYPING</span>
          </button>
          <button
            onClick={() => handleStartGame('en-ru')}
            className="w-full px-4 py-4 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-95 text-left flex justify-between items-center"
          >
            <span>EN ➡️ RU</span>
            <span className="text-xs bg-black/20 px-2 py-1 rounded">TYPING</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4 bg-slate-900/50 rounded-3xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span>🃏</span> Memory Cards
          </h3>
          <button
            onClick={() => handleStartGame('choice-ru-en')}
            className="w-full px-4 py-4 bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-95 text-left flex justify-between items-center"
          >
            <span>RU ➡️ EN</span>
            <span className="text-xs bg-black/20 px-2 py-1 rounded">CHOICE</span>
          </button>
          <button
            onClick={() => handleStartGame('choice-en-ru')}
            className="w-full px-4 py-4 bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-95 text-left flex justify-between items-center"
          >
            <span>EN ➡️ RU</span>
            <span className="text-xs bg-black/20 px-2 py-1 rounded">CHOICE</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    const currentWord = shuffledWords[gameState.currentWordIndex];
    if (!currentWord) return null;

    const progress = (gameState.currentWordIndex / shuffledWords.length) * 100;
    const isRuSource = gameState.mode === 'ru-en' || gameState.mode === 'choice-ru-en';
    const sourceWord = isRuSource ? currentWord.ru : currentWord.en;
    const targetLang = isRuSource ? 'English' : 'Russian';

    const timerColor = timeLeft > 15 ? 'text-green-400' : timeLeft > 5 ? 'text-yellow-400' : 'text-red-500 animate-pulse';

    return (
      <div className="flex flex-col h-full max-w-2xl mx-auto p-6">
        <CatPaw show={gameState.isCorrect === true} />
        
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => { sounds.playClick(); setGameState(prev => ({ ...prev, status: 'start' })); }}
            className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold"
          >
            <span>🚪</span> EXIT
          </button>
          
          {/* Timer Circle */}
          <div className={`relative w-14 h-14 flex items-center justify-center rounded-full border-4 ${timeLeft > 5 ? 'border-slate-800' : 'border-red-500/30'}`}>
             <span className={`text-xl font-game ${timerColor}`}>{timeLeft}</span>
             <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="28" cy="28" r="24"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="150"
                  strokeDashoffset={150 - (150 * timeLeft / 30)}
                  className={`${timerColor} transition-all duration-1000 ease-linear`}
                  style={{ transform: 'scale(1.15)', transformOrigin: 'center' }}
                />
             </svg>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800 rounded-full px-4 py-1 border border-slate-700">
              <span className="text-yellow-400 font-bold">⭐ {gameState.score}</span>
            </div>
            <div className="bg-slate-800 rounded-full px-4 py-1 border border-slate-700">
              <span className="text-pink-400 font-bold">🔥 {gameState.streak}</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full mb-8 overflow-hidden border border-slate-700">
          <div 
            className={`h-full bg-gradient-to-r transition-all duration-500 ease-out ${
              !isChoiceMode ? 'from-indigo-500 to-purple-500' : 'from-emerald-500 to-teal-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={`relative flex-1 flex flex-col items-center justify-center bg-slate-800/40 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border-2 transition-all duration-500 ${
          gameState.isCorrect === true ? 'border-green-500 shadow-lg shadow-green-900/20' : 
          gameState.isCorrect === false ? 'border-red-500 shadow-lg shadow-red-900/20' : 
          'border-slate-700'
        }`}>
          {(currentRemark || isLoadingRemark) && (
            <div className="absolute top-0 -translate-y-1/2 bg-slate-700 text-white p-3 sm:p-4 rounded-2xl shadow-xl border border-indigo-500/50 max-w-xs sm:max-w-sm flex items-start gap-3 animate-bounce-short z-20">
              <span className="text-xl sm:text-2xl">🤖</span>
              <p className="text-xs sm:text-sm font-medium">
                {isLoadingRemark ? "Sparky says..." : currentRemark?.text}
              </p>
            </div>
          )}

          <div className="text-center mb-6 w-full">
            <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-4 inline-block ${
              !isChoiceMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {currentWord.category}
            </span>
            <h2 className="text-3xl sm:text-5xl font-game text-white mb-2 leading-tight px-2">{sourceWord}</h2>
            <p className="text-slate-400 text-sm">Translate to {targetLang}:</p>
          </div>

          <div className="w-full max-w-md">
            {!isChoiceMode ? (
              <form onSubmit={(e) => { sounds.playClick(); handleCheckAnswer(e); }} className="w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={gameState.isCorrect !== null}
                  className={`w-full bg-slate-900/80 border-2 rounded-2xl px-6 py-4 text-2xl text-center outline-none transition-all ${
                    gameState.isCorrect === true ? 'border-green-500 text-green-400 bg-green-900/10' :
                    gameState.isCorrect === false ? 'border-red-500 text-red-400 bg-red-900/10' :
                    'border-slate-600 focus:border-indigo-500 text-white shadow-inner'
                  }`}
                  placeholder="Type here..."
                  autoFocus
                  autoComplete="off"
                />
                
                {gameState.isCorrect === null && (
                   <button 
                   type="submit"
                   className={`mt-4 w-full py-4 rounded-2xl text-white font-bold text-xl transition-all shadow-lg active:scale-95 bg-indigo-600 hover:bg-indigo-500`}
                 >
                   CHECK IT!
                 </button>
                )}
              </form>
            ) : (
              <div className="grid grid-cols-1 gap-3 w-full">
                {currentOptions.map((option, idx) => {
                  const isThisCorrectAnswer = isRuSource 
                    ? option.toLowerCase() === currentWord.en.toLowerCase()
                    : currentWord.ru.split(',').map(s => s.trim().toLowerCase()).includes(option.toLowerCase());
                  
                  let btnClass = "bg-slate-900/80 border-slate-700 hover:border-emerald-500 hover:bg-emerald-900/10 text-white";
                  
                  if (gameState.isCorrect !== null) {
                    if (isThisCorrectAnswer) {
                      btnClass = "bg-green-900/20 border-green-500 text-green-400";
                    } else if (gameState.isCorrect === false && gameState.history[gameState.history.length-1].userTyped === option) {
                      btnClass = "bg-red-900/20 border-red-500 text-red-400 opacity-50";
                    } else {
                      btnClass = "opacity-20 border-slate-800 text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => { sounds.playClick(); handleCheckAnswer(undefined, option); }}
                      disabled={gameState.isCorrect !== null}
                      className={`w-full p-4 rounded-2xl border-2 text-lg font-bold transition-all ${btnClass} ${gameState.isCorrect === null ? 'hover:scale-[1.02] active:scale-95' : ''}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {gameState.isCorrect === false && (
              <div className="mt-4 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-slate-500 text-xs mb-1">CORRECT ANSWER:</p>
                <p className="text-green-400 text-2xl font-game">
                  {isRuSource ? currentWord.en : currentWord.ru}
                </p>
              </div>
            )}
            
            {gameState.isCorrect === true && (
              <div className="mt-4 text-center animate-in zoom-in duration-300">
                <p className="text-green-400 text-2xl font-game">AWESOME! +{10 * gameState.streak}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const accuracy = (gameState.history.filter(h => h.isCorrect).length / shuffledWords.length) * 100;

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 overflow-y-auto">
        <div className="mb-4 text-6xl">🌍</div>
        <h2 className="text-4xl sm:text-5xl font-game mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-center">
          Voyage Complete!
        </h2>
        <p className="text-slate-400 text-lg mb-8 text-center">
          Mission Logs for <span className="text-indigo-400 font-bold uppercase">{gameState.mode.replace('choice-', 'Cards ').replace('-', ' to ')}</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-xl">
          <div className="bg-slate-800 rounded-3xl p-5 text-center border border-slate-700 shadow-xl">
            <p className="text-slate-500 text-[10px] uppercase mb-1">Score</p>
            <p className="text-3xl font-game text-yellow-400">{gameState.score}</p>
          </div>
          <div className="bg-slate-800 rounded-3xl p-5 text-center border border-slate-700 shadow-xl">
            <p className="text-slate-500 text-[10px] uppercase mb-1">Max Streak</p>
            <p className="text-3xl font-game text-pink-500">{gameState.bestStreak}</p>
          </div>
          <div className="bg-slate-800 rounded-3xl p-5 text-center border border-slate-700 shadow-xl">
            <p className="text-slate-500 text-[10px] uppercase mb-1">Accuracy</p>
            <p className="text-3xl font-game text-emerald-400">{Math.round(accuracy)}%</p>
          </div>
        </div>

        <button
          onClick={() => { sounds.playClick(); setGameState(prev => ({ ...prev, status: 'start' })); }}
          className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-full text-white font-bold text-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          NEW MISSION 🛰️
        </button>
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden text-slate-100 selection:bg-indigo-500/30">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-1"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Background Starfield */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2}px`,
              height: `${Math.random() * 2}px`,
              animation: `pulse ${2 + Math.random() * 3}s infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full h-full overflow-hidden flex flex-col">
        {gameState.status === 'start' && renderStartScreen()}
        {gameState.status === 'playing' && renderGame()}
        {gameState.status === 'result' && renderResult()}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(0.5); }
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(-50%); }
          50% { transform: translateY(-62%); }
        }
        .animate-bounce-short {
          animation: bounce-short 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
