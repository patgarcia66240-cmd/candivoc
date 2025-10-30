import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { VoiceChatInterface } from "../components/chat/VoiceChatInterface";
import { sessionsService } from "../services/api/sessions";
import { audioService } from "../services/audio/audioService";
import { Button } from "../components/ui/Button";
import { ApiKeyAlert } from "../components/chat/ApiKeyAlert";
import { useSettings } from "../hooks/useSettings";
import { useAuth } from "../services/auth/useAuth";
import { aiService } from "../services/ai/aiService";
import { cleanTextForSpeech, createVoiceText } from "../utils/textCleaner";
import { ScenariosService } from "../services/supabase/scenarios";
import { SessionSkeleton } from "../components/ui/SessionSkeleton";

// Interfaces locales pour éviter les problèmes d'export
interface Message {
  id: string;
  sessionId: string;
  content: string;
  speaker: "user" | "ai";
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

interface SessionEvaluation {
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  overall_rating?: "excellent" | "good" | "average" | "needs_improvement";
}

interface Session {
  id: string;
  userId: string;
  scenarioId: string;
  status: "pending" | "active" | "completed" | "abandoned";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  audioRecordingUrl?: string;
  transcript: Message[];
  evaluation?: SessionEvaluation;
  createdAt: Date;
}



interface ScenarioData {
  id: string;
  title: string;
  contexte: string;
  miseEnSituation: string;
  questionsTypiques: string;
  objectifs: string;
  difficulte: "Facile" | "Moyen" | "Difficile";
  dureeEstimee: string;
}

const SessionPage: React.FC = () => {
  const { sessionId } = useParams({ from: '/app/session/$sessionId' });
  const navigate = useNavigate({ from: '/app/session/$sessionId' });
  const { settings } = useSettings();
  const { user } = useAuth();

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScenarioBriefing, setShowScenarioBriefing] = useState(false);
  const [scenariosData, setScenariosData] = useState<Record<string, ScenarioData>>({});

  // Vérifier si la clé API est configurée (priorité au profil utilisateur, sinon settings locaux)
  const userApiKey = user?.openai_api_key;
  const localApiKey = settings.apiKey;
  const apiKey = userApiKey || localApiKey;
  const hasApiKey = apiKey && apiKey.trim().length > 0;

  // Debug log pour vérifier l'état de la clé API
  console.log("🔑 API Key Status:", {
    hasUserKey: !!userApiKey,
    hasLocalKey: !!localApiKey,
    userKeyLength: userApiKey?.length || 0,
    localKeyLength: localApiKey?.length || 0,
    hasApiKey,
    apiKeyLength: apiKey?.length || 0,
    user: user?.email,
  });

  // Charger les données des scénarios depuis Supabase
  const loadScenariosData = useCallback(async () => {
    const data = await getScenariosData();
    setScenariosData(data);
  }, []);

  useEffect(() => {
    // Charger les données des scénarios au démarrage
    loadScenariosData();

    if (sessionId) {
      if (sessionId.startsWith("demo-")) {
        // Créer une session de démonstration
        createDemoSession(sessionId);
      } else {
        fetchsession(sessionId);
      }
    }
  }, [sessionId, loadScenariosData]);

  // Configurer la clé API dans le service IA quand elle change
  useEffect(() => {
    if (apiKey) {
      aiService.setApiKey(apiKey);
    }
  }, [apiKey]);

