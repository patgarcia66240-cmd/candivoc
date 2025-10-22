/**
 * Interface pour les settings de l'application
 */
export interface AppSettings {
  // API Configuration
  apiKey?: string;

  // Préférences utilisateur
  notifications: boolean;
  soundEnabled: boolean;
  autoSave: boolean;
  language: 'fr' | 'en' | 'es';
  theme: 'light' | 'dark' | 'auto';

  // Paramètres avancés
  maxSessions?: number;
  sessionTimeout?: number; // en minutes
  autoBackup?: boolean;

  // Paramètres audio
  aiVoiceVolume: number; // Volume de la voix de l'IA (0.0 à 1.0)

  // Métadonnées
  lastUpdated?: string;
  version?: string;
}

/**
 * Settings par défaut de l'application
 */
const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  soundEnabled: true,
  autoSave: true,
  language: 'fr',
  theme: 'light',
  maxSessions: 50,
  sessionTimeout: 30,
  autoBackup: true,
  aiVoiceVolume: 0.9, // Volume par défaut à 90% (recommandé pour une voix naturelle)
  lastUpdated: new Date().toISOString(),
  version: '1.0.0'
};

/**
 * Classe pour gérer les settings de l'application
 * Stockage local avec vérification et correction automatique
 */
export class SettingsManager {
  private static readonly STORAGE_KEY = 'candivoc_app_settings';
  private static readonly SETTINGS_VERSION = '1.0.0';

  /**
   * Récupère tous les settings depuis le stockage local
   * Vérifie et corrige les settings si nécessaire
   */
  static getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (!stored) {
        console.info('Aucun settings trouvé, utilisation des valeurs par défaut');
        return this.saveAndGetDefaults();
      }

      const parsedSettings = JSON.parse(stored);

      // Validation et correction des settings
      const correctedSettings = this.validateAndCorrectSettings(parsedSettings);

      // Si les settings ont été modifiés, on les sauvegarde
      if (JSON.stringify(correctedSettings) !== JSON.stringify(parsedSettings)) {
        console.info('Settings corrigés et sauvegardés');
        this.saveSettings(correctedSettings);
      }

