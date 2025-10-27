import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScenarioCard } from '../ScenarioCard'
import type { Scenario } from '@/types/scenarios'

const mockScenario: Scenario = {
  id: '1',
  title: 'Entretien Technique React',
  description: 'Testez vos compétences React avancées',
  category: 'technical',
  difficulty: 'intermediate',
  duration: 30,
  language: 'fr',
  is_public: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

describe('ScenarioCard', () => {
  const mockOnStart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait afficher les informations du scénario', () => {
    render(<ScenarioCard scenario={mockScenario} onStart={mockOnStart} />)

    expect(screen.getByText('Entretien Technique React')).toBeInTheDocument()
    expect(screen.getByText('Testez vos compétences React avancées')).toBeInTheDocument()
    expect(screen.getByText('Technique')).toBeInTheDocument()
    expect(screen.getByText('Intermédiaire')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
  })

  it('devrait appeler onStart au clic sur le bouton', () => {
    render(<ScenarioCard scenario={mockScenario} onStart={mockOnStart} />)

    const startButton = screen.getByText('Commencer')
    fireEvent.click(startButton)

    expect(mockOnStart).toHaveBeenCalledWith(mockScenario)
    expect(mockOnStart).toHaveBeenCalledTimes(1)
  })

  it('devrait gérer les catégories avec traduction', () => {
    const scenarios = [
      { ...mockScenario, category: 'technical' as const },
      { ...mockScenario, category: 'commercial' as const },
      { ...mockScenario, category: 'presentation' as const },
      { ...mockScenario, category: 'communication' as const },
    ]

    const { rerender } = render(<ScenarioCard scenario={scenarios[0]} onStart={mockOnStart} />)
    expect(screen.getByText('Technique')).toBeInTheDocument()

    rerender(<ScenarioCard scenario={scenarios[1]} onStart={mockOnStart} />)
    expect(screen.getByText('Commercial')).toBeInTheDocument()

    rerender(<ScenarioCard scenario={scenarios[2]} onStart={mockOnStart} />)
    expect(screen.getByText('Présentation')).toBeInTheDocument()

    rerender(<ScenarioCard scenario={scenarios[3]} onStart={mockOnStart} />)
    expect(screen.getByText('Communication')).toBeInTheDocument()
  })

  it('devrait gérer les niveaux de difficulté avec traduction', () => {
    const scenarios = [
      { ...mockScenario, difficulty: 'beginner' as const },
      { ...mockScenario, difficulty: 'intermediate' as const },
      { ...mockScenario, difficulty: 'advanced' as const },
    ]

    const { rerender } = render(<ScenarioCard scenario={scenarios[0]} onStart={mockOnStart} />)
    expect(screen.getByText('Débutant')).toBeInTheDocument()

    rerender(<ScenarioCard scenario={scenarios[1]} onStart={mockOnStart} />)
    expect(screen.getByText('Intermédiaire')).toBeInTheDocument()

    rerender(<ScenarioCard scenario={scenarios[2]} onStart={mockOnStart} />)
    expect(screen.getByText('Avancé')).toBeInTheDocument()
  })

  it('devrait afficher la langue correctement', () => {
    const scenarios = [
      { ...mockScenario, language: 'fr' },
      { ...mockScenario, language: 'en' },
    ]

    const { rerender } = render(<ScenarioCard scenario={scenarios[0]} onStart={mockOnStart} />)
    expect(screen.getByText('FR')).toBeInTheDocument()

    rerender(<ScenarioCard scenario={scenarios[1]} onStart={mockOnStart} />)
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('devrait avoir les classes CSS appropriées', () => {
    render(<ScenarioCard scenario={mockScenario} onStart={mockOnStart} />)

    const card = screen.getByRole('article')
    expect(card).toHaveClass('bg-white', 'dark:bg-gray-800', 'rounded-lg', 'shadow-md')

    const button = screen.getByRole('button', { name: 'Commencer' })
    expect(button).toHaveClass('w-full', 'bg-orange-500', 'hover:bg-orange-600')
  })

  it('devrait être accessible', () => {
    render(<ScenarioCard scenario={mockScenario} onStart={mockOnStart} />)

    // Le bouton doit être focusable
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')

    // L'article doit avoir un role
    const card = screen.getByRole('article')
    expect(card).toBeInTheDocument()
  })

  it('devrait gérer les scénarios sans description', () => {
    const scenarioWithoutDesc = { ...mockScenario, description: '' }

    render(<ScenarioCard scenario={scenarioWithoutDesc} onStart={mockOnStart} />)

    const title = screen.getByText('Entretien Technique React')
    expect(title).toBeInTheDocument()
  })

  it('devrait afficher les bonnes icônes pour chaque catégorie', () => {
    render(<ScenarioCard scenario={mockScenario} onStart={mockOnStart} />)

    // Les icônes sont des SVG de Lucide React
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('devrait gérer le hover state', () => {
    render(<ScenarioCard scenario={mockScenario} onStart={mockOnStart} />)

    const card = screen.getByRole('article')

    // Vérifier que les classes hover sont présentes
    expect(card).toHaveClass('hover:shadow-lg', 'transition-shadow')
  })
})