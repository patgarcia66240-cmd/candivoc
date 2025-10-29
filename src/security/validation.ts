import DOMPurify from 'dompurify'

// 🔥 Patterns de validation sécurisés pour CandiVoc

export const VALIDATION_PATTERNS = {
  // 📧 Email validation
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // 👤 Name validation (caractères internationaux supportés)
  name: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,

  // 🔐 Password validation (8+ chars, majuscule, minuscule, chiffre, spécial)
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // 📝 Scenario title validation
  scenarioTitle: /^[a-zA-Z0-9\s\-!?€.,À-ÿ]{5,100}$/,

  // 🔑 API Key validation
  apiKey: /^[a-zA-Z0-9\-_]{20,}$/,

  // 📱 Phone validation (format international)
  phone: /^\+?[\d\s\-()]{7,20}$/,

  // 🌐 URL validation
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,

  // 📄 Text validation (anti-XSS)
  safeText: /^[^<>]*$/,

  // 🏢 Company validation
  company: /^[a-zA-Z0-9\s\-.'&À-ÿ]{2,100}$/,

  // 📍 Location validation
  location: /^[a-zA-Z0-9\s\-',À-ÿ]{2,100}$/
}

// 🛡️ Types de validation
export interface ValidationRule {
  pattern: RegExp;
  message: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

// 🎯 Fonction de validation principale
export function validateInput(
  type: keyof typeof VALIDATION_PATTERNS | 'custom',
  value: string,
  customRule?: ValidationRule
): ValidationResult {
  // Si la valeur est vide
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: 'Ce champ est requis'
    }
  }

  // Pour les règles personnalisées
  if (type === 'custom' && customRule) {
    return validateCustomRule(value, customRule)
  }

  // Pour les patterns prédéfinis
  const pattern = VALIDATION_PATTERNS[type as keyof typeof VALIDATION_PATTERNS]
  if (!pattern) {
    return {
      isValid: false,
      error: 'Type de validation non reconnu'
    }
  }

  const isValid = pattern.test(value.trim())
  const sanitized = sanitizeInput(value.trim())

  return {
    isValid,
    error: isValid ? undefined : getErrorMessage(type as keyof typeof VALIDATION_PATTERNS),
    sanitized
  }
}

// 🎯 Validation avec règles personnalisées
function validateCustomRule(value: string, rule: ValidationRule): ValidationResult {
  const trimmedValue = value.trim()

  // Vérification longueur
  if (rule.minLength && trimmedValue.length < rule.minLength) {
    return {
      isValid: false,
      error: `Minimum ${rule.minLength} caractères requis`
    }
  }

  if (rule.maxLength && trimmedValue.length > rule.maxLength) {
    return {
      isValid: false,
      error: `Maximum ${rule.maxLength} caractères autorisés`
    }
  }

  // Vérification pattern
  const isValid = rule.pattern.test(trimmedValue)
  const sanitized = sanitizeInput(trimmedValue)

  return {
    isValid,
    error: isValid ? undefined : rule.message,
    sanitized
  }
}

// 🛡️ Sanitization HTML avec DOMPurify
export function sanitizeHTML(dirty: string): string {
  if (typeof window === 'undefined') {
    // Coté serveur : retourne le texte brut
    return dirty.replace(/<[^>]*>/g, '')
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  })
}

// 🧹 Nettoyage des inputs
export function sanitizeInput(input: string): string {
  return input
    .trim()
    // Supprime les caractères de contrôle (sauf tab, newline, carriage return)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Supprime les tentatives d'injection
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Limite la longueur pour éviter les attaques
    .substring(0, 1000)
}

