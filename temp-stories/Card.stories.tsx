// 📖 Stories pour le composant Card - Design System Documentation
import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardMedia } from './Card'

// 🎨 Métadonnées du composant
const meta: Meta<typeof Card> = {
  title: 'Design System/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Le composant Card est un conteneur polyvalent du design system CandiVoc.
Il peut être utilisé pour afficher du contenu structuré avec différentes variantes visuelles.

## Caractéristiques principales
- **Variants multiples**: default, elevated, outlined, ghost, gradient, glass
- **Composition flexible**: header, content, footer, media
- **Tailles adaptatives**: sm, md, lg, xl
- **États interactifs**: hover effects
- **Thématisation**: support des thèmes light/dark
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      description: 'Variante visuelle de la carte',
      options: ['default', 'elevated', 'outlined', 'ghost', 'gradient', 'glass', 'dark', 'success', 'warning', 'error']
    },
    size: {
      control: 'select',
      description: 'Taille de la carte',
      options: ['sm', 'md', 'lg', 'xl']
    },
    hover: {
      control: 'boolean',
      description: 'Effet au survol'
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof Card>

// 🎯 Story par défaut
export const Default: Story = {
  args: {
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Carte par défaut</h3>
        <p className="text-gray-600">Une carte simple avec du contenu textuel.</p>
      </div>
    )
  }
}

// 🎨 Stories des variants
export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Carte surélevée</h3>
        <p className="text-gray-600">Avec une ombre prononcée pour un effet de profondeur.</p>
      </div>
    )
  }
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Carte outlined</h3>
        <p className="text-gray-600">Avec une bordure épaisse et aucun fond.</p>
      </div>
    )
  }
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Carte fantôme</h3>
        <p className="text-gray-600">Sans bordure ni fond, complètement transparente.</p>
      </div>
    )
  }
}

export const Gradient: Story = {
  args: {
    variant: 'gradient',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 text-white">Carte dégradée</h3>
        <p className="text-white/90">Avec un magnifique dégradé de fond.</p>
      </div>
    )
  }
}

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 text-white">Carte glass</h3>
        <p className="text-white/90">Effet glass morphisme avec transparence.</p>
      </div>
    )
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f172a' },
        { name: 'light', value: '#ffffff' },
      ],
    }
  }
}

// 📏 Stories des tailles
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Card size="sm">
        <div className="p-4">
          <h4 className="font-semibold">Petite</h4>
          <p className="text-sm text-gray-600">Compacte</p>
        </div>
      </Card>
      <Card size="md">
        <div className="p-6">
          <h4 className="font-semibold">Moyenne</h4>
          <p className="text-gray-600">Standard</p>
        </div>
      </Card>
      <Card size="lg">
        <div className="p-8">
          <h4 className="font-semibold">Grande</h4>
          <p className="text-gray-600">Spacieuse</p>
        </div>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Les différentes tailles de cartes disponibles'
      }
    }
  }
}

// 🎯 Cartes composées
export const WithHeader: Story = {
  render: () => (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Profil utilisateur</CardTitle>
        <CardDescription>
          Informations personnelles et préférences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <span className="font-medium">Email:</span>
            <span className="ml-2 text-gray-600">john.doe@example.com</span>
          </div>
          <div>
            <span className="font-medium">Rôle:</span>
            <span className="ml-2 text-gray-600">Administrateur</span>
          </div>
          <div>
            <span className="font-medium">Inscrit depuis:</span>
            <span className="ml-2 text-gray-600">Janvier 2024</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carte avec header structuré'
      }
    }
  }
}

export const WithFooter: Story = {
  render: () => (
    <Card variant="elevated">
      <CardContent>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Statistiques du mois</h3>
          <p className="text-gray-600 mb-4">
            Vos performances ce mois-ci sont excellentes !
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">142</div>
              <div className="text-sm text-gray-500">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">89%</div>
              <div className="text-sm text-gray-500">Réussite</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          <button className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Exporter
          </button>
          <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Voir détails
          </button>
        </div>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carte avec footer et actions'
      }
    }
  }
}

export const WithMedia: Story = {
  render: () => (
    <Card variant="elevated" className="max-w-sm">
      <CardMedia aspectRatio="16/9">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop"
          alt="Montagne enneigée"
          className="w-full h-full object-cover"
        />
      </CardMedia>
      <CardContent>
        <CardTitle>Randonnée en montagne</CardTitle>
        <CardDescription className="mt-2">
          Une journée inoubliable dans les Alpes suisses avec des vues spectaculaires.
        </CardDescription>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span>⛰️ 2,850m</span>
          <span>🥾 12km</span>
          <span>⏱️ 4h</span>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carte avec image et médias'
      }
    }
  }
}

// 🎨 Cartes thématiques
export const SuccessCard: Story = {
  render: () => (
    <Card variant="success">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-success-900">Succès !</h3>
            <p className="text-success-700">Votre action a été complétée avec succès.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carte de notification de succès'
      }
    }
  }
}

export const WarningCard: Story = {
  render: () => (
    <Card variant="warning">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-warning-900">Attention</h3>
            <p className="text-warning-700">Veuillez vérifier ces informations avant de continuer.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carte d\'avertissement'
      }
    }
  }
}

export const ErrorCard: Story = {
  render: () => (
    <Card variant="error">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-error-900">Erreur</h3>
            <p className="text-error-700">Une erreur est survenue. Veuillez réessayer.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carte d\'erreur'
      }
    }
  }
}

// 📊 Grille de cartes
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card variant="elevated" hover>
        <CardHeader>
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            Vue d'ensemble de vos performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-sm text-gray-600">Utilisateurs actifs</p>
        </CardContent>
      </Card>

      <Card variant="elevated" hover>
        <CardHeader>
          <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <CardTitle>Revenus</CardTitle>
          <CardDescription>
            Recettes mensuelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€12,450</div>
          <p className="text-sm text-gray-600">+15% ce mois</p>
        </CardContent>
      </Card>

      <Card variant="elevated" hover>
        <CardHeader>
          <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <CardTitle>Performance</CardTitle>
          <CardDescription>
            Temps de réponse moyen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">142ms</div>
          <p className="text-sm text-gray-600">Excellent</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grille de cartes pour les dashboards'
      }
    }
  }
}