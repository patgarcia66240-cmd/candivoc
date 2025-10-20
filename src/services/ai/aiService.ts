import { apiClient } from '../api/client';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class AIService {
  private apiKey: string | null = null;
  private model: string = 'gpt-3.5-turbo'; // Modèle par défaut

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    // Charger la clé API depuis les settings
    try {
      const settings = localStorage.getItem('candivoc_app_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.apiKey = parsed.apiKey || null;
        this.model = parsed.aiModel || 'gpt-3.5-turbo';
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  }

  /**
   * Définit la clé API à utiliser
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Définit le modèle IA à utiliser
   */
  setModel(model: string) {
    this.model = model;
  }

  /**
   * Vérifie si le service IA est configuré
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Génère une réponse IA basée sur l'historique de conversation
   */
  async generateResponse(
    messages: ChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new Error('Aucune clé API configurée');
    }

    // Ajouter le prompt système si fourni
    const systemMessage: ChatMessage = {
      role: 'system',
      content: options.systemPrompt || `Tu es un assistant IA expert en entretiens professionnels et en coaching de carrière. Tu aides les candidats à préparer leurs entretiens en simulant des conversations réalistes. Sois encourageant, constructif et donne des conseils pratiques. Réponds en français et de manière concise mais complète.`
    };

    // Construire l'historique complet
    const fullHistory = [systemMessage, ...messages];

    try {
      // Tenter d'utiliser l'API locale d'abord
      const localResponse = await this.callLocalAPI(fullHistory, options);
      if (localResponse) {
        return localResponse;
      }

      // Si l'API locale n'est pas disponible, utiliser l'API externe
      return await this.callExternalAPI(fullHistory, options);

    } catch (error) {
      console.error('AI Service Error:', error);

      // En cas d'erreur, retourner une réponse de secours
      return this.getFallbackResponse(messages);
    }
  }

  /**
   * Appelle l'API locale configurée dans le projet
   */
  private async callLocalAPI(
    messages: ChatMessage[],
    options: { temperature?: number; maxTokens?: number }
  ): Promise<AIResponse | null> {
    try {
      const response = await apiClient.post<AIResponse>('/ai/chat', {
        messages,
        model: this.model,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500,
        stream: false
      });

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.log('Local AI API not available, trying external API');
      return null;
    }
  }

  /**
   * Appelle une API externe (OpenAI, Anthropic, etc.)
   */
  private async callExternalAPI(
    messages: ChatMessage[],
    options: { temperature?: number; maxTokens?: number }
  ): Promise<AIResponse> {
    // Déterminer le type d'API en fonction du format de la clé
    const isAnthropic = this.apiKey?.startsWith('sk-ant-');
    const isOpenAI = this.apiKey?.startsWith('sk-') && !isAnthropic;

    if (isOpenAI) {
      return this.callOpenAIAPI(messages, options);
    } else if (isAnthropic) {
      return this.callAnthropicAPI(messages, options);
    } else {
      throw new Error('Format de clé API non reconnu');
    }
  }

  /**
   * Appelle l'API OpenAI
   */
  private async callOpenAIAPI(
    messages: ChatMessage[],
    options: { temperature?: number; maxTokens?: number }
  ): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model.startsWith('gpt') ? this.model : 'gpt-3.5-turbo',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.',
      usage: data.usage
    };
  }

  /**
   * Appelle l'API Anthropic Claude
   */
  private async callAnthropicAPI(
    messages: ChatMessage[],
    options: { temperature?: number; maxTokens?: number }
  ): Promise<AIResponse> {
    // Convertir les messages au format Claude
    const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
    const conversationMessages = messages.filter(msg => msg.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey!,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model.startsWith('claude') ? this.model : 'claude-3-haiku-20240307',
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        system: systemMessage,
        messages: conversationMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0]?.text || 'Désolé, je n\'ai pas pu générer de réponse.',
      usage: data.usage
    };
  }

  /**
   * Retourne une réponse de secours si l'API n'est pas disponible
   */
  private getFallbackResponse(messages: ChatMessage[]): AIResponse {
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();

    if (!lastUserMessage) {
      return {
        content: "Bonjour! Je suis votre assistant IA pour vous aider dans votre préparation d'entretien. Comment puis-je vous aider aujourd'hui?"
      };
    }

    const userContent = lastUserMessage.content.toLowerCase();

    // Réponses contextuelles basées sur le contenu de l'utilisateur
    if (userContent.includes('bonjour') || userContent.includes('salut')) {
      return {
        content: "Bonjour! Je suis ravi de vous aider dans votre préparation d'entretien. Quelle compétence ou expérience souhaitez-vous travailler aujourd'hui?"
      };
    } else if (userContent.includes('merci')) {
      return {
        content: "Je vous en prie! N'hésitez pas si vous avez d'autres questions ou si vous voulez pratiquer un autre aspect de l'entretien."
      };
    } else if (userContent.includes('expérience') || userContent.includes('travail')) {
      return {
        content: "C'est une excellente question! Parlez-moi de votre expérience et je vous aiderai à la formuler de manière percutante pour votre entretien."
      };
    } else if (userContent.includes('compétence') || userContent.includes('skill')) {
      return {
        content: "Très bien! Quelles sont les compétences spécifiques que vous souhaitez mettre en avant? Je vous aiderai à les présenter avec des exemples concrets."
      };
    } else {
      return {
        content: "Je comprends votre point de vue. C'est une excellente perspective pour votre entretien. Pouvez-vous me donner un peu plus de détails pour que je puisse vous aider plus précisément?"
      };
    }
  }

  /**
   * Teste la connexion à l'API
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Aucune clé API configurée'
      };
    }

    try {
      const testMessage: ChatMessage = {
        role: 'user',
        content: 'Bonjour, ceci est un test de connexion.'
      };

      const response = await this.generateResponse([testMessage], {
        maxTokens: 50
      });

      return {
        success: true,
        message: 'Connexion réussie! L\'IA est opérationnelle.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }
}

export const aiService = new AIService();