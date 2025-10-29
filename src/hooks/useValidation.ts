import { useState, useCallback, useEffect } from 'react'
import { validateInput, sanitizeInput, sanitizeHTML, ValidationRateLimiter, ValidationResult, VALIDATION_PATTERNS } from '@/security/validation'

// 🎯 Hook de validation sécurisée
interface UseValidationOptions {
  type?: keyof typeof VALIDATION_PATTERNS | 'custom'
  customRule?: {
    pattern: RegExp;
    message: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  }
  required?: boolean
  debounceMs?: number
  sanitize?: boolean
  rateLimit?: {
    maxAttempts: number;
    windowMs: number;
  }
}

interface UseValidationReturn {
  value: string
  setValue: (value: string) => void
  error: string | undefined
  isValid: boolean
  isDirty: boolean
  isValidating: boolean
  rateLimited: boolean
  reset: () => void
  validate: () => ValidationResult
}

export function useValidation(
  initialValue: string = '',
  options: UseValidationOptions = {}
): UseValidationReturn {
  const {
    type,
    customRule,
    required = false,
    debounceMs = 300,
    sanitize = true,
    rateLimit
  } = options

  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | undefined>()
  const [isValid, setIsValid] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)

  // 🔄 Fonction de validation
  const validate = useCallback((): ValidationResult => {
    setIsValidating(true)

    try {
      // Rate limiting
      if (rateLimit) {
        const canAttempt = ValidationRateLimiter.canAttempt(
          'validation',
          rateLimit.maxAttempts,
          rateLimit.windowMs
        )

        if (!canAttempt) {
          setRateLimited(true)
          setTimeout(() => setRateLimited(false), rateLimit.windowMs)
          return { isValid: false, error: 'Trop de tentatives. Veuillez réessayer plus tard.' }
        }
      }

      // Validation requise
      if (required && (!value || value.trim() === '')) {
        const result = { isValid: false, error: 'Ce champ est requis' }
        setError(result.error)
        setIsValid(false)
        setIsValidating(false)
        return result
      }

      // Si non requis et vide, c'est valide
      if (!required && (!value || value.trim() === '')) {
        const result = { isValid: true, sanitized: '' }
        setError(undefined)
        setIsValid(true)
        setIsValidating(false)
        return result
      }

      // Validation principale
      const result = type === 'custom' && customRule
        ? validateInput('custom', value, customRule)
        : type
          ? validateInput(type, value)
          : { isValid: true, sanitized: sanitize ? sanitizeInput(value) : value }

      setError(result.error)
      setIsValid(result.isValid)
      setIsValidating(false)
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de validation'
      setError(errorMessage)
      setIsValid(false)
      setIsValidating(false)
      return { isValid: false, error: errorMessage }
    }
  }, [value, type, customRule, required, sanitize, rateLimit])

  // 🔄 Validation avec debounce
  useEffect(() => {
    if (!isDirty) return

    const timeoutId = setTimeout(() => {
      validate()
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [value, isDirty, debounceMs, validate])

  // 🔄 Setter avec validation
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue)
    setIsDirty(true)
    setRateLimited(false)
  }, [])

  // 🔄 Reset
  const reset = useCallback(() => {
    setValue('')
    setError(undefined)
    setIsValid(false)
    setIsDirty(false)
    setRateLimited(false)
    ValidationRateLimiter.resetAttempts('validation')
  }, [])

  return {
    value,
    setValue: handleChange,
    error,
    isValid,
    isDirty,
    isValidating,
    rateLimited,
    reset,
    validate
  }
}

// 🎯 Hook de validation de formulaire multiple
interface UseFormValidationOptions {
  debounceMs?: number
  validateOnChange?: boolean
}

