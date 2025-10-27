/**
 * Tests pour la classe SettingsManager
 * Ces tests sont exécutés avec Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SettingsManager } from './SettingsManager';

// Mock localStorage pour les tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('SettingsManager', () => {
  beforeEach(() => {
    // Nettoyer localStorage avant chaque test
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getSettings()', () => {
    it('devrait retourner les settings par défaut si aucun setting n\'existe', () => {
      const settings = SettingsManager.getSettings();

      expect(settings.notifications).toBe(true);
      expect(settings.soundEnabled).toBe(true);
      expect(settings.autoSave).toBe(true);
      expect(settings.language).toBe('fr');
      expect(settings.theme).toBe('light');
      expect(settings.version).toBe('1.0.0');
      expect(settings.lastUpdated).toBeDefined();
    });

    it('devrait sauvegarder les settings par défaut s\'il n\'en existe aucun', () => {
      SettingsManager.getSettings();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'candivoc_app_settings',
        expect.stringContaining('"notifications":true')
      );
    });

    it('devrait charger les settings existants', () => {
      const customSettings = {
        notifications: false,
        soundEnabled: false,
        autoSave: false,
        language: 'en' as const,
        theme: 'dark' as const,
        apiKey: 'test-key-123'
      };

      localStorageMock.setItem(
        'candivoc_app_settings',
        JSON.stringify(customSettings)
      );

      const settings = SettingsManager.getSettings();

      expect(settings.notifications).toBe(false);
      expect(settings.soundEnabled).toBe(false);
      expect(settings.autoSave).toBe(false);
      expect(settings.language).toBe('en');
      expect(settings.theme).toBe('dark');
      expect(settings.apiKey).toBe('test-key-123');
    });

    it('devrait corriger les settings invalides', () => {
      const invalidSettings = {
        notifications: 'oui', // devrait être boolean
        soundEnabled: null,   // devrait être boolean
        autoSave: 1,          // devrait être boolean
        language: 'de',       // langue non supportée
        theme: 'blue',        // thème non supporté
        maxSessions: -5,      // devrait être positif
        sessionTimeout: '30min' // devrait être number
      };

      localStorageMock.setItem(
        'candivoc_app_settings',
        JSON.stringify(invalidSettings)
      );

      const settings = SettingsManager.getSettings();

      // Vérifie que les valeurs invalides ont été corrigées
      expect(settings.notifications).toBe(true);
      expect(settings.soundEnabled).toBe(true);
      expect(settings.autoSave).toBe(true);
      expect(settings.language).toBe('fr');
      expect(settings.theme).toBe('light');
      expect(settings.maxSessions).toBeGreaterThan(0);
      expect(typeof settings.sessionTimeout).toBe('number');
    });

    it('devrait gérer les erreurs de JSON', () => {
      localStorageMock.setItem('candivoc_app_settings', 'invalid-json');

      const settings = SettingsManager.getSettings();

      // Devrait retourner les settings par défaut en cas d'erreur
      expect(settings.notifications).toBe(true);
      expect(settings.language).toBe('fr');
    });
  });

  describe('saveSettings()', () => {
    it('devrait sauvegarder les settings avec succès', () => {
      const newSettings = {
        notifications: false,
        language: 'en' as const
      };

      const updatedSettings = SettingsManager.saveSettings(newSettings);

      expect(updatedSettings.notifications).toBe(false);
      expect(updatedSettings.language).toBe('en');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'candivoc_app_settings',
        expect.stringContaining('"notifications":false')
      );
    });

    it('devrait fusionner les nouveaux settings avec les existants', () => {
      // D'abord charger les settings par défaut
      SettingsManager.getSettings();

      // Puis mettre à jour un seul champ
      const updatedSettings = SettingsManager.saveSettings({
        notifications: false
      });

      expect(updatedSettings.notifications).toBe(false);
      expect(updatedSettings.soundEnabled).toBe(true); // devrait garder la valeur par défaut
      expect(updatedSettings.language).toBe('fr');   // devrait garder la valeur par défaut
    });

    it('devrait ajouter les métadonnées de version et date', () => {
      const updatedSettings = SettingsManager.saveSettings({
        theme: 'dark' as const
      });

      expect(updatedSettings.version).toBe('1.0.0');
      expect(updatedSettings.lastUpdated).toBeDefined();
      expect(new Date(updatedSettings.lastUpdated!)).toBeInstanceOf(Date);
    });

    it('devrait valider et corriger les settings avant sauvegarde', () => {
      const invalidSettings = {
        language: 'invalid-lang',
        theme: 'invalid-theme',
        maxSessions: -10
      };

      const correctedSettings = SettingsManager.saveSettings(invalidSettings);

      expect(correctedSettings.language).toBe('fr');
      expect(correctedSettings.theme).toBe('light');
      expect(correctedSettings.maxSessions).toBeGreaterThan(0);
    });
  });

  describe('getSetting() et updateSetting()', () => {
    it('devrait récupérer un setting spécifique', () => {
      SettingsManager.saveSettings({ language: 'en' });

      const language = SettingsManager.getSetting('language');

      expect(language).toBe('en');
    });

    it('devrait mettre à jour un setting spécifique', () => {
      SettingsManager.getSettings(); // Initialiser

      const updated = SettingsManager.updateSetting('notifications', false);

      expect(updated.notifications).toBe(false);
      expect(SettingsManager.getSetting('notifications')).toBe(false);
    });
  });

  describe('resetToDefaults()', () => {
    it('devrait réinitialiser aux valeurs par défaut', () => {
      // D'abord modifier des settings
      SettingsManager.saveSettings({
        notifications: false,
        language: 'en',
        theme: 'dark'
      });

      // Puis réinitialiser
      const resetSettings = SettingsManager.resetToDefaults();

      expect(resetSettings.notifications).toBe(true);
      expect(resetSettings.language).toBe('fr');
      expect(resetSettings.theme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('devrait supprimer l\'ancienne clé et en créer une nouvelle', () => {
      SettingsManager.getSettings(); // Créer des settings

      SettingsManager.resetToDefaults();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('candivoc_app_settings');
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2); // Une fois pour la création, une fois pour la réinitialisation
    });
  });

  describe('exportSettings() et importSettings()', () => {
    it('devrait exporter les settings en JSON', () => {
      SettingsManager.saveSettings({
        notifications: false,
        language: 'en'
      });

      const exported = SettingsManager.exportSettings();

      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed.notifications).toBe(false);
      expect(parsed.language).toBe('en');
    });

    it('devrait importer des settings depuis JSON', () => {
      const jsonSettings = JSON.stringify({
        notifications: false,
        language: 'en',
        theme: 'dark',
        apiKey: 'imported-key'
      });

      const imported = SettingsManager.importSettings(jsonSettings);

      expect(imported.notifications).toBe(false);
      expect(imported.language).toBe('en');
      expect(imported.theme).toBe('dark');
      expect(imported.apiKey).toBe('imported-key');
    });

    it('devrait valider et corriger les settings importés', () => {
      const invalidJson = JSON.stringify({
        notifications: 'yes',
        language: 'deutsch',
        theme: 'blue'
      });

      const imported = SettingsManager.importSettings(invalidJson);

      expect(imported.notifications).toBe(true);
      expect(imported.language).toBe('fr');
      expect(imported.theme).toBe('light');
    });

    it('devrait lever une erreur pour JSON invalide', () => {
      const invalidJson = 'not-valid-json';

      expect(() => {
        SettingsManager.importSettings(invalidJson);
      }).toThrow();
    });
  });

  describe('checkSettingsIntegrity()', () => {
    it('devrait retourner true pour des settings valides', () => {
      SettingsManager.saveSettings({ language: 'en' });

      const integrity = SettingsManager.checkSettingsIntegrity();

      expect(integrity.isValid).toBe(true);
      expect(integrity.issues).toHaveLength(0);
    });

    it('devrait détecter des settings corrompus', () => {
      localStorageMock.setItem('candivoc_app_settings', 'corrupted-data');

      const integrity = SettingsManager.checkSettingsIntegrity();

      expect(integrity.isValid).toBe(false);
      expect(integrity.issues.length).toBeGreaterThan(0);
    });

    it('devrait détecter des settings incomplets', () => {
      localStorageMock.setItem(
        'candivoc_app_settings',
        JSON.stringify({ notifications: true })
      );

      const integrity = SettingsManager.checkSettingsIntegrity();

      expect(integrity.isValid).toBe(false);
      expect(integrity.correctedSettings).toBeDefined();
      expect(integrity.correctedSettings!.language).toBe('fr');
    });

    it('devrait détecter l\'absence de settings', () => {
      const integrity = SettingsManager.checkSettingsIntegrity();

      expect(integrity.isValid).toBe(false);
      expect(integrity.issues).toContain('Aucun settings trouvé');
    });
  });

  describe('cleanup()', () => {
    it('devrait nettoyer les settings corrompus', () => {
      localStorageMock.setItem(
        'candivoc_app_settings',
        JSON.stringify({ notifications: 'invalid' })
      );

      SettingsManager.cleanup();

      // Vérifie que les settings ont été corrigés et sauvegardés
      const settings = SettingsManager.getSettings();
      expect(settings.notifications).toBe(true);
    });

    it('ne devrait rien faire si les settings sont valides', () => {
      SettingsManager.saveSettings({ language: 'en' });

      SettingsManager.cleanup();

      const settings = SettingsManager.getSettings();
      expect(settings.language).toBe('en');
    });
  });

  describe('Gestion des erreurs', () => {
    it('getSettings devrait gérer les erreurs de localStorage', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const settings = SettingsManager.getSettings();

      expect(settings.notifications).toBe(true); // Valeurs par défaut
    });

    it('saveSettings devrait lever une erreur en cas d\'échec', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        SettingsManager.saveSettings({ notifications: false });
      }).toThrow('Impossible de sauvegarder les settings');
    });

    it('resetToDefaults devrait lever une erreur en cas d\'échec', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        SettingsManager.resetToDefaults();
      }).toThrow('Impossible de réinitialiser les settings');
    });
  });
});

/**
 * Tests d'intégration pour le hook useSettings
 * Ces tests nécessitent React Testing Library
 */

/*
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../../hooks/useSettings';

describe('useSettings hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('devrait charger les settings au montage', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.settings.notifications).toBe(true);
    expect(result.current.settings.language).toBe('fr');
    expect(result.current.isLoading).toBe(false);
  });

  it('devrait mettre à jour un setting', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateSetting('notifications', false);
    });

    expect(result.current.settings.notifications).toBe(false);
  });

  it('devrait gérer les erreurs', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useSettings());

    expect(result.current.error).toBeTruthy();
  });

  it('devrait réinitialiser les settings', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateSetting('notifications', false);
    });

    act(() => {
      result.current.resetSettings();
    });

    expect(result.current.settings.notifications).toBe(true);
  });

  it('devrait exporter les settings', () => {
    const { result } = renderHook(() => useSettings());

    const exported = result.current.exportSettings();

    expect(typeof exported).toBe('string');
    const parsed = JSON.parse(exported);
    expect(parsed.notifications).toBe(true);
  });
});
*/
