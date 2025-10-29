import React, { useState } from 'react';
import { Volume2, Volume1, VolumeX, TestTube } from 'lucide-react';
import { Button } from '../ui/Button';
import { audioService } from '../../services/audio/audioService';

interface AudioSettingsProps {
  settings: Record<string, unknown>;
  updateSetting: (key: string, value: unknown) => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  settings,
  updateSetting
}) => {
  const [isTestingVolume, setIsTestingVolume] = useState(false);

  const handleVolumeTest = async () => {
    setIsTestingVolume(true);
    try {
      const testText = "Test du volume audio. Ceci est un test pour vérifier que le niveau sonore est correct.";
      await audioService.speakText(testText);
    } catch (error) {
      console.error('Erreur lors du test audio:', error);
    } finally {
      setIsTestingVolume(false);
    }
  };

  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 0.5) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-800">Paramètres Audio</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Volume de la voix IA
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.aiVoiceVolume || 0.7}
              onChange={(e) => updateSetting('aiVoiceVolume', parseFloat(e.target.value))}
              className="flex-1"
            />
            <div className="flex items-center gap-2 text-sm text-gray-600 w-16">
              {getVolumeIcon(settings.aiVoiceVolume || 0.7)}
              <span>{Math.round((settings.aiVoiceVolume || 0.7) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sons activés
            </label>
            <p className="text-sm text-gray-500">
              Activer les sons de notification et d'interaction
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled !== false}
            onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
          />
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleVolumeTest}
            disabled={isTestingVolume}
            className="w-full sm:w-auto"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTestingVolume ? 'Test en cours...' : 'Tester le volume'}
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Testez le volume pour vous assurer que l'audio est audible et confortable.
          </p>
        </div>
      </div>
    </div>
  );
};