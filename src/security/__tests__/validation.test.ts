import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  validateInput,
  sanitizeHTML,
  sanitizeInput,
  SecurityValidator,
  ValidationRateLimiter,
  VALIDATION_PATTERNS
} from '../validation'

// Mock DOMPurify pour les tests
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((dirty: string) => {
      // Simulation simple de la sanitization
      return dirty
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
    })
  }
}))

describe('Security Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ValidationRateLimiter.resetAttempts('test')
  })

  describe('VALIDATION_PATTERNS', () => {
    it('devrait valider un email correct', () => {
      const result = validateInput('email', 'test@example.com')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('devrait rejeter un email incorrect', () => {
      const result = validateInput('email', 'invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Veuillez entrer une adresse email valide')
    })

    it('devrait valider un mot de passe fort', () => {
      const result = validateInput('password', 'SecurePass123!')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('devrait rejeter un mot de passe faible', () => {
      const result = validateInput('password', 'weak')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Le mot de passe doit contenir 8+ caractères avec majuscule, minuscule, chiffre et caractère spécial')
    })

    it('devrait valider un nom correct', () => {
      const result = validateInput('name', 'Jean Dupont')
      expect(result.isValid).toBe(true)
    })

    it('devrait rejeter un nom avec caractères spéciaux', () => {
      const result = validateInput('name', 'John<script>')
      expect(result.isValid).toBe(false)
    })
  })

  describe('Sanitization', () => {
    it('devrait nettoyer un HTML safe', () => {
      const safeHTML = sanitizeHTML('<p>Hello <b>World</b></p>')
      expect(safeHTML).toBe('<p>Hello <b>World</b></p>')
    })

    it('devrait supprimer les scripts', () => {
      const maliciousHTML = sanitizeHTML('<p>Hello</p><script>alert("xss")</script>')
      expect(maliciousHTML).not.toContain('<script>')
      expect(maliciousHTML).not.toContain('alert')
    })

    it('devrait nettoyer les inputs utilisateur', () => {
      const userInput = sanitizeInput('test\x00\x1F<script>')
      expect(userInput).toBe('test')
    })

    it('devrait limiter la longueur des inputs', () => {
      const longInput = 'a'.repeat(1500)
      const sanitized = sanitizeInput(longInput)
      expect(sanitized.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('SecurityValidator', () => {
    describe('validateEmail', () => {
      it('devrait valider un email standard', () => {
        const result = SecurityValidator.validateEmail('test@example.com')
        expect(result.isValid).toBe(true)
        expect(result.sanitized).toBe('test@example.com')
      })

      it('devrait rejeter les domaines temporaires', () => {
        const result = SecurityValidator.validateEmail('test@tempmail.com')
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('temporaires')
      })

      it('devrait normaliser la casse', () => {
        const result = SecurityValidator.validateEmail('Test@EXAMPLE.COM')
        expect(result.isValid).toBe(true)
        expect(result.sanitized).toBe('test@example.com')
      })
    })

    describe('validatePassword', () => {
      it('devrait rejeter les séquences évidentes', () => {
        const result = SecurityValidator.validatePassword('Password123')
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('séquences')
      })

      it('devrait rejeter les caractères répétés', () => {
        const result = SecurityValidator.validatePassword('Passwordaaa')
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('répétés')
      })

      it('devrait valider un mot de passe complexe', () => {
        const result = SecurityValidator.validatePassword('C0mpl3xP@ss!')
        expect(result.isValid).toBe(true)
      })
    })

    describe('validateUsername', () => {
      it('devrait valider un nom d\'utilisateur correct', () => {
        const result = SecurityValidator.validateUsername('user123')
        expect(result.isValid).toBe(true)
      })

      it('devrait rejeter les caractères invalides', () => {
        const result = SecurityValidator.validateUsername('user@123')
        expect(result.isValid).toBe(false)
      })

      it('devrait respecter la longueur', () => {
        const result = SecurityValidator.validateUsername('ab')
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('3-20 caractères')
      })
    })

    describe('validateScenarioContent', () => {
      it('devrait valider un contenu approprié', () => {
        const content = 'Ce scénario décrit une situation professionnelle.'
        const result = SecurityValidator.validateScenarioContent(content)
        expect(result.isValid).toBe(true)
        expect(result.sanitized).toBe(content)
      })

      it('devrait rejeter un contenu trop court', () => {
        const result = SecurityValidator.validateScenarioContent('court')
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('10 mots')
      })

      it('devrait rejeter les mots inappropriés', () => {
        const result = SecurityValidator.validateScenarioContent('Ce scénario est un hack')
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('inappropriés')
      })
    })
  })

  describe('ValidationRateLimiter', () => {
    it('devrait autoriser les premières tentatives', () => {
      expect(ValidationRateLimiter.canAttempt('test')).toBe(true)
      expect(ValidationRateLimiter.canAttempt('test')).toBe(true)
    })

    it('devrait bloquer après trop de tentatives', () => {
      // Simuler 5 tentatives
      for (let i = 0; i < 5; i++) {
        ValidationRateLimiter.canAttempt('test')
      }

      expect(ValidationRateLimiter.canAttempt('test')).toBe(false)
    })

    it('devrait se réinitialiser', () => {
      // Remplir le limiteur
      for (let i = 0; i < 5; i++) {
        ValidationRateLimiter.canAttempt('test')
      }
      expect(ValidationRateLimiter.canAttempt('test')).toBe(false)

      // Réinitialiser
      ValidationRateLimiter.resetAttempts('test')
      expect(ValidationRateLimiter.canAttempt('test')).toBe(true)
    })

    it('devrait avoir des limites différentes par identifiant', () => {
      expect(ValidationRateLimiter.canAttempt('user1')).toBe(true)
      expect(ValidationRateLimiter.canAttempt('user2')).toBe(true)

      // Remplir pour user1 uniquement
      for (let i = 0; i < 5; i++) {
        ValidationRateLimiter.canAttempt('user1')
      }

      expect(ValidationRateLimiter.canAttempt('user1')).toBe(false)
      expect(ValidationRateLimiter.canAttempt('user2')).toBe(true)
    })
  })

  describe('validateInput function', () => {
    it('devrait gérer les valeurs requises', () => {
      const result = validateInput('email', '', { pattern: /^.$/, message: 'ignored', required: true })
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Ce champ est requis')
    })

    it('devrait gérer les règles personnalisées', () => {
      const customRule = {
        pattern: /^[A-Z]{3,5}$/,
        message: 'Doit contenir 3-5 lettres majuscules',
        maxLength: 5
      }

      const result = validateInput('custom', 'ABC', customRule)
      expect(result.isValid).toBe(true)
    })

    it('devrait trimmer les inputs', () => {
      const result = validateInput('name', '  test@example.com  ')
      expect(result.isValid).toBe(true)
      expect(result.sanitized).toBe('test@example.com')
    })
  })

  describe('Edge cases', () => {
    it('devrait gérer les valeurs nulles', () => {
      const result = validateInput('email', null as unknown as string)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Ce champ est requis')
    })

    it('devrait gérer les types non reconnus', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidType = 'unknown' as any as keyof typeof VALIDATION_PATTERNS
      const result = validateInput(invalidType, 'test')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Type de validation non reconnu')
    })

    it('devrait gérer les chaînes vides avec required=false', () => {
      const result = validateInput('name', '', { pattern: /^.$/, message: 'ignored', required: false })
      expect(result.isValid).toBe(true)
    })

    it('devrait gérer les inputs très longs', () => {
      const longInput = 'a'.repeat(2000)
      const result = validateInput('name', longInput)
      expect(result.sanitized?.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('Sécurité XSS', () => {
    it('devrait bloquer les tentatives d\'injection basiques', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        '"><script>alert(1)</script><div>',
        '<iframe src="javascript:alert(1)"></iframe>'
      ]

      xssAttempts.forEach(attempt => {
        const result = sanitizeHTML(attempt)
        expect(result).not.toContain('<script>')
        expect(result).not.toContain('javascript:')
        expect(result).not.toContain('onerror=')
        expect(result).not.toContain('onload=')
      })
    })

    it('devrait conserver le contenu safe', () => {
      const safeHTML = sanitizeHTML('<div class="content">Hello <strong>World</strong>!</div>')
      expect(safeHTML).toContain('Hello')
      expect(safeHTML).toContain('World')
    })
  })

  describe('Performance', () => {
    it('devrait traiter rapidement les validations simples', () => {
      const start = performance.now()

      for (let i = 0; i < 1000; i++) {
        validateInput('email', `test${i}@example.com`)
      }

      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // 100ms pour 1000 validations
    })

    it('devrait gérer efficacement la sanitization', () => {
      const start = performance.now()

      for (let i = 0; i < 100; i++) {
        sanitizeHTML(`<p>Test ${i}</p><script>alert(${i})</script>`)
      }

      const duration = performance.now() - start
      expect(duration).toBeLessThan(50) // 50ms pour 100 sanitizations
    })
  })
})