// 📝 Messages d'erreur personnalisés
function getErrorMessage(type: keyof typeof VALIDATION_PATTERNS): string {
  const errorMessages = {
    email: 'Veuillez entrer une adresse email valide',
    name: 'Le nom doit contenir 2-50 caractères alphabétiques',
    password: 'Le mot de passe doit contenir 8+ caractères avec majuscule, minuscule, chiffre et caractère spécial',
    scenarioTitle: 'Le titre doit contenir 5-100 caractères alphanumériques',
    apiKey: 'Clé API invalide',
    phone: 'Veuillez entrer un numéro de téléphone valide',
    url: 'Veuillez entrer une URL valide commençant par http:// ou https://',
    safeText: 'Le texte ne doit pas contenir de caractères spéciaux dangereux',
    company: 'Le nom de l\'entreprise doit contenir 2-100 caractères',
    location: 'La localisation doit contenir 2-100 caractères'
  }

  return errorMessages[type] || 'Format invalide'
}

// 🔍 Validation avancée pour les champs critiques
export class SecurityValidator {
  // 🎯 Validation email avancée
  static validateEmail(email: string): ValidationResult {
    const basicValidation = validateInput('email', email)
    if (!basicValidation.isValid) return basicValidation

    // Vérifications supplémentaires
    const lowerEmail = email.toLowerCase().trim()

    // Bloquer les domaines temporaires
    const blockedDomains = ['tempmail.com', '10minutemail.com', 'mailinator.com']
    const domain = lowerEmail.split('@')[1]

    if (blockedDomains.some(blocked => domain?.includes(blocked))) {
      return {
        isValid: false,
        error: 'Les adresses email temporaires ne sont pas autorisées'
      }
    }

    return { isValid: true, sanitized: lowerEmail }
  }

  // 🛡️ Validation password forte
  static validatePassword(password: string): ValidationResult {
    const basicValidation = validateInput('password', password)
    if (!basicValidation.isValid) return basicValidation

    // Vérifications supplémentaires
    const hasSequence = /(012|123|234|345|456|567|678|789|890|abc|bcd|cde)/i.test(password)
    const hasRepeatingChars = /(.)\1{2,}/.test(password)

    if (hasSequence) {
      return {
        isValid: false,
        error: 'Le mot de passe ne doit pas contenir de séquences évidentes'
      }
    }

    if (hasRepeatingChars) {
      return {
        isValid: false,
        error: 'Le mot de passe ne doit pas contenir de caractères répétés'
      }
    }

    return { isValid: true, sanitized: password }
  }

  // 🔐 Validation nom d'utilisateur
  static validateUsername(username: string): ValidationResult {
    const rule: ValidationRule = {
      pattern: /^[a-zA-Z0-9_-]{3,20}$/,
      message: 'Le nom d\'utilisateur doit contenir 3-20 caractères alphanumériques, tirets ou underscores',
      minLength: 3,
      maxLength: 20
    }

    return validateCustomRule(username, rule)
  }

  // 📝 Validation contenu de scénario
  static validateScenarioContent(content: string): ValidationResult {
    const sanitized = sanitizeInput(content)
    const wordCount = sanitized.split(/\s+/).length

    if (wordCount < 10) {
      return {
        isValid: false,
        error: 'Le contenu doit contenir au moins 10 mots',
        sanitized
      }
    }

    if (wordCount > 1000) {
      return {
        isValid: false,
        error: 'Le contenu ne doit pas dépasser 1000 mots',
        sanitized
      }
    }

    // Vérification des mots inappropriés
    const inappropriateWords = ['spam', 'abuse', 'hack', 'exploit']
    const hasInappropriate = inappropriateWords.some(word =>
      sanitized.toLowerCase().includes(word)
    )

    if (hasInappropriate) {
      return {
        isValid: false,
        error: 'Le contenu contient des termes inappropriés',
        sanitized
      }
    }

    return { isValid: true, sanitized }
  }
}

// 🚨 Rate limiting pour validation
export class ValidationRateLimiter {
  private static attempts = new Map<string, { count: number; lastAttempt: number }>()

  static canAttempt(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const existing = this.attempts.get(identifier)

    if (!existing || now - existing.lastAttempt > windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }

    if (existing.count >= maxAttempts) {
      return false
    }

    existing.count++
    existing.lastAttempt = now
    return true
  }

  static resetAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

// 🔍 Export des utilitaires
export default {
  validateInput,
  sanitizeHTML,
  sanitizeInput,
  SecurityValidator,
  ValidationRateLimiter,
  VALIDATION_PATTERNS
}
