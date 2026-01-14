import React from 'react';
import { SparkMood } from '../types';

interface SparkyProps {
  mood: SparkMood;
  message?: string;
  isLoading?: boolean;
}

export const Sparky: React.FC<SparkyProps> = React.memo(({ mood, message, isLoading }) => {
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
});

Sparky.displayName = 'Sparky';
