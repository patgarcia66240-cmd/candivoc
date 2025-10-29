import React, { useState, useEffect } from 'react';
import {
  Key, Save, Eye, EyeOff, AlertCircle, TestTube, User, Briefcase, Volume2, Volume1, VolumeX, MapPin
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../services/auth/useAuth';
import { useToastContext } from '../contexts/useToastContext';
import { useSettings } from '../hooks/useSettings';
import { audioService } from '../services/audio/audioService';
import { aiService } from '../services/ai/aiService';
import { SettingsManager } from '../services/settings/SettingsManager';
import { cleanTextForSpeech } from '../utils/textCleaner';
import { SettingsSkeleton } from '../components/ui/SettingsSkeleton';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { settings, updateSetting } = useSettings();
  const toast = useToastContext();

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
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestingVolume, setIsTestingVolume] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Initialiser le formulaire avec les données de l'utilisateur
  useEffect(() => {
    console.log('🔄 Settings useEffect - User changed:', {
      userId: user?.id,
      userEmail: user?.email,
      hasUser: !!user,
      userUpdatedAt: user?.updatedAt
    });

    if (user) {
      console.log('📝 Settings - Updating form data with user profile:', {
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        postal_code: user.postal_code,
        openai_api_key_length: user.openai_api_key?.length || 0
      });

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
    } else {
      console.log('⚠️ Settings - No user available, form not initialized');
    }
  }, [user, forceRefresh]);

  // Forcer le rafraîchissement des données au chargement de la page
  useEffect(() => {
    if (user) {
      console.log('🔃 Settings - Forcing profile data refresh on page load');
      setForceRefresh(prev => prev + 1);
    }
  }, [user]); // Seulement au montage du composant ou quand user change

  // Arrêter le chargement initial après l'initialisation
  useEffect(() => {
    if (user) {
      setIsLoading(false);
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

    try {
      console.log('💾 Settings - Starting profile save process...');
      console.log('💾 Settings - Current formData:', formData);
      console.log('💾 Settings - User before save:', user);

      // Valider les données avant envoi
      if (!user?.id) {
        console.error('❌ Settings - No user ID available');
        toast.error('Erreur: Utilisateur non connecté');
        setIsLoading(false);
        return;
      }

      // Filtrer les données vides pour éviter les mises à jour inutiles
      const dataToSave = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          const shouldInclude = value !== '' && value !== null && value !== undefined;
          console.log(`💾 Settings - Field ${key}: "${value}" -> included: ${shouldInclude}`);
          return shouldInclude;
        })
      );

      console.log('💾 Settings - Filtered data to save:', dataToSave);

      if (Object.keys(dataToSave).length === 0) {
        console.log('⚠️ Settings - No data to save, all fields are empty');
        toast.info('Aucune modification à sauvegarder');
        setIsLoading(false);
        return;
      }

      // Appeler la fonction updateProfile avec logging détaillé
      console.log('💾 Settings - Calling updateProfile with data:', dataToSave);
      await updateProfile(dataToSave);
      console.log('💾 Settings - updateProfile completed successfully');

      // Le useEffect de synchronisation va automatiquement mettre à jour le formulaire
      console.log('✅ Settings - Profile saved, form will sync automatically via useEffect');

      toast.success('Profil mis à jour avec succès! Vos changements ont été sauvegardés.');

      // 💡 Indiquer visuellement que la sauvegarde a réussi
      setSaveSuccess(true);

      // 💡 Pas de redirection - l'utilisateur reste sur la page settings
      // Cela permet de continuer à modifier les Paramètres si nécessaire
      console.log('✅ Settings - User remains on settings page after save (no redirect)');

      // Réinitialiser l'état de succès après 3 secondes
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('❌ Settings - Error updating profile:', error);
      console.error('❌ Settings - Error details:', {
        message: (error as Error)?.message,
        stack: (error as Error)?.stack,
        name: (error as Error)?.name,
        cause: (error as Error)?.cause
      });
      toast.error(`Erreur lors de la mise à jour du profil: ${(error as Error)?.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySave = async () => {
    if (!formData.openai_api_key.trim()) {
      toast.error('Veuillez entrer une Clé API valide');
      return;
    }

    setIsLoading(true);

    try {
      await updateProfile({ openai_api_key: formData.openai_api_key.trim() });
      toast.success('Clé API sauvegardée avec succès!');
    } catch {
      toast.error('Erreur lors de la sauvegarde de la Clé API');
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

      toast.success('Settings exportés avec succès!');
    } catch {
      toast.error('Erreur lors de l\'export des settings');
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
        toast.success('Settings importés avec succès!');
      } catch {
        toast.error('Fichier de settings invalide');
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
      await audioService.speakText(cleanTextForSpeech(testMessage), {
        rate: 0.9,
        pitch: 1.0,
        volume: getCurrentVolume(),
        lang: 'fr-FR'
      });
    } catch (error) {
      console.error('Error testing volume:', error);
      toast.error('Erreur lors du test du volume');
    } finally {
      setIsTestingVolume(false);
    }
  };

  const getVolumeIcon = () => {
    const volume = settings.aiVoiceVolume ?? 0.9;
    if (volume === 0) return <VolumeX className="w-5 h-5 self-center" />;
    if (volume < 0.5) return <Volume1 className="w-5 h-5 self-center" />;
    return <Volume2 className="w-5 h-5 self-center" />;
  };

  const getVolumeColor = () => {
    const volume = settings.aiVoiceVolume ?? 0.9;
    if (volume === 0) return 'bg-red-100 text-red-600 border-red-200';
    if (volume < 0.5) return 'bg-yellow-100 text-yellow-600 border-yellow-200';
    if (volume === 0.6) return 'bg-blue-100 text-blue-600 border-blue-200';
    if (volume === 1) return 'bg-purple-100 text-purple-600 border-purple-200';
    return 'bg-green-100 text-green-600 border-green-200';
  };

  const getCurrentVolume = () => {
    return settings.aiVoiceVolume ?? 0.9;
  };

  const handleTestAI = async () => {
    if (isTestingAI) return;

    setIsTestingAI(true);

    try {
      // Mettre à jour la Clé API dans le service IA
      if (formData.openai_api_key) {
        aiService.setApiKey(formData.openai_api_key);
      }

      const result = await aiService.testConnection();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error testing AI:', error);
      toast.error('Erreur lors du test de l\'IA');
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
        toast.success('Profil réinitialisé aux valeurs par défaut!');
      } catch {
        toast.error('Erreur lors de la réinitialisation');
      }
    }
  };

  // Afficher le skeleton pendant le chargement des paramètres
  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <>
      {/* Styles personnalisés pour le slider */}
      <style>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #6b7280;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
          margin-top: -5px; /* Centrer le thumb sur la piste */
        }
        .volume-slider::-webkit-slider-thumb:hover {
          background: #4b5563;
          transform: scale(1.1);
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }
        .volume-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #6b7280;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .volume-slider::-moz-range-thumb:hover {
          background: #4b5563;
          transform: scale(1.1);
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }
        .volume-slider::-webkit-slider-runnable-track {
          height: 10px;
          background: #e5e7eb;
          border-radius: 5px;
          border: none;
        }
        .volume-slider::-moz-range-track {
          height: 10px;
          background: #e5e7eb;
          border-radius: 5px;
          border: none;
        }
        .volume-slider:focus {
          outline: none;
        }
        .volume-slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.3);
        }
        .volume-slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.3);
        }
      `}</style>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Paramètres
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">

          {/* Profile Information - 2 Columns Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">

            {/* Column 1: Informations Personnelles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Informations Personnelles
                </h2>
              </div>

              <div className="space-y-6">
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
              </div>
            </div>

            {/* Column 2: Informations Professionnelles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <Briefcase className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Informations Professionnelles
                </h2>
              </div>

              <div className="space-y-6">
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
                  placeholder="Tech Company"
                />

                <Input
                  label="LinkedIn"
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/jean-dupont"
                />

                <Input
                  label="Site Web"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://jendupont.com"
                />
              </div>
            </div>
          </div>

          {/* Contact Information - Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-6 h-6 text-orange-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Adresse et Contact
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Adresse"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Rue de la République"
              />

              <Input
                label="Code Postal"
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

              <Input
                label="Pays"
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="France"
              />
            </div>
          </div>

  
          {/* OpenAI API Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <Key className="w-6 h-6 text-slate-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configuration de l'IA
              </h2>
            </div>

            <div className="space-y-8">
              {/* API Key Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clé API OpenAI
                </label>
                <p className="text-sm2 text-gray-500 dark:text-gray-400 mb-4">
                  Configurez votre Clé API pour permettre au système IA de fonctionner correctement.
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300"
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
                        sauvegarder
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

              {/* Voice Volume Section - Améliorée */}
              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Volume de la voix IA
                    </label>
                    <p className="text-sm2 text-gray-500 dark:text-gray-400">
                      Ajustez le volume de la voix de l'assistant IA pour une expérience optimale.
                    </p>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${getVolumeColor()}`}>
                    {getVolumeIcon()}
                    <span className="text-sm font-medium">
                      {Math.round(getCurrentVolume() * 100)}%
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  {/* Curseur de volume principal */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Volume principal</span>
                      <div className="flex items-center space-x-3">
                        <VolumeX className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 max-w-xs relative">
                          <div
                            className="absolute top-1/2 left-0 h-2 bg-gray-400 rounded-l-lg transform -translate-y-1/2 transition-all duration-200"
                            style={{ width: `${getCurrentVolume() * 100}%` }}
                          />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={getCurrentVolume()}
                            onChange={(e) => {
                              const volume = parseFloat(e.target.value);
                              updateSetting('aiVoiceVolume', volume);
                            }}
                            className="volume-slider w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer relative z-10"
                          />
                        </div>
                        <Volume2 className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Préréglages rapides */}
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => updateSetting('aiVoiceVolume', 0)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          getCurrentVolume() === 0
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-gray-100 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        Muet
                      </button>
                      <button
                        onClick={() => updateSetting('aiVoiceVolume', 0.3)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          getCurrentVolume() === 0.3
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-gray-100 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        30%
                      </button>
                      <button
                        onClick={() => updateSetting('aiVoiceVolume', 0.6)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          getCurrentVolume() === 0.6
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        60%
                      </button>
                      <button
                        onClick={() => updateSetting('aiVoiceVolume', 0.9)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          getCurrentVolume() === 0.9
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        90% (Recommandé)
                      </button>
                      <button
                        onClick={() => updateSetting('aiVoiceVolume', 1)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          getCurrentVolume() === 1
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-gray-100 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        100%
                      </button>
                    </div>
                  </div>

                  {/* Bouton de test */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Cliquez sur le bouton pour tester le volume avec la voix actuelle de l'IA
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleTestVolume}
                      disabled={isTestingVolume}
                      className="px-6"
                    >
                      {isTestingVolume ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Test en cours...
                        </>
                      ) : (
                        <>
                          {getVolumeIcon()}
                          <span className="ml-2">Tester le volume</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <Save className="w-6 h-6 text-slate-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestion des Paramètres
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
                  Exporter les Paramètres
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
                      Importer les Paramètres
                    </Button>
                  </span>
                </label>

                <Button
                  variant="outline"
                  onClick={handleResetSettings}
                  className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 focus:ring-red-500"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Réinitialiser le profil
                </Button>
              </div>

              <p className="text-sm2 text-gray-500 dark:text-gray-400">
                Exportez vos Paramètres pour les sauvegarder ou les importer sur un autre appareil. Utilisez la réinitialisation pour remettre votre profil aux valeurs par défaut.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant={saveSuccess ? "primary" : "gradient"}
                className="w-full sm:w-auto transition-all duration-300"
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde en cours...
                  </>
                ) : saveSuccess ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    sauvegardé avec succès ✓
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder le profil
                  </>
                )}
              </Button>
            </div>

          {/* Message de confirmation */}
          {saveSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Vos changements ont été sauvegardés avec succès!
                  </p>
                  <p className="text-sm text-green-700">
                    Vous restez sur cette page pour continuer à modifier vos Paramètres.
                  </p>
                </div>
              </div>
            </div>
          )}
          </div>

        </div>
      </div>
    </>
  );
};
