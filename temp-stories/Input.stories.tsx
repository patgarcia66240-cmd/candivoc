// 📖 Stories pour le composant Input - Design System Documentation
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

// 🎨 Métadonnées du composant
const meta: Meta<typeof Input> = {
  title: 'Design System/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Le composant Input est un champ de saisie polyvalent du design system CandiVoc.
Il supporte plusieurs variants, tailles et états pour s'adapter à tous les besoins de saisie.

## Caractéristiques principales
- **Variants multiples**: default, filled, outlined, underlined, ghost
- **États de validation**: success, warning, error
- **Support d'icônes**: gauche et droite
- **Indicateur de chargement**
- **Accessibilité**: labels, erreurs, helpertext
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      description: 'Variante visuelle du champ',
      options: ['default', 'filled', 'outlined', 'underlined', 'ghost', 'success', 'warning', 'error']
    },
    size: {
      control: 'select',
      description: 'Taille du champ',
      options: ['sm', 'md', 'lg', 'xl']
    },
    label: {
      control: 'text',
      description: 'Étiquette du champ'
    },
    placeholder: {
      control: 'text',
      description: 'Texte de substitution'
    },
    error: {
      control: 'text',
      description: 'Message d\'erreur'
    },
    helperText: {
      control: 'text',
      description: 'Texte d\'aide'
    },
    disabled: {
      control: 'boolean',
      description: 'Désactive le champ'
    },
    loading: {
      control: 'boolean',
      description: 'Affiche un indicateur de chargement'
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// 🎯 Story par défaut
export const Default: Story = {
  args: {
    placeholder: 'Entrez votre texte ici'
  }
}

// 🏷️ Stories avec labels
export const WithLabel: Story = {
  args: {
    label: 'Nom complet',
    placeholder: 'John Doe'
  }
}

export const WithHelperText: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
    helperText: 'Nous ne partagerons jamais votre email avec des tiers.'
  }
}

export const WithError: Story = {
  args: {
    label: 'Mot de passe',
    type: 'password',
    placeholder: '••••••••',
    error: 'Le mot de passe doit contenir au moins 8 caractères.'
  }
}

// 🎨 Stories des variants
export const Filled: Story = {
  args: {
    variant: 'filled',
    label: 'Prénom',
    placeholder: 'Entrez votre prénom'
  }
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    label: 'Nom de famille',
    placeholder: 'Entrez votre nom'
  }
}

export const Underlined: Story = {
  args: {
    variant: 'underlined',
    label: 'Site web',
    type: 'url',
    placeholder: 'https://example.com'
  }
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    label: 'Notes',
    placeholder: 'Ajoutez vos notes ici...'
  }
}

export const Success: Story = {
  args: {
    variant: 'success',
    label: 'Code promo',
    placeholder: 'PROMO2024',
    helperText: 'Code promo valide ! -10% appliqué'
  }
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    label: 'Date de fin',
    type: 'date',
    helperText: 'La date approche, planifiez en conséquence'
  }
}

// 📏 Stories des tailles
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input size="sm" label="Petit" placeholder="Petit champ" />
      <Input size="md" label="Moyen" placeholder="Champ moyen" />
      <Input size="lg" label="Grand" placeholder="Grand champ" />
      <Input size="xl" label="Très grand" placeholder="Très grand champ" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Les différentes tailles de champs disponibles'
      }
    }
  }
}

// 🔄 États spéciaux
export const Disabled: Story = {
  args: {
    label: 'Champ désactivé',
    placeholder: 'Non modifiable',
    disabled: true
  }
}

export const Loading: Story = {
  args: {
    label: 'Recherche',
    placeholder: 'Recherche en cours...',
    loading: true
  }
}

// 🎯 Champs avec icônes
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input
        label="Email"
        type="email"
        placeholder="john@example.com"
        startIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />
      <Input
        label="Recherche"
        placeholder="Rechercher..."
        startIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        endIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
      />
      <Input
        label="Mot de passe"
        type="password"
        placeholder="••••••••"
        startIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
        endIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Champs avec icônes décoratives ou fonctionnelles'
      }
    }
  }
}

// 🎯 Types de champs
export const InputTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input label="Texte" placeholder="Texte simple" />
      <Input label="Email" type="email" placeholder="email@example.com" />
      <Input label="Mot de passe" type="password" placeholder="••••••••" />
      <Input label="Nombre" type="number" placeholder="42" />
      <Input label="Téléphone" type="tel" placeholder="+33 6 12 34 56 78" />
      <Input label="URL" type="url" placeholder="https://example.com" />
      <Input label="Date" type="date" />
      <Input label="Heure" type="time" />
      <Input label="Recherche" type="search" placeholder="Rechercher..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Différents types de champs de saisie HTML5'
      }
    }
  }
}

// 📊 Formulaire complet
export const FormExample: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <div className="space-y-4">
        <Input
          label="Nom complet"
          placeholder="John Doe"
          helperText="Votre nom tel qu'il apparaît sur vos documents"
        />
        <Input
          label="Email professionnel"
          type="email"
          placeholder="john@company.com"
          helperText="Utilisé pour les communications importantes"
        />
        <Input
          label="Téléphone"
          type="tel"
          placeholder="+33 6 12 34 56 78"
          helperText="Format international recommandé"
        />
        <Input
          label="Site web"
          type="url"
          placeholder="https://example.com"
          helperText="Optionnel"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemple de formulaire complet utilisant différents types de champs'
      }
    }
  }
}