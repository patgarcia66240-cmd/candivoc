import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Volume2, Mic, MicOff, Activity } from 'lucide-react';
import { voiceDetectionService } from '../../services/audio/voiceDetectionService';
import { audioService } from '../../services/audio/audioService';
import { useVoiceLevel } from '../../hooks/useVoiceLevel';
import { ScrollingText } from './ScrollingText';

interface Message {
  id: string;
  sessionId: string;
  content: string;
  speaker: 'user' | 'ai';
  timestamp: Date;
  audioUrl?: string;
  isSpoken?: boolean;
  isSpeaking?: boolean;
  metadata?: {
    sentiment?: number;
    confidence?: number;
    duration?: number;
  };
}

interface VoiceAssistantProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  sessionId: string;
  disabled?: boolean;
}

interface AssistantState {
  isListening: boolean;
  isThinking: boolean;
  isAISpeaking: boolean;
  lastUserMessage: string;
  isActive: boolean;
  currentAIText: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  messages,
  onSendMessage,
  sessionId,
  disabled = false
}) => {
  const [state, setState] = useState<AssistantState>({
    isListening: false,
    isThinking: false,
    isAISpeaking: false,
    lastUserMessage: '',
    isActive: false,
    currentAIText: ''
  });

  const [currentTranscript, setCurrentTranscript] = useState('');
  const stateRef = useRef(state);
  stateRef.current = state;

  // Utiliser le hook de détection de volume réel
  const { volumeLevel } = useVoiceLevel({
    enabled: state.isListening,
    onUpdate: (level) => {
      // Le volume est déjà mis à jour par le hook
    }
  });

  // Détecter quand l'IA parle
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    console.log("🔍 Debug - Latest message:", latestMessage);

    if (latestMessage?.speaker === 'ai') {
      if (latestMessage.isSpeaking) {
        // L'IA commence à parler : arrêter IMMÉDIATEMENT la reconnaissance
        console.log("🔊 L'IA commence à parler - arrêt de la reconnaissance");
        console.log("📝 Texte IA:", latestMessage.content);
        setState(prev => ({
          ...prev,
          isAISpeaking: true,
          isListening: false,
          currentAIText: latestMessage.content,
          isThinking: false
        }));
        voiceDetectionService.stopDetection();
      } else if (latestMessage.isSpoken) {
        // L'IA a terminé de parler : réactiver la reconnaissance après un délai
        console.log("🔇 L'IA a terminé de parler - réactivation de la reconnaissance");
        setState(prev => ({
          ...prev,
          isAISpeaking: false,
          currentAIText: ''
        }));
      }
    }
  }, [messages]);

  // Callbacks pour la détection vocale
  const voiceCallbacks = useMemo(() => ({
    onSpeechStart: () => {
      console.log("🎤 Speech started - Beginning recording");
      setState(prev => ({
        ...prev,
        isListening: true,
        isActive: true
      }));

      // Démarrer l'enregistrement audio
      audioService.startRecording().catch(console.error);
    },

    onSpeechEnd: async (transcript: string) => {
      console.log("🎯 Speech ended - Processing:", transcript);

      // Arrêter l'enregistrement audio
      try {
        await audioService.stopRecording();
      } catch (error) {
        console.warn("Error stopping audio recording:", error);
      }

      // Nettoyer la transcription
      const cleanedTranscript = transcript.trim()
        .replace(/^(euh|ah|m|h|hum|hein|donc|ben|alors)\s+/gi, '')
        .replace(/\s+(euh|ah|m|h|hum|hein|donc|ben|alors)$/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanedTranscript.length > 2) {
        setState(prev => ({
          ...prev,
          isListening: false,
          isThinking: true,
          lastUserMessage: cleanedTranscript
        }));

        setCurrentTranscript('');

        // Envoyer le message à l'IA
        onSendMessage(cleanedTranscript);
      } else {
        setState(prev => ({ ...prev, isListening: false }));
      }
    },

    onSilenceTimeout: () => {
      console.log("⏰ Silence detected");
      setState(prev => ({ ...prev, isListening: false }));
    },

    onError: (error: string) => {
      console.error("Voice detection error:", error);
      setState(prev => ({
        ...prev,
        isListening: false,
        isThinking: false
      }));
    }
  }), [onSendMessage]);

  // Démarrer/arrêter la détection vocale automatique
  useEffect(() => {
    if (disabled) {
      voiceDetectionService.stopDetection();
      return;
    }

    // IMPORTANT : Désactiver TOTALEMENT la reconnaissance quand l'IA parle ou réfléchit
    // pour éviter de transcrire la voix de l'IA
    if (state.isAISpeaking || state.isThinking || !state.isActive) {
      voiceDetectionService.stopDetection();
      return;
    }

    // Si l'IA ne parle pas et qu'on n'est pas en train de réfléchir, activer la détection
    if (state.isActive && !state.isAISpeaking && !state.isThinking) {
      voiceDetectionService.startDetection(voiceCallbacks);
    }

    return () => {
      voiceDetectionService.stopDetection();
    };
  }, [disabled, state.isAISpeaking, state.isThinking, state.isActive]);

  // Mettre à jour le transcript en temps réel
  useEffect(() => {
    const updateTranscript = () => {
      const transcript = voiceDetectionService.getCurrentTranscript();
      if (transcript !== currentTranscript) {
        setCurrentTranscript(transcript);
      }
    };

    const interval = setInterval(updateTranscript, 100);
    return () => clearInterval(interval);
  }, [currentTranscript]);

  // Activer/désactiver manuellement l'assistant
  const toggleAssistant = useCallback(() => {
    if (state.isActive) {
      voiceDetectionService.stopDetection();
      setState(prev => ({
        ...prev,
        isActive: false,
        isListening: false,
        isThinking: false
      }));
    } else {
      setState(prev => ({ ...prev, isActive: true }));
      voiceDetectionService.startDetection(voiceCallbacks);
    }
  }, [state.isActive, voiceCallbacks]);

  
  const getStatusColor = () => {
    if (state.isThinking) return 'text-yellow-600';
    if (state.isAISpeaking) return 'text-blue-600';
    if (state.isListening) return 'text-green-600';
    if (state.isActive) return 'text-gray-600';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (state.isThinking) return '🤔 Réflexion...';
    if (state.isAISpeaking) return '🔊 L\'IA parle...';
    if (state.isListening) return '🎤 J\'écoute...';
    if (state.isActive) return '👂 En attente...';
    return '😴 Inactif';
  };

  const getStatusIcon = () => {
    if (state.isThinking) return <Activity className="w-6 h-6 animate-pulse" />;
    if (state.isAISpeaking) return <Volume2 className="w-6 h-6 animate-pulse" />;
    if (state.isListening) return <Mic className="w-6 h-6 animate-pulse" />;
    return <MicOff className="w-6 h-6" />;
  };

  return (
    <div className={`bg-white rounded-lg border ${state.isActive ? 'border-gray-300' : 'border-gray-200'} p-6 transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Assistant Vocal</h3>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>

        <button
          onClick={toggleAssistant}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            state.isActive
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {state.isActive ? 'ACTIVÉ' : 'ACTIVER'}
        </button>
      </div>

      {/* Indicateur de volume */}
      {state.isListening && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-600">Volume</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${volumeLevel}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Transcript en temps réel */}
      {currentTranscript && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Je comprends :</p>
          <p className="text-gray-800 font-medium">{currentTranscript}</p>
        </div>
      )}

      {/* Dernier message utilisateur */}
      {state.lastUserMessage && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Vous avez dit :</p>
          <p className="text-blue-800 font-medium">{state.lastUserMessage}</p>
        </div>
      )}

      {/* Texte défilant de l'IA */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          {state.isThinking ? "🤔 L'IA réfléchit..." : state.isAISpeaking ? "🔊 L'IA parle :" : "💭 IA prête"}
        </p>
        <ScrollingText
          text={state.isThinking ? "En train de réfléchir à votre question..." : state.currentAIText || "Attente de votre message..."}
          isActive={state.isAISpeaking}
          speed={60}
        />
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Parlez naturellement, l'assistant vous écoute en continu</p>
        <p>• L'assistant s'arrête automatiquement après 2 secondes de silence</p>
        <p>• Vous pouvez interrompre l'IA en commençant à parler</p>
        <p>• Cliquez sur "ACTIVER" pour démarrer l'assistant</p>
      </div>
    </div>
  );
};