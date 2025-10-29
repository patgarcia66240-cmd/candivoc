// 📖 Stories pour le composant Button - Design System Documentation
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

// 🎨 Métadonnées du composant
const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Le composant Button est le bouton principal du design system CandiVoc.
Il supporte plusieurs variants, tailles et états pour s'adapter à tous les cas d'usage.

## Caractéristiques principales
- **Variants multiples**: primary, secondary, outline, ghost, gradient, etc.
- **Tailles responsives**: xs, sm, md, lg, xl
- **États interactifs**: loading, disabled, hover, focus
- **Accessibilité**: respect des standards WCAG
- **Thématisation**: support des thèmes light/dark
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      description: 'Variante visuelle du bouton',
      options: [
        'primary', 'secondary', 'outline', 'ghost', 'gray', 'gradient',
        'default', 'destructive', 'success', 'warning', 'link', 'glass'
      ]
    },
    size: {
      control: 'select',
      description: 'Taille du bouton',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'icon']
    },
    children: {
      control: 'text',
      description: 'Contenu du bouton'
    },
    disabled: {
      control: 'boolean',
      description: 'Désactive le bouton'
    },
    loading: {
      control: 'boolean',
      description: 'Affiche un indicateur de chargement'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Bouton sur toute la largeur'
    },
    leftIcon: {
      control: { type: 'object', disable: true },
      description: 'Icône à gauche'
    },
    rightIcon: {
      control: { type: 'object', disable: true },
      description: 'Icône à droite'
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// 🎯 Story par défaut
export const Default: Story = {
  args: {
    children: 'Bouton par défaut'
  }
}

// 🎨 Stories des variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Bouton primaire'
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Bouton secondaire'
  }
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Bouton outline'
  }
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Bouton fantôme'
  }
}

export const Gradient: Story = {
  args: {
    variant: 'gradient',
    children: 'Bouton dégradé'
  }
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Action réussie'
  }
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Attention'
  }
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Supprimer'
  }
}

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: 'Effet glass'
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
    <div className="flex items-center gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Les différentes tailles de boutons disponibles'
      }
    }
  }
}

// 🔄 États spéciaux
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Chargement...'
  }
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Désactivé'
  }
}

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Bouton pleine largeur'
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    )
  ]
}

// 🎯 Boutons avec icônes
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Ajouter
        </Button>
        <Button
          rightIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        >
          Suivant
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
            </svg>
          }
        >
          Télécharger
        </Button>
        <Button
          variant="outline"
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          }
        >
          Paramètres
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Boutons avec icônes à gauche ou à droite'
      }
    }
  }
}

// 🎨 Boutons icônes seulement
export const IconButtons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="icon" variant="outline">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </Button>
      <Button size="icon">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </Button>
      <Button size="icon" variant="destructive">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Boutons icônes compacts'
      }
    }
  }
}

// 🎯 Groupes de boutons
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        <Button variant="outline" className="rounded-r-none border-r-0">
          Précédent
        </Button>
        <Button variant="outline" className="rounded-none border-r-0">
          1
        </Button>
        <Button variant="outline" className="rounded-none">
          2
        </Button>
        <Button className="rounded-l-none">
          Suivant
        </Button>
      </div>
      <div className="flex gap-2">
        <Button>Annuler</Button>
        <Button variant="primary">Confirmer</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Groupes de boutons pour les actions multiples'
      }
    }
  }
}