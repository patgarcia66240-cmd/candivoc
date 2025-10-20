import { useState, useEffect, useCallback } from 'react';
import { type AppSettings, SettingsManager } from '../services/settings/SettingsManager';

/**
 * Hook React pour gérer les settings de l'application
 * Fournit un état local synchronisé avec le stockage local
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(SettingsManager.getSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronise l'état local avec le stockage local au montage
  useEffect(() => {
    try {
      const currentSettings = SettingsManager.getSettings();
      setSettings(currentSettings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Met à jour un setting spécifique
   */
  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      setIsLoading(true);
      const updatedSettings = SettingsManager.updateSetting(key, value);
      setSettings(updatedSettings);
      setError(null);
      return updatedSettings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Met à jour plusieurs settings en une fois
   */
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    try {
      setIsLoading(true);
      const updatedSettings = SettingsManager.saveSettings(newSettings);
      setSettings(updatedSettings);
      setError(null);
      return updatedSettings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Réinitialise tous les settings aux valeurs par défaut
   */
  const resetSettings = useCallback(() => {
    try {
      setIsLoading(true);
      const defaultSettings = SettingsManager.resetToDefaults();
      setSettings(defaultSettings);
      setError(null);
      return defaultSettings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Exporte les settings en format JSON
   */
  const exportSettings = useCallback(() => {
    try {
      return SettingsManager.exportSettings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'export';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Importe les settings depuis une chaîne JSON
   */
  const importSettings = useCallback((jsonString: string) => {
    try {
      setIsLoading(true);
      const importedSettings = SettingsManager.importSettings(jsonString);
      setSettings(importedSettings);
      setError(null);
      return importedSettings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'import';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Vérifie l'intégrité des settings
   */
  const checkIntegrity = useCallback(() => {
    try {
      return SettingsManager.checkSettingsIntegrity();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Nettoie les settings
   */
  const cleanup = useCallback(() => {
    try {
      SettingsManager.cleanup();
      const cleanedSettings = SettingsManager.getSettings();
      setSettings(cleanedSettings);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du nettoyage';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Recharge les settings depuis le stockage local
   */
  const reload = useCallback(() => {
    try {
      setIsLoading(true);
      const currentSettings = SettingsManager.getSettings();
      setSettings(currentSettings);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du rechargement';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // État
    settings,
    isLoading,
    error,

    // Actions
    updateSetting,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    checkIntegrity,
    cleanup,
    reload,

    // Utilitaires
    clearError: useCallback(() => setError(null), []),
  };
};