  const createDemoSession = async (demoId: string) => {
    try {
      // Extraire l'ID du scénario depuis l'ID de démonstration
      const scenarioId = demoId.replace("demo-", "");

      // Créer une session de démonstration
      const demoSession: Session = {
        id: demoId,
        userId: "demo-user",
        scenarioId: `Scénario ${scenarioId}`,
        status: "active",
        startTime: new Date(),
        transcript: [],
        createdAt: new Date(),
      };

      setSession(demoSession);

      // Ajouter un message de bienvenue (pas encore parlé)
      const welcomeMessage: Message = {
        id: "welcome",
        sessionId: demoId,
        content:
          "Bienvenue dans votre session d'entraînement ! Je suis votre IA et je vais vous guider à travers ce scénario. Prêt à commencer ?",
        speaker: "ai",
        timestamp: new Date(),
        isSpoken: false,
        isSpeaking: false,
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Error creating demo session:", error);
      setError("Erreur lors de la création de la session de démonstration");
    } finally {
      setLoading(false);
    }
  };

  const fetchsession = async (id: string) => {
    try {
      const response = await sessionsService.getSessionById(id);
      if (response.success && response.data) {
        setSession(response.data);
        setMessages(response.data.transcript || []);
      } else {
        setError("session non trouvée");
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      setError("Erreur lors du chargement de la session");
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
        content: "🎤 enregistrement en cours...",
        speaker: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Impossible de démarrer l'enregistrement");
    }
  };

  const handleTranscriptUpdate = (transcript: string, isFinal: boolean) => {
    console.log(
      "Transcription update:",
      transcript,
      isFinal ? "(final)" : "(interim)"
    );

    // Si l'IA était en train de parler et l'utilisateur commence à parler,
    // mettre à jour les messages pour indiquer l'interruption
    if (audioService.isSpeaking() && transcript.trim()) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.speaker === "ai" && msg.isSpeaking
            ? {
                ...msg,
                isSpeaking: false,
                isSpoken: false,
                content: msg.content + " [Interrompu]",
              }
            : msg
        )
      );
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await audioService.stopRecording();
      setIsRecording(false);

      // TODO: Envoyer l'audio au backend pour transcription
      console.log("Audio recorded:", audioBlob);

      // Réponse immédiate de l'IA pour une interaction plus rapide
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: sessionId!,
        content:
          "Merci pour votre réponse. Pouvez-vous me parler de votre expérience avec React ?",
        speaker: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error stopping recording:", error);
      setError("Erreur lors de l'arrêt de l'enregistrement");
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sessionId: sessionId!,
      content,
      speaker: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Générer une réponse de l'IA avec réponse vocale immédiatement
    generateAIResponse(content);
  };

