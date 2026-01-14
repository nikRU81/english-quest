import React from 'react';

interface CatPawProps {
  show: boolean;
}

export const CatPaw: React.FC<CatPawProps> = React.memo(({ show }) => (
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
));

CatPaw.displayName = 'CatPaw';