      return correctedSettings;

    } catch (error) {
      console.error('Erreur lors de la récupération des settings:', error);
      return this.saveAndGetDefaults();
    }
  }

  /**
   * Sauvegarde les settings dans le stockage local
   */
  static saveSettings(settings: Partial<AppSettings>): AppSettings {
    try {
      // Utilise les settings par défaut comme base au lieu d'appeler getSettings()
      const currentSettings = { ...DEFAULT_SETTINGS };
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        lastUpdated: new Date().toISOString(),
        version: this.SETTINGS_VERSION
      };

      const validatedSettings = this.validateAndCorrectSettings(updatedSettings);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validatedSettings));

      console.info('Settings sauvegardés avec succès');
      return validatedSettings;

    } catch (error) {
      console.error('Erreur lors de la sauvegarde des settings:', error);
      throw new Error('Impossible de sauvegarder les settings');
    }
  }

  /**
   * Récupère une valeur spécifique des settings
   */
  static getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    const settings = this.getSettings();
    return settings[key];
  }

  /**
   * Met à jour une valeur spécifique des settings
   */
  static updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): AppSettings {
    return this.saveSettings({ [key]: value });
  }

  /**
   * Réinitialise tous les settings aux valeurs par défaut
   */
  static resetToDefaults(): AppSettings {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.info('Settings réinitialisés aux valeurs par défaut');
      return this.saveAndGetDefaults();
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des settings:', error);
      throw new Error('Impossible de réinitialiser les settings');
    }
  }

  /**
   * Exporte les settings en format JSON
   */
  static exportSettings(): string {
    try {
      const settings = this.getSettings();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export des settings:', error);
      throw new Error('Impossible d\'exporter les settings');
    }
  }

  /**
   * Importe les settings depuis une chaîne JSON
   */
  static importSettings(jsonString: string): AppSettings {
    try {
      const importedSettings = JSON.parse(jsonString);
      const validatedSettings = this.validateAndCorrectSettings(importedSettings);
      return this.saveSettings(validatedSettings);
    } catch (error) {
      console.error('Erreur lors de l\'import des settings:', error);
      throw new Error('Format JSON invalide ou settings corrompus');
    }
  }

  /**
   * Vérifie si les settings sont valides et les corrige si nécessaire
   */
  private static validateAndCorrectSettings(settings: unknown): AppSettings {
    const corrected: AppSettings = { ...DEFAULT_SETTINGS };

    // Validation et correction pour chaque champ
    if (typeof settings === 'object' && settings !== null) {

      // API Key (string optionnelle)
      if (settings.apiKey !== undefined) {
        corrected.apiKey = typeof settings.apiKey === 'string' ? settings.apiKey : undefined;
      }

      // Notifications (boolean)
      corrected.notifications = typeof settings.notifications === 'boolean'
        ? settings.notifications
        : DEFAULT_SETTINGS.notifications;

      // Sound enabled (boolean)
      corrected.soundEnabled = typeof settings.soundEnabled === 'boolean'
        ? settings.soundEnabled
        : DEFAULT_SETTINGS.soundEnabled;

      // Auto save (boolean)
      corrected.autoSave = typeof settings.autoSave === 'boolean'
        ? settings.autoSave
        : DEFAULT_SETTINGS.autoSave;

      // Language (enum)
      if (['fr', 'en', 'es'].includes(settings.language)) {
        corrected.language = settings.language;
      }

      // Theme (enum)
      if (['light', 'dark', 'auto'].includes(settings.theme)) {
        corrected.theme = settings.theme;
      }

      // Max sessions (number positif)
      if (typeof settings.maxSessions === 'number' && settings.maxSessions > 0) {
        corrected.maxSessions = Math.min(settings.maxSessions, 1000); // Limite raisonnable
      }

      // Session timeout (number positif en minutes)
      if (typeof settings.sessionTimeout === 'number' && settings.sessionTimeout > 0) {
        corrected.sessionTimeout = Math.min(Math.max(settings.sessionTimeout, 5), 480); // Entre 5min et 8h
      }

      // Auto backup (boolean)
      corrected.autoBackup = typeof settings.autoBackup === 'boolean'
        ? settings.autoBackup
        : DEFAULT_SETTINGS.autoBackup;

      // AI Voice Volume (number between 0 and 1)
      if (typeof settings.aiVoiceVolume === 'number') {
        corrected.aiVoiceVolume = Math.max(0, Math.min(1, settings.aiVoiceVolume));
      }

      // Version (string)
      corrected.version = typeof settings.version === 'string'
        ? settings.version
        : this.SETTINGS_VERSION;
    }

    return corrected;
  }

  /**
   * Sauvegarde les settings par défaut et les retourne
   */
  private static saveAndGetDefaults(): AppSettings {
    const defaults = {
      ...DEFAULT_SETTINGS,
      lastUpdated: new Date().toISOString(),
      version: this.SETTINGS_VERSION
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaults));
    } catch (error) {
      console.error('Impossible de sauvegarder les settings par défaut:', error);
    }

    return defaults;
  }

  /**
   * Vérifie l'intégrité des settings stockés
   */
  static checkSettingsIntegrity(): {
    isValid: boolean;
    issues: string[];
    correctedSettings?: AppSettings;
  } {
    const issues: string[] = [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (!stored) {
        issues.push('Aucun settings trouvé');
        return { isValid: false, issues };
      }

      const parsed = JSON.parse(stored);
      const corrected = this.validateAndCorrectSettings(parsed);

      // Comparaison pour détecter les corrections
      if (JSON.stringify(parsed) !== JSON.stringify(corrected)) {
        issues.push('Settings corrompus ou incomplets, corrections appliquées');
      }

      return {
        isValid: issues.length === 0,
        issues,
        correctedSettings: issues.length > 0 ? corrected : undefined
      };

    } catch (error) {
      issues.push(`Erreur de lecture: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return { isValid: false, issues };
    }
  }

  /**
   * Nettoie le stockage local des settings invalides
   */
  static cleanup(): void {
    try {
      const integrity = this.checkSettingsIntegrity();

      if (!integrity.isValid && integrity.correctedSettings) {
        this.saveSettings(integrity.correctedSettings);
        console.info('Nettoyage des settings terminé');
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des settings:', error);
    }
  }
}
