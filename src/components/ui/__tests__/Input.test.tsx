import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait rendre un input avec les props de base', () => {
    render(<Input value="" onChange={mockOnChange} placeholder="Test placeholder" />)

    const input = screen.getByPlaceholderText('Test placeholder')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('devrait appeler onChange lors de la saisie', async () => {
    const user = userEvent.setup()
    render(<Input value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'test value')

    expect(mockOnChange).toHaveBeenCalledTimes(10) // 10 caractères
  })

  it('devrait gérer la valeur contrôlée', () => {
    render(<Input value="controlled" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('controlled')
  })

  it('devrait supporter les différents types d\'input', () => {
    const { rerender } = render(<Input value="" onChange={mockOnChange} type="text" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')

    rerender(<Input value="" onChange={mockOnChange} type="email" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'email')

    rerender(<Input value="" onChange={mockOnChange} type="password" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')
  })

  it('devrait afficher un label quand fourni', () => {
    render(<Input value="" onChange={mockOnChange} label="Test Label" />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('devrait afficher un message d\'erreur', () => {
    render(<Input value="" onChange={mockOnChange} error="This field is required" />)

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('devrait appliquer les classes CSS personnalisées', () => {
    render(<Input value="" onChange={mockOnChange} className="custom-class" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('devrait être désactivé quand la prop disabled est true', () => {
    render(<Input value="" onChange={mockOnChange} disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('devrait gérer le focus', async () => {
    const user = userEvent.setup()
    render(<Input value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    await user.click(input)

    expect(input).toHaveFocus()
  })

  it('devrait afficher un placeholder quand fourni', () => {
    render(<Input value="" onChange={mockOnChange} placeholder="Enter text here" />)

    const input = screen.getByPlaceholderText('Enter text here')
    expect(input).toBeInTheDocument()
  })

  it('devrait supporter les variantes de style', () => {
    const { unmount } = render(<Input value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border', 'border-secondary-300')

    unmount()
    render(<Input value="" onChange={mockOnChange} error="Error message" />)
    const errorInput = screen.getByRole('textbox')
    expect(errorInput).toHaveClass('border-error-500')
  })

  it('devrait être accessible', () => {
    render(<Input value="" onChange={mockOnChange} label="Accessible input" />)

    const input = screen.getByRole('textbox')
    const label = screen.getByText('Accessible input')

    // Le label doit être présent et l'input doit être accessible
    expect(label).toBeInTheDocument()
    expect(input).toBeInTheDocument()
  })

  it('devrait gérer les attributs aria', () => {
    render(<Input value="" onChange={mockOnChange} aria-label="Custom label" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-label', 'Custom label')
  })

  it('devrait gérer les événements clavier', async () => {
    const mockOnKeyDown = vi.fn()
    const user = userEvent.setup()

    render(<Input value="" onChange={mockOnChange} onKeyDown={mockOnKeyDown} />)

    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockOnKeyDown).toHaveBeenCalled()
  })

  it('devrait supporter le mode lecture seule', () => {
    render(<Input value="readonly value" onChange={mockOnChange} readOnly />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readOnly')
  })

  it('devrait avoir les classes CSS par défaut', () => {
    render(<Input value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('w-full', 'px-3', 'py-2', 'rounded-lg')
  })
})