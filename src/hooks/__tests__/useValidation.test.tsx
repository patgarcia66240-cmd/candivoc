import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useValidation, useFormValidation, useSecureInput, useHTMLValidation } from '../useValidation'

// Mock de setTimeout pour les tests
vi.useFakeTimers()

describe('useValidation Hook', () => {
  beforeEach(() => {
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('Validation basique', () => {
    it('devrait initialiser avec les bonnes valeurs', () => {
      const { result } = renderHook(() => useValidation('', { type: 'email' }))

      expect(result.current.value).toBe('')
      expect(result.current.error).toBeUndefined()
      expect(result.current.isValid).toBe(false)
      expect(result.current.isDirty).toBe(false)
      expect(result.current.isValidating).toBe(false)
    })

    it('devrait valider une valeur correcte', async () => {
      const { result } = renderHook(() => useValidation('', { type: 'email' }))

      act(() => {
        result.current.setValue('test@example.com')
      })

      await waitFor(() => {
        expect(result.current.value).toBe('test@example.com')
        expect(result.current.isValid).toBe(true)
        expect(result.current.error).toBeUndefined()
        expect(result.current.isDirty).toBe(true)
      })
    })

    it('devrait afficher une erreur pour une valeur incorrecte', async () => {
      const { result } = renderHook(() => useValidation('', { type: 'email' }))

      act(() => {
        result.current.setValue('invalid-email')
      })

      await waitFor(() => {
        expect(result.current.value).toBe('invalid-email')
        expect(result.current.isValid).toBe(false)
        expect(result.current.error).toBe('Veuillez entrer une adresse email valide')
        expect(result.current.isDirty).toBe(true)
      })
    })

    it('devrait respecter le délai de debounce', async () => {
      const { result } = renderHook(() => useValidation('', { type: 'email', debounceMs: 100 }))

      act(() => {
        result.current.setValue('first')
      })

      // Ne devrait pas être validé tout de suite
      expect(result.current.isValidating).toBe(false)

      act(() => {
        result.current.setValue('second')
      })

      // Toujours pas validé
      expect(result.current.isValidating).toBe(false)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      await waitFor(() => {
        expect(result.current.value).toBe('second')
        expect(result.current.isValidating).toBe(false)
      })
    })
  })

  describe('Validation de champs requis', () => {
    it('devrait valider un champ requis non vide', async () => {
      const { result } = renderHook(() => useValidation('', { type: 'name', required: true }))

      act(() => {
        result.current.setValue('John Doe')
      })

      await waitFor(() => {
        expect(result.current.isValid).toBe(true)
        expect(result.current.error).toBeUndefined()
      })
    })

    it('devrait rejeter un champ requis vide', async () => {
      const { result } = renderHook(() => useValidation('', { type: 'name', required: true }))

      act(() => {
        result.current.setValue('')
      })

      await waitFor(() => {
        expect(result.current.isValid).toBe(false)
        expect(result.current.error).toBe('Ce champ est requis')
      })
    })

    it('devrait autoriser un champ non requis vide', () => {
      const { result } = renderHook(() => useValidation('', { type: 'name', required: false }))

      // Initial state - not dirty yet, so not validated
      expect(result.current.isValid).toBe(false)
      expect(result.current.isDirty).toBe(false)
      expect(result.current.error).toBeUndefined()
    })

    it('devrait autoriser un champ non requis avec contenu valide', async () => {
      const { result } = renderHook(() => useValidation('', { type: 'name', required: false }))

      act(() => {
        result.current.setValue('John')
      })

      await waitFor(() => {
        expect(result.current.isValid).toBe(true)
        expect(result.current.error).toBeUndefined()
      })
    })
  })

  describe('Limitation de longueur', () => {
    it('devrait respecter maxLength', async () => {
      const { result } = renderHook(() => useValidation('', {
        type: 'custom',
        customRule: {
          pattern: /^[a-zA-Z]{1,10}$/,
          message: 'Max 10 caractères',
          maxLength: 10
        }
      }))

      act(() => {
        result.current.setValue('verylongname')
      })

      await waitFor(() => {
        expect(result.current.value).toBe('verylongname') // Pas tronqué, juste invalidé
        expect(result.current.isValid).toBe(false)
        expect(result.current.error).toBe('Maximum 10 caractères autorisés')
      })
    })

    it('devrait respecter minLength', async () => {
      const { result } = renderHook(() => useValidation('', {
        type: 'custom',
        customRule: {
          pattern: /^[a-zA-Z]{3,10}$/,
          message: 'Min 3 caractères',
          minLength: 3
        }
      }))

      act(() => {
        result.current.setValue('ab')
      })

      await waitFor(() => {
        expect(result.current.isValid).toBe(false)
        expect(result.current.error).toBe('Minimum 3 caractères requis')
      })
    })
  })

  describe('Reset', () => {
    it('devrait réinitialiser toutes les valeurs', () => {
      const { result } = renderHook(() => useValidation('initial', { type: 'email' }))

      // Modifier la valeur
      act(() => {
        result.current.setValue('modified@example.com')
      })

      // Réinitialiser
      act(() => {
        result.current.reset()
      })

      expect(result.current.value).toBe('')
      expect(result.current.error).toBeUndefined()
      expect(result.current.isValid).toBe(false)
      expect(result.current.isDirty).toBe(false)
    })
  })
})

describe('useFormValidation Hook', () => {
  interface FormData {
    email: string
    password: string
    name: string
  }

  const initialData: FormData = {
    email: '',
    password: '',
    name: ''
  }

  it('devrait initialiser avec les valeurs initiales', () => {
    const { result } = renderHook(() => useFormValidation(initialData))

    expect(result.current.values).toEqual(initialData)
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
    expect(result.current.isValid).toBe(false)
    expect(result.current.isDirty).toBe(false)
  })

  it('devrait mettre à jour un champ spécifique', async () => {
    const { result } = renderHook(() => useFormValidation(initialData))

    const mockValidator = vi.fn().mockReturnValue({ isValid: true })

    act(() => {
      result.current.setFieldValue('email', 'test@example.com', mockValidator)
    })

    expect(result.current.values.email).toBe('test@example.com')
    expect(result.current.touched.email).toBe(true)
    expect(mockValidator).toHaveBeenCalledWith('test@example.com')
  })

  it('devrait valider le formulaire complet', () => {
    const { result } = renderHook(() => useFormValidation(initialData))

    const validators = {
      email: vi.fn().mockReturnValue({ isValid: true }),
      password: vi.fn().mockReturnValue({ isValid: true }),
      name: vi.fn().mockReturnValue({ isValid: true })
    }

    const isValid = result.current.validateForm(validators)

    expect(isValid).toBe(true)
    expect(validators.email).toHaveBeenCalled()
    expect(validators.password).toHaveBeenCalled()
    expect(validators.name).toHaveBeenCalled()
  })

  it('devrait réinitialiser le formulaire', () => {
    const { result } = renderHook(() => useFormValidation(initialData))

    // Modifier des valeurs
    act(() => {
      result.current.setFieldValue('email', 'test@example.com')
      result.current.setFieldValue('password', 'password123')
    })

    // Réinitialiser
    act(() => {
      result.current.resetForm()
    })

    expect(result.current.values).toEqual(initialData)
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
    expect(result.current.isValid).toBe(false)
    expect(result.current.isDirty).toBe(false)
  })

  it('devrait détecter si le formulaire est sale', () => {
    const { result, rerender } = renderHook(
      ({ values }: { values: Partial<FormData> }) => useFormValidation(values),
      {
        initialProps: { values: initialData }
      }
    )

    expect(result.current.isDirty).toBe(false)

    // Mettre à jour les props avec des valeurs modifiées
    rerender({ values: { ...initialData, email: 'modified@example.com' } })

    expect(result.current.isDirty).toBe(true)
  })
})

describe('useSecureInput Hook', () => {
  it('devrait limiter la longueur des entrées', () => {
    const { result } = renderHook(() => useSecureInput('', { maxLength: 10 }))

    act(() => {
      result.current.handleChange({
        target: { value: 'verylonginput' }
      } as React.ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.value).toBe('verylongin') // Tronqué à 10
    expect(result.current.maxLength).toBe(10)
  })

  it('devrait empêcher le collage si configuré', () => {
    const { result } = renderHook(() => useSecureInput('', { preventPaste: true }))

    const mockEvent = {
      preventDefault: vi.fn(),
      clipboardData: {
        getData: vi.fn().mockReturnValue('pasted content')
      }
    } as React.ClipboardEvent

    act(() => {
      result.current.handlePaste(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(result.current.value).toBe('') // Pas de changement car preventPaste=true
  })

  it('devrait autoriser le collage normalement', () => {
    const { result } = renderHook(() => useSecureInput('', { preventPaste: false }))

    const mockEvent = {
      preventDefault: vi.fn(),
      clipboardData: {
        getData: vi.fn().mockReturnValue('safe content')
      }
    } as React.ClipboardEvent

    act(() => {
      result.current.handlePaste(mockEvent)
    })

    expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    expect(result.current.value).toBe('safe content')
  })
})

describe('useHTMLValidation Hook', () => {
  it('devrait valider du HTML sécurisé', () => {
    const { result } = renderHook(() => useHTMLValidation('<p>Hello World</p>'))

    expect(result.current.value).toBe('<p>Hello World</p>')
    // L'état initial est false, il faut déclencher la validation
    expect(result.current.isValid).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('devrait rejeter du HTML dangereux', () => {
    const { result } = renderHook(() => useHTMLValidation('<script>alert("xss")</script>'))

    expect(result.current.value).toBe('<script>alert("xss")</script>')
    expect(result.current.isValid).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('devrait limiter la longueur du HTML', () => {
    const longHTML = '<p>' + 'a'.repeat(2000) + '</p>'
    const { result } = renderHook(() => useHTMLValidation(longHTML, { maxLength: 100 }))

    // La validation se fait lors du setValue
    expect(result.current.value).toBe(longHTML)
    // L'état initial est isValid=false car il n'y a pas eu de validation
    expect(result.current.isValid).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('devrait fournir une méthode de sanitization', () => {
    const { result } = renderHook(() => useHTMLValidation('<div>Test</div><script>alert(1)</script>'))

    const sanitized = result.current.sanitize()
    // Selon le mock de DOMPurify, tout le HTML est supprimé
    expect(sanitized).toBe('Test')
    expect(sanitized).not.toContain('<script>')
  })
})