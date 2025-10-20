import React, { useState, useEffect } from 'react';
import {
  Key, Save, Eye, EyeOff, AlertCircle, CheckCircle,   TestTube, User,  Briefcase
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../services/auth/authContext';
import { audioService } from '../services/audio/audioService';
import { aiService } from '../services/ai/aiService';
import { SettingsManager } from '../services/settings/SettingsManager';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    country: '',
    date_of_birth: '',
    nationality: '',
    linkedin: '',
    website: '',
    profession: '',
    company: '',
    openai_api_key: ''
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingVolume, setIsTestingVolume] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: ''
  });

  // Initialiser le formulaire avec les données de l'utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        postal_code: user.postal_code || '',
        city: user.city || '',
        country: user.country || '',
        date_of_birth: user.date_of_birth || '',
        nationality: user.nationality || '',
        linkedin: user.linkedin || '',
        website: user.website || '',
        profession: user.profession || '',
        company: user.company || '',
        openai_api_key: user.openai_api_key || ''
      });
    }
  }, [user]);

  
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage({ type: null, text: '' });

    try {
      console.log('💾 Settings - Saving profile data:', formData);
      await updateProfile(formData);

      // Le useEffect de synchronisation va automatiquement mettre à jour le formulaire
      console.log('✅ Settings - Profile saved, form will sync automatically via useEffect');

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySave = async () => {
    if (!formData.openai_api_key.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer une clé API valide' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: null, text: '' });

    try {
      await updateProfile({ openai_api_key: formData.openai_api_key.trim() });
      setMessage({ type: 'success', text: 'Clé API sauvegardée avec succès!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde de la clé API' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSettings = () => {
    try {
      const settingsJson = SettingsManager.exportSettings();
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candivoc-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Settings exportés avec succès!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'export des settings' });
    }
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        SettingsManager.importSettings(jsonContent);
        setMessage({ type: 'success', text: 'Settings importés avec succès!' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Fichier de settings invalide' });
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  const handleTestVolume = async () => {
    if (isTestingVolume) return;

    setIsTestingVolume(true);
    const testMessage = "Bonjour! Ceci est un test du volume de la voix de l'IA. Vous pouvez ajuster le volume avec le curseur ci-dessus.";

    try {
      await audioService.speakText(testMessage, {
        rate: 0.9,
        pitch: 1.0,
        volume: SettingsManager.getSetting('aiVoiceVolume') || 0.8,
        lang: 'fr-FR'
      });
    } catch (error) {
      console.error('Error testing volume:', error);
      setMessage({ type: 'error', text: 'Erreur lors du test du volume' });
    } finally {
      setIsTestingVolume(false);
    }
  };

  const handleTestAI = async () => {
    if (isTestingAI) return;

    setIsTestingAI(true);
    setMessage({ type: null, text: '' });

    try {
      // Mettre à jour la clé API dans le service IA
      if (formData.openai_api_key) {
        aiService.setApiKey(formData.openai_api_key);
      }

      const result = await aiService.testConnection();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Error testing AI:', error);
      setMessage({ type: 'error', text: 'Erreur lors du test de l\'IA' });
    } finally {
      setIsTestingAI(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser votre profil ? Cette action est irréversible.')) {
      try {
        // Réinitialiser aux valeurs par défaut
        const defaultProfile = {
          first_name: '',
          last_name: '',
          phone: '',
          address: '',
          postal_code: '',
          city: '',
          country: '',
          date_of_birth: '',
          nationality: '',
          linkedin: '',
          website: '',
          profession: '',
          company: '',
          openai_api_key: ''
        };
        setFormData(prev => ({ ...prev, ...defaultProfile }));
        setMessage({ type: 'success', text: 'Profil réinitialisé aux valeurs par défaut!' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur lors de la réinitialisation' });
      }
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Paramètres
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-slate-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Informations personnelles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Prénom"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Jean"
              />

              <Input
                label="Nom"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Dupont"
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="jean.dupont@email.com"
                disabled // Email généralement non modifiable directement
              />

              <Input
                label="Téléphone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />

              <Input
                label="Date de naissance"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />

              <Input
                label="Nationalité"
                type="text"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                placeholder="Française"
              />

              <div className="md:col-span-2">
                <Input
                  label="Adresse"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 rue de la République"
                />
              </div>

              <Input
                label="Code postal"
                type="text"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                placeholder="75001"
              />

              <Input
                label="Ville"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Paris"
              />

              <div className="md:col-span-2">
                <Input
                  label="Pays"
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="France"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Briefcase className="w-6 h-6 text-slate-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Informations professionnelles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Profession"
                type="text"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                placeholder="Développeur Web"
              />

              <Input
                label="Entreprise"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Tech Corp"
              />

              <Input
                label="LinkedIn"
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/jean-dupont"
              />

              <Input
                label="Site web"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://johndoe.com"
              />
            </div>
          </div>

          {/* OpenAI API Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Key className="w-6 h-6 text-slate-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Configuration de l'IA
              </h2>
            </div>

            <div className="space-y-6">
              {/* API Key Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clé API OpenAI
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Configurez votre clé API pour permettre au système IA de fonctionner correctement.
                </p>

                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.openai_api_key}
                      onChange={(e) => handleInputChange('openai_api_key', e.target.value)}
                      placeholder="sk-..."
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <Button
                    variant="gradient"
                    onClick={handleApiKeySave}
                    disabled={isLoading || !formData.openai_api_key.trim()}
                    className="px-6"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>

                  {formData.openai_api_key && (
                    <Button
                      variant="outline"
                      onClick={handleTestAI}
                      disabled={isTestingAI}
                      className="ml-2"
                    >
                      {isTestingAI ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Test...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Tester IA
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Voice Volume Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume de la voix IA
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Ajustez le volume de la voix de l'assistant IA.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={SettingsManager.getSetting('aiVoiceVolume') || 0.8}
                      onChange={(e) => {
                        const volume = parseFloat(e.target.value);
                        SettingsManager.updateSetting('aiVoiceVolume', volume);
                      }}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 min-w-[3rem]">
                      {Math.round((SettingsManager.getSetting('aiVoiceVolume') || 0.8) * 100)}%
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleTestVolume}
                    disabled={isTestingVolume}
                    className="w-full sm:w-auto"
                  >
                    {isTestingVolume ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Test en cours...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Tester le volume
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Save className="w-6 h-6 text-slate-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Gestion des paramètres
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={handleExportSettings}
                  className="flex-1 sm:flex-none"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Exporter les paramètres
                </Button>

                <label className="flex-1 sm:flex-none cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                  />
                  <span className="w-full inline-block">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Importer les paramètres
                    </Button>
                  </span>
                </label>

                <Button
                  variant="outline"
                  onClick={handleResetSettings}
                  className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Réinitialiser le profil
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                Exportez vos paramètres pour les sauvegarder ou les importer sur un autre appareil. Utilisez la réinitialisation pour remettre votre profil aux valeurs par défaut.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="gradient"
                className="w-full sm:w-auto"
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder le profil
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Messages */}
          {message.text && (
            <div className={`flex items-center p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
