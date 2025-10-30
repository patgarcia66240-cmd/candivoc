import React, { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';

interface ScrollingTextProps {
  text: string;
  isActive: boolean;
  speed?: number; // pixels par seconde
  className?: string;
}

export const ScrollingText: React.FC<ScrollingTextProps> = ({
  text,
  isActive,
  speed = 50, // 50 pixels par seconde par défaut
  className = ""
}) => {
  const [position, setPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  // Réinitialiser la position quand le texte change
  useEffect(() => {
    if (!text) {
      setPosition(0);
      return;
    }

    // Recommencer depuis la droite quand un nouveau texte commence
    setPosition(100);
  }, [text]);

  // Animation de défilement
  useEffect(() => {
    if (!isActive || !text || isPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Calculer la largeur du conteneur et du texte
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.offsetWidth;

        // Si le texte est plus court que le conteneur, pas besoin de défiler
        if (textWidth <= containerWidth) {
          setPosition(0);
          return;
        }

        // Défiler le texte
        setPosition((prevPosition) => {
          const newPosition = prevPosition - (speed * deltaTime) / 1000;

          // Quand le texte a complètement défilé, recommencer depuis la droite
          if (newPosition < -100) {
            return containerWidth;
          }

          return newPosition;
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = undefined;
    };
  }, [isActive, text, speed, isPaused]);

  // Gérer le survol pour mettre en pause
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    lastTimeRef.current = undefined;
  };

  if (!text) {
    return (
      <div className={`flex items-center justify-center h-8 text-gray-400 ${className}`}>
        <Volume2 className="w-4 h-4 mr-2" />
        <span className="text-sm">En attente...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg overflow-hidden border border-blue-200 shadow-sm ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icône et statut */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 flex items-center">
        <Volume2 className={`w-4 h-4 text-blue-600 ${isActive ? 'animate-pulse' : ''}`} />
        <span className="ml-1 text-xs text-blue-600 font-medium">IA</span>
      </div>

      {/* Masques de dégradé pour l'effet de fondu */}
      <div className="absolute left-16 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-blue-50 to-transparent z-10 pointer-events-none" />

      {/* Texte défilant */}
      <div
        ref={textRef}
        className="absolute top-1/2 whitespace-nowrap"
        style={{
          left: '70px', // Espace pour l'icône
          transform: `translateY(-50%) translateX(${position}px)`,
          transition: 'none'
        }}
      >
        <span className="text-sm text-gray-800 font-medium leading-relaxed px-2">
          {text}
        </span>
      </div>

      {/* Indicateur de pause au survol */}
      {isPaused && (
        <div className="absolute top-1 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-20">
          Pause
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-0 right-0 text-xs text-gray-400">
          {isActive ? '⏯️' : '⏸️'} pos:{Math.round(position)}
        </div>
      )}
    </div>
  );
};