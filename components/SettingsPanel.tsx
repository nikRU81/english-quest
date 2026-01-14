import React from 'react';
import { GameProgress } from '../hooks/useLocalStorage';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  progress: GameProgress;
  onToggleSound: () => void;
  onResetProgress: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  progress,
  onToggleSound,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
      onResetProgress();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass rounded-2xl p-6 max-w-md w-full animate-float" style={{ animationDuration: '3s' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-display text-hologram mb-6">⚙️ Settings</h2>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{progress.soundEnabled ? '🔊' : '🔇'}</span>
            <span className="text-white font-medium">Sound Effects</span>
          </div>
          <button
            onClick={onToggleSound}
            className={`w-14 h-8 rounded-full transition-all relative ${
              progress.soundEnabled
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-slate-700'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-lg ${
              progress.soundEnabled ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Stats */}
        <div className="py-4 border-b border-slate-700">
          <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-lg p-3 text-center">
              <p className="text-2xl font-display text-yellow-400">{progress.totalScore}</p>
              <p className="text-xs text-slate-400">Total Score</p>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <p className="text-2xl font-display text-orange-400">{progress.bestStreak}</p>
              <p className="text-xs text-slate-400">Best Streak</p>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <p className="text-2xl font-display text-cyan-400">{progress.wordsLearned.length}</p>
              <p className="text-xs text-slate-400">Words Learned</p>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <p className="text-2xl font-display text-purple-400">{progress.gamesPlayed}</p>
              <p className="text-xs text-slate-400">Games Played</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {progress.achievements.length > 0 && (
          <div className="py-4 border-b border-slate-700">
            <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-3">Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {progress.achievements.map((achievement, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20
                    text-yellow-300 text-sm border border-yellow-500/30"
                >
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="pt-4">
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl bg-red-900/30 border border-red-500/30
              text-red-400 hover:bg-red-900/50 transition-colors"
          >
            🗑️ Reset All Progress
          </button>
        </div>
      </div>
    </div>
  );
};
