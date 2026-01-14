import React from 'react';

interface ComboEffectProps {
  streak: number;
}

export const ComboEffect: React.FC<ComboEffectProps> = React.memo(({ streak }) => {
  if (streak < 3) return null;

  const getComboLevel = () => {
    if (streak >= 10) return {
      name: 'LEGENDARY',
      effect: 'legendary-border',
      color: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500'
    };
    if (streak >= 5) return {
      name: 'ON FIRE',
      effect: 'fire-border gold-shimmer',
      color: 'text-yellow-400'
    };
    return {
      name: 'COMBO',
      effect: 'fire-border',
      color: 'text-orange-400'
    };
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
});

ComboEffect.displayName = 'ComboEffect';
