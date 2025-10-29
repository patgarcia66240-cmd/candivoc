import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VoiceChatInterface } from '../components/chat/VoiceChatInterface';
import { ApiKeyAlert } from '../components/chat/ApiKeyAlert';
import { audioService } from '../services/audio/audioService';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../services/auth/useAuth';
import { aiService } from '../services/ai/aiService';
import { cleanTextForSpeech } from '../utils/textCleaner';

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

export const Chat: React.FC = () => {
  const { sessionId } = useParams({ from: '/app/chat/$sessionId' });
  const navigate = useNavigate({ from: '/app/chat/$sessionId' });
  const { settings } = useSettings();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  // Vérifier si la clé API est configurée (depuis le profil utilisateur ou settings locaux)
  const userApiKey = user?.openai_api_key?.trim() || '';
  const settingsApiKey = settings.apiKey?.trim() || '';
  const finalApiKey = userApiKey || settingsApiKey; // Priorité au profil utilisateur
  const hasApiKey = finalApiKey.length > 0;

  useEffect(() => {
    // Initialize chat session
    const initChat = async () => {
      try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For demo purposes, create a session name based on sessionId
        const name = sessionId?.startsWith('demo-')
          ? `Session ${sessionId.replace('demo-', '')}`
          : 'Nouvelle Session';

        setSessionName(name);

        // Initialize with welcome message if no messages exist
        if (messages.length === 0) {
          const welcomeContent = hasApiKey
            ? `Bonjour! Je suis votre assistant IA pour la session "${name}". Comment puis-je vous aider à vous préparer pour votre entretien?`
            : `Bonjour! Je suis votre assistant IA pour la session "${name}". ⚠️ Veuillez configurer votre clé API dans les paramètres pour que je puisse vous répondre.`;

          setMessages([{
            id: '1',
            sessionId: sessionId || 'new',
            content: welcomeContent,
            speaker: 'ai' as const,
            timestamp: new Date(),
            isSpoken: false,
            isSpeaking: false
          }]);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [sessionId, hasApiKey, messages.length]);

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      sessionId: sessionId || 'new',
      content,
      speaker: 'user' as const,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);

    // Simuler une réponse de l'IA avec réponse vocale
    setTimeout(() => {
      generateAIResponse(content);
    }, 1500);
  };

  const generateAIResponse = async (userMessage: string) => {
    // Vérifier si la clé API est disponible
    if (!hasApiKey) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sessionId: sessionId || 'new',
        content: "⚠️ Impossible de générer une réponse : aucune clé API n'est configurée. Veuillez configurer votre clé API dans les paramètres pour pouvoir dialoguer avec l'IA.",
        speaker: 'ai' as const,
        timestamp: new Date(),
        isSpoken: false,
        isSpeaking: false
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    try {
      // Préparer l'historique de conversation pour l'IA
      const conversationHistory = messages.map(msg => ({
        role: msg.speaker === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Ajouter le nouveau message de l'utilisateur
      conversationHistory.push({
        role: 'user' as const,
        content: userMessage
      });

      // Ajouter un message "en cours de réflexion"
      const thinkingMessage = {
        id: (Date.now() + 1).toString(),
        sessionId: sessionId || 'new',
        content: "🤔 En réflexion...",
        speaker: 'ai' as const,
        timestamp: new Date(),
        isSpoken: false,
        isSpeaking: false
      };
      setMessages(prev => [...prev, thinkingMessage]);

      // Configurer la clé API dans le service IA
      if (finalApiKey) {
        aiService.setApiKey(finalApiKey);
      }

      // Appeler le service IA
      const aiResponse = await aiService.generateResponse(conversationHistory, {
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: `Tu es un assistant IA expert en entretiens professionnels. Tu aides les candidats à préparer leurs entretiens en simulant des conversations réalistes. Sois encourageant, constructif et donne des conseils pratiques. Réponds en français et de manière concise mais complète.`
      });

      // Remplacer le message de réflexion par la vraie réponse
      const aiMessage = {
        id: (Date.now() + 2).toString(),
        sessionId: sessionId || 'new',
        content: aiResponse.content,
        speaker: 'ai' as const,
        timestamp: new Date(),
        isSpeaking: true,
        isSpoken: false
      };

      setMessages(prev => prev.map(msg =>
        msg.id === thinkingMessage.id ? aiMessage : msg
      ));

      // Nettoyer le texte pour la synthèse vocale
      const cleanSpeechText = cleanTextForSpeech(aiResponse.content);

      // Lire la réponse vocalement
      await audioService.speakText(cleanSpeechText, {
        rate: 0.9,
        pitch: 1.0,
        volume: settings.aiVoiceVolume || 0.8
      });

      // Mettre à jour le message une fois la lecture terminée
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessage.id
          ? { ...msg, isSpeaking: false, isSpoken: true }
          : msg
      ));

    } catch (error) {
      console.error('Error generating AI response:', error);

      // Message d'erreur
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        sessionId: sessionId || 'new',
        content: "❌ Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un instant.",
        speaker: 'ai' as const,
        timestamp: new Date(),
        isSpoken: false,
        isSpeaking: false
      };

      // Remplacer le message de réflexion par le message d'erreur
      setMessages(prev => prev.map(msg =>
        msg.content.includes("🤔 En réflexion...") ? errorMessage : msg
      ));
    }
  };

  const handleOpenSettings = () => {
    // Naviguer vers la page des paramètres ou ouvrir une modal
    navigate({ to: '/app/settings' });
  };

  const handleStartRecording = async () => {
    try {
      // Start audio recording only (speech recognition is handled in VoiceChatInterface)
      await audioService.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleTranscriptUpdate = (transcript: string, isFinal: boolean) => {
    // La transcription est déjà gérée par le speech recognition callback ci-dessus
    console.log('Transcription update:', transcript, isFinal ? '(final)' : '(interim)');

    // Si l'IA était en train de parler et l'utilisateur commence à parler,
    // mettre à jour les messages pour indiquer l'interruption
    if (audioService.isSpeaking() && transcript.trim()) {
      setMessages(prev => prev.map(msg =>
        msg.speaker === 'ai' && msg.isSpeaking
          ? { ...msg, isSpeaking: false, isSpoken: false, content: msg.content + " [Interrompu]" }
          : msg
      ));
    }
  };

  const handleStopRecording = async () => {
    try {
      console.log('Stopping recording...');

      // Stop speech recognition first
      try {
        audioService.stopSpeechRecognition();
      } catch (error) {
        console.warn('Error stopping speech recognition:', error);
      }

      // Wait a bit for speech recognition to process final results
      await new Promise(resolve => setTimeout(resolve, 200));

      // Then stop audio recording with timeout
      const stopPromise = audioService.stopRecording();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Stop recording timeout')), 5000)
      );

      await Promise.race([stopPromise, timeoutPromise]);

      console.log('Recording stopped successfully');

    } catch (error) {
      console.error('Error stopping recording:', error);
      // Force cleanup in case of error
      try {
        audioService.stopSpeechRecognition();
      } catch (e) {
        console.warn('Force cleanup failed:', e);
      }
    } finally {
      // Always update the recording state
      setIsRecording(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate({ to: '/app/dashboard' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Initialisation de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-linear-to-r from-white to-slate-50 shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-3 text-slate-600" />
                  Session: {sessionName}
                </h1>
                <p className="text-slate-600 mt-1">Assistant IA d'entraînement</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Messages</div>
                <div className="text-2xl font-bold text-slate-900">{messages.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert si pas de clé API */}
        {!hasApiKey && (
          <div className="mb-6">
            <ApiKeyAlert onOpenSettings={handleOpenSettings} />
          </div>
        )}

        <div className={`h-[calc(100vh-200px)] ${!hasApiKey ? 'opacity-75 pointer-events-none' : ''}`}>
          <VoiceChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            isRecording={isRecording}
            onTranscriptUpdate={handleTranscriptUpdate}
          />
        </div>
      </div>
    </div>
  );
};
