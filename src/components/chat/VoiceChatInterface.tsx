import React, { useState, useEffect, useCallback } from 'react';
import { AudioRecorder } from './AudioRecorder';
import { WaveformVisualizer } from './WaveformVisualizer';
import { ChatInterface } from './ChatInterface';
import { LiveTranscription } from './LiveTranscription';
import { KaraokeTranscript } from './KaraokeTranscript';
import { audioService } from '../../services/audio/audioService';
import { Volume2, MicOff } from 'lucide-react';

// Interface locale pour éviter les problèmes d'export
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

interface VoiceChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  disabled?: boolean;
  onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
}

export const VoiceChatInterface: React.FC<VoiceChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording,
  disabled = false,
  onTranscriptUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'text' | 'transcript'>('voice');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<Array<{text: string, timestamp: Date, isFinal: boolean}>>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [wasAIInterrupted, setWasAIInterrupted] = useState(false);

  // Gérer les mises à jour de transcription avec traitement plus rapide
  const handleTranscriptUpdate = useCallback((transcript: string, isFinal: boolean) => {
    // Vérifier si la transcription est significative avant d'interrompre l'IA
    const isSignificantSpeech = isFinal &&
      transcript.trim().length > 2 && // Au moins 3 caractères
      !transcript.trim().match(/^(euh|ah|m|h|hum|hein|donc|ben|alors)$/i) && // Exclure les mots de remplissage
      transcript.trim().split(/\s+/).length >= 1; // Au moins un mot valide

    // Si on détecte une parole significative et que l'IA parle, l'arrêter
    if (isSignificantSpeech && audioService.isSpeaking()) {
      const result = audioService.stopAIVoice();
      if (result.stopped) {
        setIsAISpeaking(false);
        setWasAIInterrupted(true);

        // Masquer l'indicateur d'interruption après 2 secondes
        setTimeout(() => {
          setWasAIInterrupted(false);
        }, 2000);

        // Mettre à jour visuellement les messages pour indiquer que l'IA a été interrompue
        if (onTranscriptUpdate) {
          onTranscriptUpdate(transcript, isFinal);
        }
        return;
      }
    }

    // Ne pas traiter les transcriptions si l'IA est en train de parler
    if (isAISpeaking) {
      return;
    }

    // N'afficher que les transcriptions significatives comme texte courant
    if (!isAISpeaking) {
      setCurrentTranscript(transcript);
    }

    if (isFinal && transcript.trim() && transcript.trim().length > 2) {
      // Filtrer les mots de remplissage et les transcriptions trop courtes
      const cleanedTranscript = transcript.trim()
        .replace(/^(euh|ah|m|h|hum|hein|donc|ben|alors)\s+/gi, '') // Retirer les mots de remplissage au début
        .replace(/\s+(euh|ah|m|h|hum|hein|donc|ben|alors)$/gi, ''); // Retirer à la fin

      if (cleanedTranscript.length > 2) {
        const newEntry = {
          text: cleanedTranscript,
          timestamp: new Date(),
          isFinal: true
        };
        setTranscriptHistory(prev => [...prev, newEntry]);
        setCurrentTranscript('');

        // Envoyer le message final au chat immédiatement pour une réponse plus rapide
        onSendMessage(cleanedTranscript);
      }
    }

    // Notifier le parent
    if (onTranscriptUpdate) {
      onTranscriptUpdate(transcript, isFinal);
    }
  }, [onSendMessage, onTranscriptUpdate, isAISpeaking]);

  // Wrapper pour démarrer l'enregistrement avec reconnaissance vocale
  const handleStartRecordingWithTranscription = useCallback(async () => {
    console.log("🎤 Starting recording with speech recognition...");

    // Réinitialiser le transcript courant
    setCurrentTranscript('');

    try {
      await onStartRecording();
      console.log("✅ Audio recording started, starting speech recognition...");

      // Vérifier que l'IA ne parle pas avant de démarrer la reconnaissance
      if (!isAISpeaking) {
        // Démarrer la reconnaissance vocale pour la transcription
        await audioService.startSpeechRecognition(handleTranscriptUpdate);
        console.log("✅ Speech recognition started successfully");
      } else {
        console.log("⚠️ AI is speaking, skipping speech recognition start");
      }
    } catch (error) {
      console.error('❌ Error starting recording with transcription:', error);
    }
  }, [onStartRecording, handleTranscriptUpdate, isAISpeaking]);

  // Wrapper pour arrêter l'enregistrement de manière plus robuste
  const handleStopRecordingWrapper = useCallback(async () => {
    console.log("🛑 VoiceChatInterface - Stop recording requested");

    // Forcer l'arrêt de tout immédiatement
    audioService.stopSpeechRecognition();
    audioService.abortSpeechRecognition();

    // Appeler la fonction parent immédiatement (sans await pour éviter les blocages)
    try {
      onStopRecording();
    } catch (error) {
      console.error("❌ Error in onStopRecording:", error);
    }

    console.log("✅ Recording stop sequence completed");
  }, [onStopRecording]);

  // Nettoyer la reconnaissance vocale à l'arrêt
  useEffect(() => {
    if (!isRecording) {
      console.log("🛑 Recording stopped, cleaning up speech recognition");
      audioService.stopSpeechRecognition();
      audioService.abortSpeechRecognition(); // Forcer l'arrêt complet
    }
  }, [isRecording]);

  // Gestionnaire d'événements clavier pour l'arrêt d'urgence
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Barre d'espace pour arrêter d'urgence (quand l'utilisateur parle)
      if (event.code === 'Space' && isRecording) {
        // Ne pas intercepter si on est dans un champ de texte
        const activeElement = document.activeElement;
        if (activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true'
        )) {
          return; // Laisser la barre d'espace fonctionner normalement dans les champs de texte
        }

        event.preventDefault(); // Empêcher le scroll de la page
        console.log("🚨 Emergency stop triggered by spacebar");

        // Forcer l'arrêt immédiat
        handleStopRecordingWrapper();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRecording, handleStopRecordingWrapper]);

  // Contrôler la reconnaissance vocale quand l'IA parle
  useEffect(() => {
    if (isAISpeaking && audioService.isSpeechRecognitionActive()) {
      // Mettre en pause la reconnaissance vocale quand l'IA parle
      console.log('🔇 Stopping speech recognition - AI is speaking');
      audioService.stopSpeechRecognition();
    }
  }, [isAISpeaking]);

  // Redémarrer la reconnaissance vocale quand l'IA arrête de parler
  useEffect(() => {
    if (!isAISpeaking && isRecording && !audioService.isSpeechRecognitionActive()) {
      // Redémarrer la reconnaissance quand l'IA termine de parler
      console.log('🔊 Restarting speech recognition - AI stopped speaking');

      // Utiliser un délai plus long pour éviter les interférences
      const restartDelay = setTimeout(() => {
        if (isRecording && !isAISpeaking && !audioService.isSpeechRecognitionActive()) {
          console.log('🎤 Actually restarting speech recognition now...');
          audioService.startSpeechRecognition(handleTranscriptUpdate)
            .then(() => {
              console.log('✅ Speech recognition restarted successfully');
            })
            .catch((error) => {
              console.error('❌ Failed to restart speech recognition:', error);
            });
        }
      }, 1000); // Délai de 1 seconde pour s'assurer que l'IA a bien terminé

      return () => clearTimeout(restartDelay);
    }
  }, [isAISpeaking, isRecording, handleTranscriptUpdate]);

  // Surveiller les messages pour détecter quand l'IA parle
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.speaker === 'ai') {
      if (latestMessage.isSpeaking) {
        setIsAISpeaking(true);
      } else if (latestMessage.isSpoken) {
        setIsAISpeaking(false);
      }
    }
  }, [messages]);

  // Debug: logger l'état d'enregistrement
  const actualIsDisabled = disabled || (isAISpeaking && !isRecording);
  console.log("🔍 VoiceChatInterface render - isRecording:", isRecording, "isAISpeaking:", isAISpeaking, "actualIsDisabled:", actualIsDisabled);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
            activeTab === 'voice'
              ? 'text-gray-600 border-b-2 border-slate-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎤 Voix
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
            activeTab === 'text'
              ? 'text-gray-600 border-b-2 border-slate-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
            activeTab === 'transcript'
              ? 'text-gray-600 border-b-2 border-slate-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📝 Transcription
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Indicateur IA interrompue */}
        {wasAIInterrupted && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center space-x-3">
            <div className="bg-orange-500 rounded-full p-2">
              <MicOff className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-900">
                IA interrompue
              </p>
              <p className="text-xs text-orange-600">
                Vous avez repris la parole
              </p>
            </div>
          </div>
        )}

        {/* Indicateur IA qui parle */}
        {isAISpeaking && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-3 animate-pulse">
            <div className="bg-blue-500 rounded-full p-2">
              <Volume2 className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                L'IA est en train de parler...
              </p>
              <p className="text-xs text-blue-600">
                La reconnaissance vocale est temporairement désactivée
              </p>
            </div>
          </div>
        )}

        {activeTab === 'voice' ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            {/* Composant Karaoké pour transcription en temps réel */}
            <div className="w-full max-w-2xl">
              <KaraokeTranscript
                transcript={currentTranscript}
                isRecording={isRecording && !isAISpeaking}
                isFinal={false}
                isAISpeaking={isAISpeaking}
                aiText={isAISpeaking && messages.length > 0 ? messages[messages.length - 1]?.content || '' : ''}
              />
            </div>

            <WaveformVisualizer isRecording={isRecording && !isAISpeaking} />
            <AudioRecorder
              isRecording={isRecording && !isAISpeaking}
              onStartRecording={handleStartRecordingWithTranscription}
              onStopRecording={handleStopRecordingWrapper}
              isDisabled={disabled || isAISpeaking}
            />
          </div>
        ) : activeTab === 'text' ? (
          <ChatInterface
            messages={messages}
            onSendMessage={onSendMessage}
            disabled={disabled}
          />
        ) : (
          <LiveTranscription
            currentTranscript={currentTranscript}
            transcriptHistory={transcriptHistory}
            isRecording={isRecording && !isAISpeaking}
          />
        )}
      </div>
    </div>
  );
};
