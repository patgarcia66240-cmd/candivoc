import React from 'react';
import { AlertTriangle, Settings, ExternalLink, Copy } from 'lucide-react';

export const ConfigError: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const isUrlMissing = !supabaseUrl || supabaseUrl === 'votre_supabase_url';
  const isKeyMissing = !supabaseKey || supabaseKey === 'votre_supabase_anon_key';
  const hasConfigIssues = isUrlMissing || isKeyMissing;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openFile = () => {
    alert('Pour créer le fichier .env.local :\n\n1. Copiez le fichier .env.example\n2. Renommez-le en .env.local\n3. Remplissez vos vraies valeurs Supabase');
  };

  if (!hasConfigIssues) {
    return null; // Ne pas afficher si la configuration est correcte
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Configuration Supabase requise
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Pour utiliser CandiVoc, vous devez configurer votre connexion à la base de données Supabase.
          </p>
        </div>

        {/* Configuration Status */}
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            État de la configuration
          </h2>

          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              isUrlMissing ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isUrlMissing ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <span className="font-medium">
                  VITE_SUPABASE_URL
                </span>
              </div>
              <span className={`text-sm ${
                isUrlMissing ? 'text-red-600' : 'text-green-600'
              }`}>
                {isUrlMissing ? 'Manquant' : 'Configuré'}
              </span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              isKeyMissing ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isKeyMissing ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <span className="font-medium">
                  VITE_SUPABASE_ANON_KEY
                </span>
              </div>
              <span className={`text-sm ${
                isKeyMissing ? 'text-red-600' : 'text-green-600'
              }`}>
                {isKeyMissing ? 'Manquant' : 'Configuré'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Comment configurer</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <p className="text-gray-700">
                Créez un compte sur{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                >
                  supabase.com
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <p className="text-gray-700">
                Créez un nouveau projet et récupérez l'URL et la clé anon depuis les paramètres
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div className="space-y-2">
                <p className="text-gray-700">Créez un fichier <code className="bg-gray-100 px-2 py-1 rounded text-sm">.env.local</code> à la racine du projet avec :</p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div className="flex items-center justify-between group">
                    <span>VITE_SUPABASE_URL=votre_url_supabase</span>
                    <button
                      onClick={() => copyToClipboard('VITE_SUPABASE_URL=votre_url_supabase')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between group">
                    <span>VITE_SUPABASE_ANON_KEY=votre_clé_anon</span>
                    <button
                      onClick={() => copyToClipboard('VITE_SUPABASE_ANON_KEY=votre_clé_anon')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                4
              </div>
              <p className="text-gray-700">
                Redémarrez votre serveur de développement
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={openFile}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Guide de configuration
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Actualiser
          </button>
        </div>

        {/* Help */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-500">
            Besoin d'aide ? Consultez le fichier{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">SUPABASE_AUTH_SETUP.md</code>
            {" "}ou contactez le support.
          </p>
        </div>
      </div>
    </div>
  );
};