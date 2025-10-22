import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase/client';
import { ScenariosService } from '../services/supabase/scenarios';
import { Button } from '../components/ui/Button';
import {
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plug,
  Table,
  Key
} from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: Date;
}

export const TestSupabase: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  useEffect(() => {
    runInitialTest();
  }, []);

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date() }]);
  };

  const runInitialTest = async () => {
    await testConnection();
  };

  const testConnection = async () => {
    setIsRunning(true);
    addTestResult({
      success: false,
      message: 'Test de connexion à Supabase...',
      details: { status: 'running' }
    });

    // Vérifier si le client Supabase est initialisé
    if (!supabase) {
      addTestResult({
        success: false,
        message: '❌ Client Supabase non initialisé',
        details: {
          reason: 'Variables d\'environnement manquantes ou invalides',
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });
      setConnectionStatus('disconnected');
      setIsRunning(false);
      return;
    }

    try {
      // Test de connexion client
      const { data, error } = await supabase.from('scenarios').select('count').single();

      if (error) {
        throw new Error(`Erreur de connexion: ${error.message}`);
      }

      addTestResult({
        success: true,
        message: '✅ Connexion à Supabase réussie',
        details: { clientConfigured: true }
      });

      setConnectionStatus('connected');

      // Test de lecture de la table scenarios
      await testScenariosTable();

      // Test d'écriture (si possible)
      await testWriteOperations();

    } catch (error) {
      addTestResult({
        success: false,
        message: `❌ Échec de la connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        details: { error: error instanceof Error ? error.stack : String(error) }
      });
      setConnectionStatus('disconnected');
    } finally {
      setIsRunning(false);
    }
  };

  const testScenariosTable = async () => {
    addTestResult({
      success: false,
      message: 'Test de la table scenarios...',
      details: { status: 'running' }
    });

    try {
      const { data, error } = await ScenariosService.getScenarios();

      if (error) {
        throw new Error(`Erreur lors de la lecture des scénarios: ${error.message}`);
      }

      addTestResult({
        success: true,
        message: `✅ Table scenarios accessible (${data?.length || 0} scénarios trouvés)`,
        details: {
          scenariosCount: data?.length || 0,
          sampleData: data?.slice(0, 2) || []
        }
      });

    } catch (error) {
      addTestResult({
        success: false,
        message: `❌ Erreur table scenarios: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        details: { error: error instanceof Error ? error.stack : String(error) }
      });
    }
  };

  const testWriteOperations = async () => {
    addTestResult({
      success: false,
      message: 'Test des opérations d\'écriture...',
      details: { status: 'running' }
    });

    try {
      // Créer un scénario de test
      const testScenario = {
        title: 'Test Scenario',
        description: 'Scénario de test pour vérifier les permissions d\'écriture',
        category: 'technical' as const,
        difficulty: 'beginner' as const,
        duration: 5,
        language: 'fr',
        instructions: 'Instructions de test',
        ai_personality: 'Test AI',
        context: 'Contexte de test',
        mise_en_situation: 'Mise en situation de test',
        questions_typiques: 'Questions de test',
        objectifs: 'Objectifs de test',
        is_public: false,
        evaluation_criteria: []
      };

      const { data: createdData, error: createError } = await ScenariosService.createScenario(testScenario);

      if (createError) {
        throw new Error(`Erreur lors de la création: ${createError.message}`);
      }

      addTestResult({
        success: true,
        message: '✅ Opération d\'écriture réussie',
        details: { createdScenarioId: createdData?.id }
      });

      // Nettoyer: supprimer le scénario de test
      if (createdData?.id) {
        await ScenariosService.deleteScenario(createdData.id);
        addTestResult({
          success: true,
          message: '✅ Nettoyage réussi (scénario de test supprimé)',
          details: { deletedScenarioId: createdData.id }
        });
      }

    } catch (error) {
      addTestResult({
        success: false,
        message: `❌ Erreur écriture: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        details: { error: error instanceof Error ? error.stack : String(error) }
      });
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setConnectionStatus('unknown');
  };

  const getEnvironmentInfo = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Validation de l'URL
    const isValidUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    const isUrlInvalid = !supabaseUrl ||
                      supabaseUrl === 'votre_supabase_url' ||
                      !isValidUrl(supabaseUrl);

    return {
      url: isUrlInvalid ? 'URL invalide ou manquante' : `${supabaseUrl.substring(0, 20)}...`,
      hasKey: !!supabaseKey && supabaseKey !== 'votre_supabase_anon_key',
      keyLength: (supabaseKey && supabaseKey !== 'votre_supabase_anon_key') ? supabaseKey.length : 0,
      isUrlInvalid,
      isKeyInvalid: !supabaseKey || supabaseKey === 'votre_supabase_anon_key'
    };
  };

  const envInfo = getEnvironmentInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Test de connexion Supabase
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                connectionStatus === 'connected'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : connectionStatus === 'disconnected'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {connectionStatus === 'connected' && '✅ Connecté'}
                {connectionStatus === 'disconnected' && '❌ Déconnecté'}
                {connectionStatus === 'unknown' && '❓ Inconnu'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Configuration Supabase
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">URL:</span>
                  <span className={`ml-2 ${envInfo.isUrlInvalid ? 'text-red-600' : 'text-green-600'}`}>
                    {envInfo.isUrlInvalid ? '❌ ' : '✅ '}{envInfo.url}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Clé API:</span>
                  <span className={`ml-2 ${envInfo.hasKey ? 'text-green-600' : 'text-red-600'}`}>
                    {envInfo.hasKey ? `✅ (${envInfo.keyLength} chars)` : '❌ Manquante ou invalide'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Statut:</span>
                  <span className={`ml-2 font-medium ${
                    connectionStatus === 'connected' ? 'text-green-600' :
                    connectionStatus === 'disconnected' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {connectionStatus === 'connected' ? 'Opérationnel' :
                     connectionStatus === 'disconnected' ? 'Non opérationnel' : 'Non testé'}
                  </span>
                </div>
              </div>
              {(!envInfo.hasKey || envInfo.isUrlInvalid) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Action requise:</strong> Veuillez configurer correctement les variables d'environnement dans votre fichier .env.local
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Tests de connexion
              </h2>
              <p className="text-sm text-gray-600">
                Vérifiez que votre connexion à Supabase fonctionne correctement
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={clearResults}
                disabled={isRunning}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Effacer
              </Button>
              <Button
                onClick={testConnection}
                disabled={isRunning}
                className="px-6"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Test en cours...
                  </>
                ) : (
                  <>
                    <Plug className="w-4 h-4 mr-2" />
                    Lancer les tests
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Résultats des tests
            </h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium ${
                          result.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {result.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                            Détails techniques
                          </summary>
                          <pre className="mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <Table className="w-5 h-5 inline mr-2" />
            Résolution de problèmes
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <Key className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Variables d'environnement manquantes</p>
                <p className="text-gray-600">
                  Vérifiez que vous avez bien configuré VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env.local
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Permissions RLS</p>
                <p className="text-gray-600">
                  Assurez-vous que les politiques Row Level Security (RLS) permettent les opérations de lecture sur la table scenarios
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <RefreshCw className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Actualisation</p>
                <p className="text-gray-600">
                  Rafraîchissez la page ou relancez les tests si vous venez de modifier votre configuration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};