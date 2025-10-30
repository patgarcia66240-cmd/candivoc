import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface KaraokeTranscriptProps {
  transcript: string;
  isRecording: boolean;
  isFinal: boolean;
  isAISpeaking?: boolean;
  aiText?: string;
  className?: string;
}

export const KaraokeTranscript: React.FC<KaraokeTranscriptProps> = ({
  transcript,
  isRecording,
  isFinal,
  isAISpeaking = false,
  aiText = '',
  className = ""
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiDisplayedText, setAiDisplayedText] = useState('');
  const [aiCurrentIndex, setAiCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Effet de machine à écrire pour le texte utilisateur en temps réel
  useEffect(() => {
    if (!transcript) {
      setDisplayedText('');
      setCurrentIndex(0);
      return;
    }

    // Si c'est un transcript final, afficher tout rapidement
    if (isFinal) {
      setDisplayedText(transcript);
      setCurrentIndex(transcript.length);
      return;
    }

    // Effet machine à écrire pour les transcripts interim
    if (currentIndex < transcript.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(transcript.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 30); // 30ms par caractère pour un effet fluide

      return () => clearTimeout(timeout);
    }
  }, [transcript, currentIndex, isFinal]);

  // Effet de machine à écrire pour le texte IA
  useEffect(() => {
    if (!aiText) {
      setAiDisplayedText('');
      setAiCurrentIndex(0);
      return;
    }

    // Effet machine à écrire pour le texte IA (plus lent pour effet naturel)
    if (aiCurrentIndex < aiText.length) {
      const timeout = setTimeout(() => {
        setAiDisplayedText(aiText.substring(0, aiCurrentIndex + 1));
        setAiCurrentIndex(aiCurrentIndex + 1);
      }, 40); // 40ms par caractère pour l'IA (légèrement plus lent)

      return () => clearTimeout(timeout);
    }
  }, [aiText, aiCurrentIndex]);

  // Auto-scroll pour garder le texte visible
  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const container = containerRef.current;
      const text = textRef.current;

      // Si le texte dépasse la largeur du conteneur, défiler
      if (text.scrollWidth > container.clientWidth) {
        const scrollAmount = text.scrollWidth - container.clientWidth;
        container.scrollTo({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }, [displayedText, aiDisplayedText, isAISpeaking]);

  // Déterminer le mode actuel et le texte à afficher
  const currentText = isAISpeaking ? aiDisplayedText : displayedText;
  const isActive = isAISpeaking || isRecording;
  const actuallyRecording = isRecording && !isAISpeaking;

  if (!isActive && !currentText) {
    return (
      <div className={`relative w-full h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center ${className}`}>
        <Mic className="w-5 h-5 text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Cliquez sur le micro pour commencer</span>
      </div>
    );
  }

  // Style différent pour l'IA vs utilisateur
  const isAIMode = isAISpeaking;
  const bgGradient = isAIMode
    ? 'from-blue-50 to-indigo-50'
    : 'from-orange-50 to-pink-50';
  const borderColor = isAIMode
    ? 'border-blue-400'
    : 'border-orange-400';
  const shadowColor = isAIMode
    ? 'shadow-blue-100'
    : 'shadow-orange-100';

  return (
    <div className={`relative w-full h-12 bg-linear-to-r ${bgGradient} rounded-lg border-2 overflow-hidden transition-all duration-300 ${
      isActive
        ? `${borderColor} shadow-lg ${shadowColor}`
        : 'border-gray-200'
    } ${className}`}>

      {/* Icône et statut */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 flex items-center">
        {isAIMode ? (
          <div className="flex items-center">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="ml-2 text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
              L'IA PARLE
            </span>
          </div>
        ) : actuallyRecording ? (
          <div className="flex items-center">
            <Mic className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="ml-2 text-[10px] text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full">
              ENREGISTREMENT
            </span>
          </div>
        ) : isRecording && isAISpeaking ? (
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">⏸</span>
            </div>
            <span className="ml-2 text-[10px] text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
              EN PAUSE - IA PARLE
            </span>
          </div>
        ) : (
          <div className="flex items-center">
            <MicOff className="w-5 h-5 text-gray-400" />
            <span className="ml-2 text-xs text-gray-500">Terminé</span>
          </div>
        )}
      </div>

      {/* Effet de vague pendant l'activité */}
      {isActive && (
        <div className="absolute  top-0 bottom-0 w-full">
          <div className={`h-full w-1/2 bg-linear-to-r from-transparent  ${
            isAIMode
              ? 'via-blue-200'
              : 'via-orange-500'
          } to-transparent animate-pulse opacity-30`}></div>
        </div>
      )}

      {/* Conteneur du texte avec scroll horizontal */}
      <div
        ref={containerRef}
        className="absolute left-40 right-4 top-1/2 transform -translate-y-1/2 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE/Edge
        }}
      >
        <div
          ref={textRef}
          className="whitespace-nowrap flex items-center"
        >
          <span className={`text-lg font-medium tracking-wide ${
            isAIMode
              ? 'text-blue-800'
              : isRecording
              ? 'text-gray-800'
              : 'text-gray-600'
          }`}>
            {currentText || (
              <span className={`${isAIMode ? 'text-blue-400' : 'text-gray-500'} italic`}>
                {isAIMode ? "L'IA va parler..." : "Parlez maintenant..."}
              </span>
            )}
          </span>

          {/* Curseur clignotant pendant l'activité */}
          {isActive && (
            <span className={`inline-block w-1 h-5 ml-1 animate-pulse shrink-0 ${
              isAIMode
                ? 'bg-blue-500'
                : 'bg-orange-500'
            }`}></span>
          )}
        </div>
      </div>

      {/* Masques de dégradé pour l'effet de fondu - moins agressifs */}
      <div className={`absolute left-36 top-0 bottom-0 w-6 bg-gradient-to-r ${
        isAIMode
          ? 'from-blue-50'
          : 'from-orange-50'
      } to-transparent z-10 pointer-events-none`} />
      <div className={`absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l ${
        isAIMode
          ? 'from-blue-50'
          : 'from-orange-50'
      } to-transparent z-10 pointer-events-none`} />

      {/* Indicateur de statut */}
      {isActive && (
        <div className={`absolute bottom-1 right-2 text-xs ${
          isAIMode
            ? 'text-blue-600'
            : 'text-orange-600'
        }`}>
          ● {isAIMode ? 'AI' : 'REC'}
        </div>
      )}


    </div>
  );
};
