import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VoiceChatInterface } from '../components/chat/VoiceChatInterface';
import { sessionsService } from '../services/api/sessions';
import { audioService } from '../services/audio/audioService';
import { Button } from '../components/ui/Button';
import { ApiKeyAlert } from '../components/chat/ApiKeyAlert';
import { useSettings } from '../hooks/useSettings';
import { aiService } from '../services/ai/aiService';

// Interfaces locales pour éviter les problèmes d'export
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

interface Session {
  id: string;
  userId: string;
  scenarioId: string;
  status: 'pending' | 'active' | 'completed' | 'abandoned';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  audioRecordingUrl?: string;
  transcript: Message[];
  evaluation?: SessionEvaluation;
  createdAt: Date;
}

interface SessionEvaluation {
  id: string;
  sessionId: string;
  overallScore: number;
  criteriaScores: CriteriaScore[];
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  feedback: string;
  createdAt: Date;
}

interface CriteriaScore {
  criteriaId: string;
  score: number;
  details: string;
}

interface ScenarioData {
  id: string;
  title: string;
  contexte: string;
  miseEnSituation: string;
  questionsTypiques: string;
  objectifs: string;
  difficulte: 'Facile' | 'Moyen' | 'Difficile';
  dureeEstimee: string;
}

export const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScenarioBriefing, setShowScenarioBriefing] = useState(false);

  // Vérifier si la clé API est configurée
  const hasApiKey = settings.apiKey && settings.apiKey.trim().length > 0;

  // Debug log pour vérifier l'état de la clé API
  console.log('🔑 API Key Status:', {
    hasKey: !!settings.apiKey,
    keyLength: settings.apiKey?.length || 0,
    hasApiKey,
    settings
  });

  useEffect(() => {
    if (sessionId) {
      if (sessionId.startsWith('demo-')) {
        // Créer une session de démonstration
        createDemoSession(sessionId);
      } else {
        fetchSession(sessionId);
      }
    }
  }, [sessionId]);

  const createDemoSession = async (demoId: string) => {
    try {
      // Extraire l'ID du scénario depuis l'ID de démonstration
      const scenarioId = demoId.replace('demo-', '');

      // Créer une session de démonstration
      const demoSession: Session = {
        id: demoId,
        userId: 'demo-user',
        scenarioId: `Scénario ${scenarioId}`,
        status: 'active',
        startTime: new Date(),
        transcript: [],
        createdAt: new Date()
      };

      setSession(demoSession);

      // Ajouter un message de bienvenue (pas encore parlé)
      const welcomeMessage: Message = {
        id: 'welcome',
        sessionId: demoId,
        content: 'Bienvenue dans votre session d\'entraînement ! Je suis votre IA et je vais vous guider à travers ce scénario. Prêt à commencer ?',
        speaker: 'ai',
        timestamp: new Date(),
        isSpoken: false,
        isSpeaking: false
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error creating demo session:', error);
      setError('Erreur lors de la création de la session de démonstration');
    } finally {
      setLoading(false);
    }
  };

  const fetchSession = async (id: string) => {
    try {
      const response = await sessionsService.getSessionById(id);
      if (response.success && response.data) {
        setSession(response.data);
        setMessages(response.data.transcript || []);
      } else {
        setError('Session non trouvée');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setError('Erreur lors du chargement de la session');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      await audioService.startRecording();
      setIsRecording(true);

      // Ajouter un message système
      const systemMessage: Message = {
        id: Date.now().toString(),
        sessionId: sessionId!,
        content: '🎤 Enregistrement en cours...',
        speaker: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Impossible de démarrer l\'enregistrement');
    }
  };

  const handleTranscriptUpdate = (transcript: string, isFinal: boolean) => {
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
      const audioBlob = await audioService.stopRecording();
      setIsRecording(false);

      // TODO: Envoyer l'audio au backend pour transcription
      console.log('Audio recorded:', audioBlob);

      // Réponse immédiate de l'IA pour une interaction plus rapide
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: sessionId!,
        content: 'Merci pour votre réponse. Pouvez-vous me parler de votre expérience avec React ?',
        speaker: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('Erreur lors de l\'arrêt de l\'enregistrement');
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sessionId: sessionId!,
      content,
      speaker: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Générer une réponse de l'IA avec réponse vocale immédiatement
    generateAIResponse(content);
  };

  const generateAIResponse = async (userMessage: string) => {
    // Vérifier si la clé API est disponible
    if (!hasApiKey) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: sessionId!,
        content: "Attention, impossible de générer une réponse car aucune clé API n'est configurée. Veuillez configurer votre clé API dans les paramètres pour pouvoir dialoguer avec l'IA.",
        speaker: 'ai',
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
      const thinkingMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: sessionId!,
        content: "En réflexion...",
        speaker: 'ai',
        timestamp: new Date(),
        isSpoken: false,
        isSpeaking: false
      };
      setMessages(prev => [...prev, thinkingMessage]);

      // Appeler le service IA
      const aiResponse = await aiService.generateResponse(conversationHistory, {
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: `Tu es un coach d'entretien professionnel. Tu aides les candidats à améliorer leurs compétences en simulation d'entretien. Sois encourageant, donne des feedbacks constructifs et pose des questions de suivi pertinentes. Tu simules un recruteur ou un manager qui évalue le candidat. Réponds en français.`
      });

      // Remplacer le message de réflexion par la vraie réponse
      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        sessionId: sessionId!,
        content: aiResponse.content,
        speaker: 'ai',
        timestamp: new Date(),
        isSpeaking: true,
        isSpoken: false
      };

      setMessages(prev => prev.map(msg =>
        msg.id === thinkingMessage.id ? aiMessage : msg
      ));

      // Nettoyer le texte pour la synthèse vocale (texte fluide sans emojis ni markdown)
      const cleanSpeechText = cleanTextForSpeech(aiResponse.content);

      console.log('🤖 AI Response - Original:', aiResponse.content);
      console.log('🎤 AI Response - Clean:', cleanSpeechText);

      // Lire la réponse vocalement avec un débit plus rapide pour des interactions plus dynamiques
      await audioService.speakText(cleanSpeechText, {
        rate: 1.1, // Légèrement plus rapide pour des interactions plus dynamiques
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
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        sessionId: sessionId!,
        content: "❌ Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un instant.",
        speaker: 'ai',
        timestamp: new Date(),
        isSpoken: false,
        isSpeaking: false
      };

      // Remplacer le message de réflexion par le message d'erreur
      setMessages(prev => prev.map(msg =>
        msg.content.includes("En réflexion...") ? errorMessage : msg
      ));
    }
  };

  const handleOpenSettings = () => {
    // Naviguer vers la page des paramètres ou ouvrir une modal
    navigate('/settings');
  };

  // Base de données des scénarios
  const getScenariosData = (): Record<string, ScenarioData> => {
    return {
      '1': {
        id: '1',
        title: 'Lead Developer React',
        contexte: 'Vous êtes développeur React senior et vous passez un entretien pour un poste de Lead Developer.',
        miseEnSituation: 'L\'entreprise recherche quelqu\'un pour diriger une équipe de 5 développeurs sur un projet de plateforme e-commerce.',
        questionsTypiques: 'Préparez-vous à parler de votre expérience avec React, votre approche du leadership technique, et comment vous gérez les défis d\'équipe.',
        objectifs: 'Démontrez votre expertise technique, vos qualités de leadership, et votre capacité à résoudre des problèmes complexes.',
        difficulte: 'Moyen',
        dureeEstimee: '15-20 minutes'
      },
      '2': {
        id: '2',
        title: 'Architecte Full-Stack',
        contexte: 'Vous êtes développeur full-stack expérimenté et vous postulez pour un poste d\'architecte logiciel.',
        miseEnSituation: 'La startup fintech doit refactorer son architecture monolithique vers une architecture microservices pour supporter une croissance de 300% du trafic.',
        questionsTypiques: 'Soyez prêt à discuter d\'architecture distribuée, de choix technologiques, et de stratégies de migration progressive.',
        objectifs: 'Montrez votre vision stratégique, votre capacité à prendre des décisions techniques importantes, et votre expérience en leadership technique.',
        difficulte: 'Difficile',
        dureeEstimee: '20-25 minutes'
      },
      '3': {
        id: '3',
        title: 'Développeur Frontend Junior',
        contexte: 'Vous êtes développeur frontend junior avec 2 ans d\'expérience et vous passez un entretien pour votre premier poste senior.',
        miseEnSituation: 'L\'équipe produit souhaite améliorer les performances de l\'application et vous êtes chargé d\'optimiser les composants React.',
        questionsTypiques: 'Préparez-vous à expliquer les concepts de base de React, vos projets récents, et comment vous abordez le debugging.',
        objectifs: 'Démontrez vos connaissances fondamentales, votre capacité d\'apprentissage, et votre potentiel de croissance.',
        difficulte: 'Facile',
        dureeEstimee: '10-15 minutes'
      },
      '4': {
        id: '4',
        title: 'Tech Lead Mobile',
        contexte: 'Vous êtes développeur mobile senior et vous candidatez pour un poste de Tech Lead sur une application bancaire.',
        miseEnSituation: 'L\'application doit être migrée de React Native vers Flutter et l\'équipe doit maintenir la qualité pendant la transition.',
        questionsTypiques: 'Soyez prêt à parler de stratégie de migration, de gestion d\'équipe technique, et de maintien de la qualité produit.',
        objectifs: 'Montrez votre expertise mobile, vos compétences en management d\'équipe, et votre capacité à gérer des projets complexes.',
        difficulte: 'Difficile',
        dureeEstimee: '18-22 minutes'
      }
    };
  };

  // Fonction pour nettoyer le texte pour la synthèse vocale
  const cleanTextForSpeech = (text: string): string => {
    return text
      // Supprimer les emojis
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Supprimer les symboles markdown
      .replace(/\*\*(.*?)\*\*/g, '$1') // Gras
      .replace(/\*(.*?)\*/g, '$1')     // Italique
      .replace(/`(.*?)`/g, '$1')       // Code
      .replace(/#{1,6}\s/g, '')        // Headers
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Liens
      // Nettoyer les espaces multiples
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleStartScenarioBriefing = async () => {
    if (!session) return;

    setShowScenarioBriefing(true);

    // Extraire l'ID du scénario depuis sessionId
    const scenarioNumber = session.id.replace('demo-', '').replace(/\D/g, '');

    // Récupérer les données du scénario
    const scenariosData = getScenariosData();
    const scenarioData = scenariosData[scenarioNumber] || scenariosData['1']; // Fallback au scénario 1

    console.log('🎭 Scenario selected:', scenarioNumber, scenarioData);

    // Créer le message de briefing du scénario (avec formatage visuel)
    const briefingMessage: Message = {
      id: 'scenario-briefing',
      sessionId: session.id,
      content: `Parfait ! Voici le scénario d'entretien que nous allons simuler :

🎯 **Contexte :** ${scenarioData.contexte}

💼 **Mise en Situation :** ${scenarioData.miseEnSituation}

🤔 **Questions typiques :** ${scenarioData.questionsTypiques}

🎯 **Objectifs :** ${scenarioData.objectifs}

📊 **Niveau de difficulté :** ${scenarioData.difficulte}
⏱️ **Durée estimée :** ${scenarioData.dureeEstimee}

Êtes-vous prêt à commencer l'entretien ?`,
      speaker: 'ai',
      timestamp: new Date(),
      isSpeaking: true,
      isSpoken: false
    };

    setMessages(prev => [...prev, briefingMessage]);

    // Nettoyer le texte pour la synthèse vocale (texte fluide)
    const cleanSpeechText = cleanTextForSpeech(briefingMessage.content);

    console.log('🗣️ Original briefing text:', briefingMessage.content);
    console.log('🎤 Clean briefing text:', cleanSpeechText);

    // Lire le briefing vocalement avec du texte fluide
    try {
      await audioService.speakText(cleanSpeechText, {
        rate: 1.0, // Un peu plus lent pour le briefing
        pitch: 1.0,
        volume: settings.aiVoiceVolume || 0.8
      });

      // Marquer comme parlé une fois terminé
      setMessages(prev => prev.map(msg =>
        msg.id === briefingMessage.id
          ? { ...msg, isSpeaking: false, isSpoken: true }
          : msg
      ));
    } catch (error) {
      console.error('Error speaking scenario briefing:', error);
      // Marquer comme parlé même en cas d'erreur
      setMessages(prev => prev.map(msg =>
        msg.id === briefingMessage.id
          ? { ...msg, isSpeaking: false, isSpoken: true }
          : msg
      ));
    }
  };

  const handleEndSession = async () => {
    if (session && session.id) {
      try {
        if (session.id.startsWith('demo-')) {
          // Pour les sessions de démonstration, simplement naviguer
          navigate('/dashboard');
        } else {
          await sessionsService.endSession(session.id);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error ending session:', error);
        setError('Erreur lors de la fin de session');
      }
    } else {
      // Si pas de session ou session.id est undefined, naviguer quand même
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Session non trouvée'}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.scenarioId} - Session en cours
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500">
                  {isRecording ? '🎤 Enregistrement en cours' : 'Prêt à enregistrer'}
                </p>
                {(() => {
                  if (!session?.id) return null;
                  const scenarioNumber = session.id.replace('demo-', '').replace(/\D/g, '');
                  const scenariosData = getScenariosData();
                  const scenarioData = scenariosData[scenarioNumber];

                  if (scenarioData) {
                    return (
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          scenarioData.difficulte === 'Facile' ? 'bg-green-100 text-green-700' :
                          scenarioData.difficulte === 'Moyen' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {scenarioData.difficulte}
                        </span>
                        <span className="text-xs text-gray-500">
                          ⏱️ {scenarioData.dureeEstimee}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleEndSession}>
                Terminer la session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert si pas de clé API */}
        {!hasApiKey && (
          <div className="mb-6">
            <ApiKeyAlert onOpenSettings={handleOpenSettings} />
          </div>
        )}

        {/* Interface principale ou écran de démarrage */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] ${!hasApiKey ? 'opacity-75 pointer-events-none' : ''}`}>
          {!showScenarioBriefing ? (
            // Écran de démarrage avec bouton pour commencer le scénario
            <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  🎭 Scénario d'entretien
                </h2>
                <p className="text-gray-600 max-w-md">
                  {messages[0]?.content || 'Préparez-vous à votre simulation d\'entretien. L\'IA va vous présenter le scénario et vous pourrez commencer à pratiquer.'}
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleStartScenarioBriefing}
                  className={`px-8 py-3 text-lg transition-all duration-200 ${
                    !hasApiKey
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                  disabled={!hasApiKey}
                >
                  {!hasApiKey ? '🔒 Clé API requise' : '🚀 Commencer le scénario'}
                </Button>

                {!hasApiKey && (
                  <div className="text-center space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">
                      ⚠️ Clé API OpenAI requise
                    </p>
                    <p className="text-xs text-gray-500">
                      Pour utiliser l'IA vocale, vous devez configurer votre clé API OpenAI
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenSettings}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:border-blue-700"
                    >
                      ⚙️ Configurer l'API
                    </Button>
                  </div>
                )}

                {hasApiKey && (
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">
                      ✅ Clé API configurée - Prêt à commencer !
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  💡 Conseils pour bien commencer :
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Prenez le temps de comprendre le scénario</li>
                  <li>• Parlez clairement et distinctement</li>
                  <li>• Vous pouvez interrompre l'IA à tout moment</li>
                  <li>• Pratiquez plusieurs fois pour vous améliorer</li>
                </ul>
              </div>
            </div>
          ) : (
            // Interface de chat normale une fois le briefing commencé
            <VoiceChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              isRecording={isRecording}
              onTranscriptUpdate={handleTranscriptUpdate}
            />
          )}
        </div>
      </div>
    </>
  );
};
