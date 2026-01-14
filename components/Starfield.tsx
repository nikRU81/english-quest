import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Throttle helper
function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

export const Starfield: React.FC = React.memo(() => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    }, 50); // Throttle to 50ms

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
});

Starfield.displayName = 'Starfield';
