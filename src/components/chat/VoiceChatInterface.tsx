import React, { useState, useEffect, useCallback } from 'react';
import { AudioRecorder } from './AudioRecorder';
import { WaveformVisualizer } from './WaveformVisualizer';
import { ChatInterface } from './ChatInterface';
import { LiveTranscription } from './LiveTranscription';
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
    // Si on détecte du texte (même non final) et que l'IA parle, l'arrêter
    if (transcript.trim() && audioService.isSpeaking()) {
      const result = audioService.stopAIVoice();
      if (result.stopped) {
        setIsAISpeaking(false);
        setWasAIInterrupted(true);

        // Masquer l'indicateur d'interruption après 2 secondes
        setTimeout(() => {
          setWasAIInterrupted(false);
        }, 2000);

        // Mettre à jour visuellement les messages pour indiquer que l'IA a été interrompue
        onTranscriptUpdate && onTranscriptUpdate(transcript, isFinal);
        return;
      }
    }

    // Ne pas traiter les transcriptions si l'IA est en train de parler
    if (isAISpeaking) {
      return;
    }

    setCurrentTranscript(transcript);

    if (isFinal && transcript.trim()) {
      const newEntry = {
        text: transcript,
        timestamp: new Date(),
        isFinal: true
      };
      setTranscriptHistory(prev => [...prev, newEntry]);
      setCurrentTranscript('');

      // Envoyer le message final au chat immédiatement pour une réponse plus rapide
      onSendMessage(transcript);
    }

    // Notifier le parent
    if (onTranscriptUpdate) {
      onTranscriptUpdate(transcript, isFinal);
    }
  }, [onSendMessage, onTranscriptUpdate, isAISpeaking]);

  // Wrapper pour démarrer l'enregistrement avec reconnaissance vocale
  const handleStartRecordingWithTranscription = useCallback(async () => {
    try {
      await onStartRecording();

      // Démarrer la reconnaissance vocale pour la transcription
      await audioService.startSpeechRecognition(handleTranscriptUpdate);
    } catch (error) {
      console.error('Error starting recording with transcription:', error);
    }
  }, [onStartRecording, handleTranscriptUpdate]);

  // Nettoyer la reconnaissance vocale à l'arrêt
  useEffect(() => {
    if (!isRecording) {
      audioService.stopSpeechRecognition();
    }
  }, [isRecording]);

  // Contrôler la reconnaissance vocale quand l'IA parle
  useEffect(() => {
    if (isAISpeaking && audioService.isSpeechRecognitionActive()) {
      // Mettre en pause la reconnaissance vocale quand l'IA parle
      console.log('🔇 Stopping speech recognition - AI is speaking');
      audioService.stopSpeechRecognition();
    } else if (!isAISpeaking && isRecording && !audioService.isSpeechRecognitionActive()) {
      // Reprendre la reconnaissance vocale après que l'IA a fini de parler
      console.log('🎤 Restarting speech recognition - AI finished speaking');
      setTimeout(() => {
        if (!isAISpeaking && isRecording) {
          audioService.startSpeechRecognition(handleTranscriptUpdate).catch(error => {
            console.error('Failed to restart speech recognition:', error);
          });
        }
      }, 1000); // Augmenté le délai pour éviter les interférences
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
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <WaveformVisualizer isRecording={isRecording && !isAISpeaking} />
            <AudioRecorder
              isRecording={isRecording && !isAISpeaking}
              onStartRecording={handleStartRecordingWithTranscription}
              onStopRecording={onStopRecording}
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