export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  options: UseFormValidationOptions = {}
) {
  const { validateOnChange = true } = options
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isValid, setIsValid] = useState(false)

  // 🔄 Mise à jour d'un champ
  const setFieldValue = useCallback(<K extends keyof T>(
    field: K,
    value: T[K],
    validator?: (value: T[K]) => ValidationResult
  ) => {
    setValues(prev => ({ ...prev, [field]: value }))

    if (validateOnChange) {
      setTouched(prev => ({ ...prev, [field]: true }))

      if (validator) {
        const result = validator(value)
        setErrors(prev => ({
          ...prev,
          [field]: result.isValid ? undefined : result.error
        }))
      }
    }
  }, [validateOnChange])

  // 🔄 Validation du formulaire complet
  const validateForm = useCallback((
    validators?: Partial<Record<keyof T, (value: T[keyof T]) => ValidationResult>>
  ): boolean => {
    let formIsValid = true
    const newErrors: Partial<Record<keyof T, string>> = {}

    Object.keys(values).forEach((field) => {
      const key = field as keyof T
      const validator = validators?.[key]

      if (validator) {
        const result = validator(values[key])
        if (!result.isValid) {
          newErrors[key] = result.error || 'Champ invalide'
          formIsValid = false
        }
      }
    })

    setErrors(newErrors)
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    setIsValid(formIsValid)

    return formIsValid
  }, [values])

  // 🔄 Reset du formulaire
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsValid(false)
  }, [initialValues])

  // 🔄 Vérification si le formulaire est sale
  const isDirty = Object.keys(values).some(key => values[key as keyof T] !== initialValues[key as keyof T])

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setFieldValue,
    validateForm,
    resetForm,
    setIsValid
  }
}

// 🎯 Hook de validation sécurisée pour les inputs HTML
export function useSecureInput<T = string>(
  initialValue: T = '' as T,
  options: UseValidationOptions & {
    maxLength?: number;
    preventPaste?: boolean;
  } = {}
) {
  const { maxLength, preventPaste = false, ...validationOptions } = options
  const validation = useValidation(initialValue as string, validationOptions)

  // 🔄 Handler pour le changement avec limitation de longueur
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value

    // Limiter la longueur
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength)
    }

    validation.setValue(newValue)
  }, [maxLength, validation])

  // 🔄 Handler pour le coller (optionnel)
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (preventPaste) {
      e.preventDefault()
      return
    }

    const pastedText = e.clipboardData.getData('text')
    const sanitized = sanitizeInput(pastedText)

    if (maxLength && sanitized.length > maxLength) {
      validation.setValue(sanitized.substring(0, maxLength))
    } else {
      validation.setValue(sanitized)
    }
  }, [preventPaste, maxLength, validation])

  return {
    ...validation,
    handleChange,
    handlePaste,
    maxLength
  }
}

// 🎯 Hook de validation HTML pour le contenu riche
export function useHTMLValidation(initialValue: string = '', options: {
  allowedTags?: string[];
  maxLength?: number;
  sanitize?: boolean;
} = {}) {
  const {  maxLength = 1000, sanitize = true } = options
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | undefined>()
  const [isValid, setIsValid] = useState(false)

  // 🔄 Validation HTML
  const validateHTML = useCallback((html: string): ValidationResult => {
    try {
      // Vérification de la longueur
      if (html.length > maxLength) {
        return {
          isValid: false,
          error: `Le contenu ne doit pas dépasser ${maxLength} caractères`
        }
      }

      // Sanitization HTML
      const sanitized = sanitize ? sanitizeHTML(html) : html

      // Vérification du contenu après sanitization
      if (sanitize && sanitized.length === 0 && html.length > 0) {
        return {
          isValid: false,
          error: 'Le contenu contient des éléments non autorisés'
        }
      }

      return {
        isValid: true,
        sanitized
      }
    } catch {
      return {
        isValid: false,
        error: 'Erreur lors de la validation du contenu'
      }
    }
  }, [maxLength, sanitize])

  // 🔄 Handler pour le changement
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue)

    const result = validateHTML(newValue)
    setError(result.error)
    setIsValid(result.isValid)
  }, [validateHTML])

  return {
    value,
    setValue: handleChange,
    error,
    isValid,
    sanitize: () => sanitizeHTML(value)
  }
}

export default {
  useValidation,
  useFormValidation,
  useSecureInput,
  useHTMLValidation
}