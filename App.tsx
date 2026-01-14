import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameState, WordPair, AIRemark, GameMode, SparkMood } from './types';
import { DEFAULT_WORDS, ACHIEVEMENTS } from './constants';
import { getAIRemark } from './services/gemini';
import { sounds } from './services/audio';
import { Particle } from './utils/Particle';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  Starfield,
  Sparky,
  CatPaw,
  ComboEffect,
  GalaxyMap,
  MatchingGame,
  BossBattle,
  SettingsPanel,
} from './components';

// ============================================
// MAIN APP COMPONENT
// ============================================
const App: React.FC = () => {
  // Local storage hook for persistence
  const {
    progress,
    updateProgress,
    addLearnedWord,
    addAchievement,
    toggleSound,
    resetProgress,
  } = useLocalStorage();

  // Sync sound setting
  useEffect(() => {
    sounds.setEnabled(progress.soundEnabled);
  }, [progress.soundEnabled]);

  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: progress.bestStreak,
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
  const [showSettings, setShowSettings] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const isChoiceMode = gameState.mode.startsWith('choice-');
  const isSpeedRun = gameState.mode === 'speed-run';
  const isSurvival = gameState.mode === 'survival';
  const isBossBattle = gameState.mode === 'boss-battle';
  const isMatching = gameState.mode === 'matching';

  // Sound helpers
  const playSound = useCallback((type: 'click' | 'correct' | 'incorrect') => {
    switch (type) {
      case 'click': sounds.playClick(); break;
      case 'correct': sounds.playCorrect(); break;
      case 'incorrect': sounds.playIncorrect(); break;
    }
  }, []);

  // Speak word function
  const speakWord = useCallback((word: string, lang: 'en-US' | 'ru-RU' = 'en-US') => {
    sounds.speak(word, lang);
  }, []);

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
            if (timerRef.current) clearInterval(timerRef.current);
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

  // Check achievements
  const checkAchievements = useCallback((newStreak: number, wordsLearned: number, mode: GameMode, isWin: boolean) => {
    if (wordsLearned === 1) addAchievement(ACHIEVEMENTS.FIRST_WORD);
    if (newStreak >= 5) addAchievement(ACHIEVEMENTS.STREAK_5);
    if (newStreak >= 10) addAchievement(ACHIEVEMENTS.STREAK_10);
    if (wordsLearned >= 25) addAchievement(ACHIEVEMENTS.WORDS_25);
    if (wordsLearned >= 50) addAchievement(ACHIEVEMENTS.WORDS_50);
    if (wordsLearned >= 100) addAchievement(ACHIEVEMENTS.WORDS_100);
    if (mode === 'boss-battle' && isWin) addAchievement(ACHIEVEMENTS.BOSS_SLAYER);
    if (mode === 'survival' && isWin) addAchievement(ACHIEVEMENTS.SURVIVOR);
    if (mode === 'speed-run' && isWin) addAchievement(ACHIEVEMENTS.SPEED_DEMON);
  }, [addAchievement]);

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
      // Update total stats
      const correctAnswers = gameState.history.filter(h => h.isCorrect).length;
      updateProgress({
        totalScore: progress.totalScore + gameState.score,
        bestStreak: Math.max(progress.bestStreak, gameState.bestStreak),
        gamesPlayed: progress.gamesPlayed + 1,
      });
      // Check achievements
      const isWin = isBossBattle ? gameState.bossHealth <= 0 : (isSurvival ? gameState.lives > 0 : true);
      checkAchievements(gameState.bestStreak, progress.wordsLearned.length, gameState.mode, isWin);
    }
  }, [gameState.status, isChoiceMode, isMatching]);

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
      bestStreak: progress.bestStreak,
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

    // Track learned word
    if (isCorrect) {
      addLearnedWord(currentWord.id);
      // Speak the correct answer
      speakWord(currentWord.en, 'en-US');
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
      {/* Settings Button */}
      <button
        onClick={() => { sounds.playClick(); setShowSettings(true); }}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-2xl z-20"
        title="Settings"
      >
        ⚙️
      </button>

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
      <p className="text-sm sm:text-lg text-slate-300 mb-2 font-light px-2">
        Welcome, Space Cadet! Master English words across the cosmos.
      </p>

      {/* Stats Bar */}
      <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-yellow-400">⭐</span>
          <span className="text-yellow-400 font-display text-sm">{progress.totalScore}</span>
        </div>
        <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-cyan-400">📚</span>
          <span className="text-cyan-400 font-display text-sm">{progress.wordsLearned.length}/{DEFAULT_WORDS.length}</span>
        </div>
        <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-orange-400">🔥</span>
          <span className="text-orange-400 font-display text-sm">{progress.bestStreak}</span>
        </div>
      </div>

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

    const progress_percent = ((gameState.currentWordIndex + 1) / shuffledWords.length) * 100;
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
              width: `${progress_percent}%`,
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

            {/* Word with speaker button */}
            <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
              <h2 className="text-2xl sm:text-5xl font-display text-white leading-tight px-2">{sourceWord}</h2>
              <button
                onClick={() => speakWord(isRuSource ? currentWord.ru : currentWord.en, isRuSource ? 'ru-RU' : 'en-US')}
                className="text-xl sm:text-2xl hover:scale-110 transition-transform opacity-60 hover:opacity-100"
                title="Listen"
              >
                🔊
              </button>
            </div>
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
                  const isRuSourceMode = gameState.mode === 'choice-ru-en';
                  const isThisCorrectAnswer = isRuSourceMode
                    ? option.toLowerCase() === currentWord.en.toLowerCase()
                    : currentWord.ru.split(',').map(s => s.trim().toLowerCase()).includes(option.toLowerCase());

                  let btnClass = "bg-slate-900/80 border-slate-600 text-white";

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
                      onClick={(e) => {
                        (e.target as HTMLButtonElement).blur();
                        sounds.playClick();
                        handleCheckAnswer(undefined, option);
                      }}
                      disabled={gameState.isCorrect !== null}
                      className={`w-full p-3 sm:p-4 rounded-xl border-2 text-base sm:text-lg font-medium transition-colors outline-none ${btnClass}`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
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
                <div className="flex items-center justify-center gap-2">
                  <p className="text-green-400 text-xl sm:text-2xl font-display">
                    {isRuSource ? currentWord.en : currentWord.ru}
                  </p>
                  <button
                    onClick={() => speakWord(currentWord.en, 'en-US')}
                    className="text-lg hover:scale-110 transition-transform"
                  >
                    🔊
                  </button>
                </div>
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

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        progress={progress}
        onToggleSound={toggleSound}
        onResetProgress={resetProgress}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full h-full overflow-hidden flex flex-col">
        {gameState.status === 'start' && renderStartScreen()}
        {gameState.status === 'galaxy-map' && (
          <GalaxyMap
            currentProgress={progress.wordsLearned.length}
            onBack={() => setGameState(prev => ({ ...prev, status: 'start' }))}
          />
        )}
        {gameState.status === 'playing' && !isMatching && !isBossBattle && renderGame()}
        {gameState.status === 'playing' && isMatching && (
          <MatchingGame
            words={shuffledWords}
            onComplete={handleMatchingComplete}
            onExit={() => setGameState(prev => ({ ...prev, status: 'start' }))}
            playSound={playSound}
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
