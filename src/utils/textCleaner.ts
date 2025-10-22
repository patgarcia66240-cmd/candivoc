/**
 * Utilitaires pour nettoyer le texte avant la synthèse vocale
 */

/**
 * Nettoie le texte pour le rendre adapté à la synthèse vocale
 * @param text Le texte à nettoyer
 * @returns Le texte nettoyé
 */
export const cleanTextForSpeech = (text: string): string => {
  if (!text) return '';

  return text
    // Supprimer les emojis (plages Unicode complètes)
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '')
    // Supprimer les symboles markdown
    .replace(/\*\*(.*?)\*\*/g, '$1') // Gras
    .replace(/\*(.*?)\*/g, '$1')     // Italique
    .replace(/`(.*?)`/g, '$1')       // Code inline
    .replace(/```[\s\S]*?```/g, '')  // Blocs de code
    .replace(/#{1,6}\s/g, '')        // Headers
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Liens markdown
    // Supprimer les caractères spéciaux qui peuvent perturber la lecture
    .replace(/[|*#]/g, '')
    .replace(/\s*[-•]\s*/g, ', ')   // Puces transformées en virgules
    // Nettoyer les espaces multiples et les sauts de ligne excessifs
    .replace(/\n+/g, ' ')           // Sauts de ligne transformés en espaces
    .replace(/\s+/g, ' ')           // Espaces multiples en un seul
    .trim();
};

/**
 * Vérifie si un texte contient des éléments qui devraient être nettoyés avant la synthèse vocale
 * @param text Le texte à vérifier
 * @returns true si le texte nécessite un nettoyage
 */
export const needsTextCleaning = (text: string): boolean => {
  if (!text) return false;

  // Vérifier la présence d'emojis
  const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u.test(text);

  // Vérifier la présence de markdown
  const hasMarkdown = /(\*\*.*?\*\*|\*.*?\*|`.*?`|#{1,6}\s|\[.*?\]\(.*?\))/g.test(text);

  // Vérifier la présence de caractères problématiques
  const hasProblematicChars = /[|*#•-]/g.test(text);

  // Vérifier les sauts de ligne multiples
  const hasMultipleLineBreaks = /\n{2,}/.test(text);

  return hasEmojis || hasMarkdown || hasProblematicChars || hasMultipleLineBreaks;
};

/**
 * Crée une version du texte adaptée pour la voix en retirant les métadonnées
 * @param displayText Le texte complet affiché à l'écran
 * @returns Le texte adapté pour la synthèse vocale
 */
export const createVoiceText = (displayText: string): string => {
  if (!displayText) return '';

  return displayText
    // Supprimer les sections de métadonnées
    .replace(/📊\s*\*?\s*Niveau de difficulté\s*[:：]\s*.*?(?=\n|$)/gi, '')
    .replace(/⏱️\s*\*?\s*Durée estimée\s*[:：]\s*.*?(?=\n|$)/gi, '')
    .replace(/📊\s*\*?\s*Difficulty\s*[:：]\s*.*?(?=\n|$)/gi, '')
    .replace(/⏱️\s*\*?\s*Duration\s*[:：]\s*.*?(?=\n|$)/gi, '')
    .replace(/Niveau de difficulté\s*[:：]\s*.*?(?=\n|$)/gi, '')
    .replace(/Durée estimée\s*[:：]\s*.*?(?=\n|$)/gi, '')
    .replace(/Difficulty\s*[:：]\s*.*?(?=\n|$)/gi, '')
    .replace(/Duration\s*[:：]\s*.*?(?=\n|$)/gi, '')
    // Nettoyer les lignes vides multiples
    .replace(/\n\s*\n/g, '\n')
    // Nettoyer les espaces en début/fin de ligne
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
};