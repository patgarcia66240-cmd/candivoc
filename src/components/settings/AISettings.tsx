import React, { useState } from 'react';
import { Key, Eye, EyeOff, AlertCircle, TestTube } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { aiService } from '../../services/ai/aiService';

interface AISettingsProps {
  formData: { openai_api_key?: string };
  onInputChange: (field: string, value: string) => void;
}

export const AISettings: React.FC<AISettingsProps> = ({
  formData,
  onInputChange
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);

  const handleAITest = async () => {
    if (!formData.openai_api_key) {
      return;
    }

    setIsTestingAI(true);
    try {
      // D'abord sauvegarder la clé API dans les settings
      localStorage.setItem('candivoc_app_settings', JSON.stringify({
        ...JSON.parse(localStorage.getItem('candivoc_app_settings') || '{}'),
        apiKey: formData.openai_api_key
      }));

      // Puis tester avec un simple message
      const testResponse = await aiService.generateResponse(
        [{ role: 'user', content: "Test" }],
        { temperature: 0.7, maxTokens: 10 }
      );

      if (testResponse) {
        alert('✅ Test réussi! L\'API OpenAI fonctionne correctement.');
      }
    } catch (error) {
      console.error('Erreur lors du test IA:', error);
      alert('❌ Erreur lors du test. Vérifiez votre clé API.');
    } finally {
      setIsTestingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-800">Configuration IA</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clé API OpenAI
          </label>
          <div className="relative">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={formData.openai_api_key || ''}
              onChange={(e) => onInputChange('openai_api_key', e.target.value)}
              placeholder="sk-..."
              className="pr-20"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Votre clé API est utilisée uniquement pour les fonctionnalités IA de l'application.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Important</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Votre clé API est stockée localement sur votre navigateur et n'est jamais partagée avec nos serveurs.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleAITest}
            disabled={!formData.openai_api_key || isTestingAI}
            className="w-full sm:w-auto"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTestingAI ? 'Test en cours...' : 'Tester la connexion IA'}
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Testez votre clé API pour vous assurer que la connexion à OpenAI fonctionne.
          </p>
        </div>
      </div>
    </div>
  );
};