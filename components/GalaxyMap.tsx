import React from 'react';
import { Planet } from '../types';

interface GalaxyMapProps {
  currentProgress: number;
  onBack: () => void;
}

export const GalaxyMap: React.FC<GalaxyMapProps> = ({ currentProgress, onBack }) => {
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