  const generateAIResponse = async (userMessage: string) => {
    // Vérifier si la clé API est disponible
    if (!hasApiKey) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: sessionId!,
        content:
          "Attention, impossible de générer une réponse car aucune clé API n'est configurée. Veuillez configurer votre clé API dans les paramètres pour pouvoir dialoguer avec l'IA.",
        speaker: "ai",
        timestamp: new Date(),
        isSpoken: false,
        isSpeaking: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    try {
      // Préparer l'historique de conversation pour l'IA
      const conversationHistory = messages.map((msg) => ({
        role:
          msg.speaker === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      }));

      // Ajouter le nouveau message de l'utilisateur
      conversationHistory.push({
        role: "user" as const,
        content: userMessage,
      });

      // Ajouter un message "en cours de réflexion"
      const thinkingMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: sessionId!,
        content: "En réflexion...",
        speaker: "ai",
        timestamp: new Date(),
        isSpoken: false,
        isSpeaking: false,
      };
      setMessages((prev) => [...prev, thinkingMessage]);

      // Appeler le service IA
      const aiResponse = await aiService.generateResponse(conversationHistory, {
        temperature: 0.7,
        maxTokens: 1000, // Augmenté de 500 à 1000 tokens pour des réponses plus complètes
        systemPrompt: `Tu es un coach d'entretien professionnel. Tu aides les candidats à améliorer leurs compétences en simulation d'entretien. Sois encourageant, donne des feedbacks constructifs et pose des questions de suivi pertinentes. Tu simules un recruteur ou un manager qui évalue le candidat. Réponds en français.

IMPORTANT : Ne mentionne jamais la difficulté (facile, moyen, difficile) ni la durée estimée de l'entretien dans tes réponses. Concentre-toi uniquement sur le contenu, les compétences et les feedbacks pertinents.`,
      });

      // Remplacer le message de réflexion par la vraie réponse
      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        sessionId: sessionId!,
        content: aiResponse.content,
        speaker: "ai",
        timestamp: new Date(),
        isSpeaking: true,
        isSpoken: false,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === thinkingMessage.id ? aiMessage : msg))
      );

      // Nettoyer le texte pour la synthèse vocale (texte fluide sans emojis ni markdown)
      const cleanSpeechText = cleanTextForSpeech(aiResponse.content);

      console.log("🤖 AI Response - Original:", aiResponse.content);
      console.log("🎤 AI Response - Clean:", cleanSpeechText);

      // Lire la réponse vocalement avec les paramètres optimisés pour une voix naturelle
      await audioService.speakText(cleanSpeechText, {
        rate: 0.95, // Vitesse naturelle et non robotique
        pitch: 1.0, // Pitch neutre
        volume: settings.aiVoiceVolume || 0.9, // Volume légèrement plus élevé
      });

      // Mettre à jour le message une fois la lecture terminée
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessage.id
            ? { ...msg, isSpeaking: false, isSpoken: true }
            : msg
        )
      );
    } catch (error) {
      console.error("Error generating AI response:", error);

      // Message d'erreur
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        sessionId: sessionId!,
        content:
          "❌ Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un instant.",
        speaker: "ai",
        timestamp: new Date(),
        isSpoken: false,
        isSpeaking: false,
      };

      // Remplacer le message de réflexion par le message d'erreur
      setMessages((prev) =>
        prev.map((msg) =>
          msg.content.includes("En réflexion...") ? errorMessage : msg
        )
      );
    }
  };

  const handleOpenSettings = () => {
    // Naviguer vers la page des paramètres ou ouvrir une modal
    navigate({ to: '/app/settings' });
  };

  // Récupérer les données des scénarios depuis Supabase
  const getScenariosData = async (): Promise<Record<string, ScenarioData>> => {
    const { data, error } = await ScenariosService.getScenarios();

    if (error || !data) {
      console.error("Error fetching scenarios from Supabase:", error);
      return {};
    }

    // Convertir les données de Supabase au format attendu
    const scenariosRecord: Record<string, ScenarioData> = {};

    data.forEach((scenario) => {
      // Convertir la difficulté du format Supabase vers le format d'affichage
      const difficulteDisplay = scenario.difficulty === 'beginner' ? 'Facile' :
                               scenario.difficulty === 'intermediate' ? 'Moyen' : 'Difficile';

      // Convertir la durée en minutes vers une chaîne lisible
      const dureeEstimee = `${scenario.duration} minutes`;

      scenariosRecord[scenario.id] = {
        id: scenario.id,
        title: scenario.title,
        contexte: scenario.context || scenario.description,
        miseEnSituation: scenario.mise_en_situation || '',
        questionsTypiques: scenario.questions_typiques || '',
        objectifs: scenario.objectifs || '',
        difficulte: difficulteDisplay,
        dureeEstimee: dureeEstimee,
      };
    });

    return scenariosRecord;
  };

  // La fonction cleanTextForSpeech est maintenant importée depuis utils/textCleaner

  const handleStartScenarioBriefing = async () => {
    if (!session) return;

    setShowScenarioBriefing(true);

    // Extraire l'ID du scénario depuis sessionId
    const scenarioId = session.id.replace("demo-", "");

    // Récupérer les données du scénario depuis l'état
    const scenarioData = scenariosData[scenarioId] || scenariosData["1"] || Object.values(scenariosData)[0]; // Multiple fallbacks

    console.log("🎭 Scenario selected:", scenarioId, scenarioData);

    // Créer le message de briefing du scénario (avec formatage visuel)
    const briefingMessage: Message = {
      id: "scenario-briefing",
      sessionId: session.id,
      content: `Voici le scénario d'entretien que nous allons simuler :

      Alors, vous avez allez avoir le contexte suivant : ${scenarioData.contexte}

      La mise en Situation : ${scenarioData.miseEnSituation}

      Les Questions typiques : ${scenarioData.questionsTypiques}
      Objectifs : ${scenarioData.objectifs}

      Nous allons commencer l'entretien quand vous serez prêt. N'hésitez pas à poser des questions si vous avez besoin de clarifications avant de commencer.`,
      speaker: "ai",
      timestamp: new Date(),
      isSpeaking: true,
      isSpoken: false,
    };

    setMessages((prev) => [...prev, briefingMessage]);

    // Créer une version du message pour la voix (sans difficulté ni durée)
    const voiceBriefingText = createVoiceText(briefingMessage.content);

    // Nettoyer le texte pour la synthèse vocale (texte fluide)
    const cleanSpeechText = cleanTextForSpeech(voiceBriefingText);

    console.log(
      "🗣️ Original briefing text (display):",
      briefingMessage.content
    );
    console.log(
      "🎤 Voice briefing text (no diff/duration):",
      voiceBriefingText
    );
    console.log("🎤 Clean briefing text:", cleanSpeechText);

    // Lire le briefing vocalement avec du texte fluide
    try {
      await audioService.speakText(cleanSpeechText, {
        rate: 0.9, // Un peu plus lent pour le briefing mais naturel
        pitch: 1.0,
        volume: settings.aiVoiceVolume || 0.9,
      });

      // Marquer comme parlé une fois terminé
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === briefingMessage.id
            ? { ...msg, isSpeaking: false, isSpoken: true }
            : msg
        )
      );
    } catch (error) {
      console.error("Error speaking scenario briefing:", error);
      // Marquer comme parlé même en cas d'erreur
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === briefingMessage.id
            ? { ...msg, isSpeaking: false, isSpoken: true }
            : msg
        )
      );
    }
  };

  const handleEndsession = async () => {
    if (session && session.id) {
      try {
        if (session.id.startsWith("demo-")) {
          // Pour les sessions de démonstration, simplement naviguer
          navigate({ to: '/app/dashboard' });
        } else {
          await sessionsService.endsession(session.id);
          navigate({ to: '/app/dashboard' });
        }
      } catch (error) {
        console.error("Error ending session:", error);
        setError("Erreur lors de la fin de session");
      }
    } else {
      // Si pas de session ou session.id est undefined, naviguer quand même
      navigate({ to: '/app/dashboard' });
    }
  };

  if (loading) {
    return <SessionSkeleton />;
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "session non trouvée"}</p>
          <Button onClick={() => navigate({ to: '/app/dashboard' })}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {session.scenarioId} - session en cours
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isRecording
                    ? "🎤 enregistrement en cours"
                    : "Prêt à enregistrer"}
                </p>
                {(() => {
                  if (!session?.id) return null;
                  const scenarioId = session.id.replace("demo-", "");
                  const scenarioData = scenariosData[scenarioId];

                  if (scenarioData) {
                    return (
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            scenarioData.difficulte === "Facile"
                              ? "bg-green-100 text-green-700"
                              : scenarioData.difficulte === "Moyen"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
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
              <Button variant="outline" onClick={handleEndsession}>
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
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] ${
            !hasApiKey ? "opacity-75 pointer-events-none" : ""
          }`}
        >
          {!showScenarioBriefing ? (
            // Écran de démarrage avec bouton pour commencer le scénario
            <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🎭 Scénario d'entretien
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-md">
                  {messages[0]?.content ||
                    "Préparez-vous à votre simulation d'entretien. L'IA va vous présenter le scénario et vous pourrez commencer à pratiquer."}
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleStartScenarioBriefing}
                  className={`px-8 py-3 text-lg transition-all duration-200 ${
                    !hasApiKey
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  }`}
                  disabled={!hasApiKey}
                >
                  {!hasApiKey
                    ? "🔒 Clé API requise"
                    : "🚀 Commencer le scénario"}
                </Button>

                {!hasApiKey && (
                  <div className="text-center space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      ⚠️ Clé API OpenAI requise
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pour utiliser l'IA vocale, vous devez configurer votre clé
                      API OpenAI
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenSettings}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 dark:text-blue-400 dark:border-blue-400 hover:border-blue-700"
                    >
                      ⚙️ Configurer l'API
                    </Button>
                  </div>
                )}

                {hasApiKey && (
                  <div className="text-center">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✅ Clé API configurée - Prêt à commencer !
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  💡 Conseils pour bien commencer :
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
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

export default SessionPage;
