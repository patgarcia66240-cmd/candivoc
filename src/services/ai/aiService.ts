// src/services/ai/aiService.ts

interface AIResponse {
  content: string;
  tokens?: number;
  finishReason?: string;
}

interface GenerateResponseOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  model?: string;
}

class AIService {
  private apiKey: string | null = null;

  /**
   * 🔐 Définit la clé API OpenAI (appelée depuis Chat.tsx ou Settings)
   */
  setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * 🧠 Génère une réponse textuelle via l'API OpenAI
   */
  async generateResponse(
    conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: GenerateResponseOptions = {}
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error("Clé API manquante : veuillez la configurer dans les paramètres.");
    }

    const {
      temperature = 0.7,
      maxTokens = 500,
      systemPrompt = '',
      model = 'gpt-4o-mini', // modèle léger et rapide
    } = options;

    // Crée la liste des messages pour l'API
    const messages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...conversationHistory]
      : conversationHistory;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData?.error?.message || `Erreur HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';
      const tokens = data.usage?.total_tokens;
      const finishReason = data.choices?.[0]?.finish_reason;

      return { content, tokens, finishReason };
    } catch (error: any) {
      console.error('❌ Erreur AIService:', error);
      throw new Error(error?.message || 'Erreur réseau ou API OpenAI.');
    }
  }

  /**
   * 🔍 Vérifie que la clé API fonctionne (test connexion)
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return res.ok;
    } catch (error) {
      console.warn('Erreur testConnection:', error);
      return false;
    }
  }
}

export const aiService = new AIService();
