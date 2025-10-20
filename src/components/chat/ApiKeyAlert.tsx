import React from 'react';
import { AlertTriangle, Settings, Key } from 'lucide-react';
import { Button } from '../ui/Button';

interface ApiKeyAlertProps {
  onOpenSettings?: () => void;
  className?: string;
}

export const ApiKeyAlert: React.FC<ApiKeyAlertProps> = ({
  onOpenSettings,
  className = ""
}) => {
  const handleOpenSettings = () => {
    // Ouvrir les paramètres du navigateur ou naviguer vers la page de settings
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      // Par défaut, essayer d'ouvrir une page de settings ou afficher une alerte
      alert('Veuillez configurer votre clé API dans les paramètres de l\'application.');
    }
  };

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="bg-amber-100 rounded-full p-3">
            <Key className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">
              Clé API requise
            </h3>
          </div>

          <p className="text-amber-800 mb-4 leading-relaxed">
            Pour pouvoir dialoguer avec l'IA, vous devez configurer votre clé API.
            Sans clé API, l'assistant ne peut pas générer de réponses.
          </p>

          <div className="bg-amber-100 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-700 font-medium mb-1">
              Comment obtenir une clé API ?
            </p>
            <ul className="text-xs text-amber-600 space-y-1">
              <li>• Inscrivez-vous sur la plateforme de votre choix</li>
              <li>• Générez une clé API dans votre dashboard</li>
              <li>• Copiez-collez la clé dans les paramètres</li>
            </ul>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="gradient"
              onClick={handleOpenSettings}
              className="shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurer la clé API
            </Button>

            <Button
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => window.open('/settings', '_blank')}
            >
              Plus d'informations
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};