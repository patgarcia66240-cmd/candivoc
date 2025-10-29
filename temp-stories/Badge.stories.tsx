// 📖 Stories pour le composant Badge - Design System Documentation
import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { Badge, StatusBadge, CounterBadge } from './Badge'

// 🎨 Métadonnées du composant
const meta: Meta<typeof Badge> = {
  title: 'Design System/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Le composant Badge est un indicateur visuel compact du design system CandiVoc.
Il est parfait pour afficher des états, des catégories ou des compteurs.

## Caractéristiques principales
- **Variants multiples**: default, secondary, success, warning, error, outline, ghost
- **Tailles adaptatives**: xs, sm, md, lg, xl
- **Support d'icônes**: dots et icônes personnalisées
- **Actions amovibles**: avec bouton de suppression
- **Cas d'usage spécialisés**: statuts et compteurs
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      description: 'Variante visuelle du badge',
      options: ['default', 'secondary', 'success', 'warning', 'error', 'outline', 'ghost', 'info', 'gradient', 'glass']
    },
    size: {
      control: 'select',
      description: 'Taille du badge',
      options: ['xs', 'sm', 'md', 'lg', 'xl']
    },
    dot: {
      control: 'boolean',
      description: 'Affiche un point indicateur'
    },
    removable: {
      control: 'boolean',
      description: 'Rend le badge amovible'
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// 🎯 Story par défaut
export const Default: Story = {
  args: {
    children: 'Badge par défaut'
  }
}

// 🎨 Stories des variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="gradient">Gradient</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toutes les variantes de couleurs disponibles'
      }
    }
  }
}

export const GlassVariant: Story = {
  args: {
    variant: 'glass',
    children: 'Glass Badge'
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
      <Badge size="xs">Extra Small</Badge>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
      <Badge size="xl">Extra Large</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Les différentes tailles de badges disponibles'
      }
    }
  }
}

// 🎯 Badges avec points indicateurs
export const WithDots: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge dot>Nouveau</Badge>
      <Badge dotColor="bg-success-500" variant="success">
        Actif
      </Badge>
      <Badge dotColor="bg-warning-500" variant="warning">
        En attente
      </Badge>
      <Badge dotColor="bg-error-500" variant="error">
        Erreur
      </Badge>
      <Badge dotColor="bg-gray-500" variant="ghost">
        Inactif
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges avec points indicateurs colorés'
      }
    }
  }
}

// 🗑️ Badges amovibles
export const Removable: Story = {
  render: () => {
    const RemovableBadges = () => {
      const [badges, setBadges] = useState([
        'React', 'TypeScript', 'Tailwind CSS', 'Vite'
      ])

      const handleRemove = (index: number) => {
        setBadges(prev => prev.filter((_, i) => i !== index))
      }

      return (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, index) => (
            <Badge
              key={badge}
              variant="outline"
              removable
              onRemove={() => handleRemove(index)}
            >
              {badge}
            </Badge>
          ))}
        </div>
      )
    }
    return <RemovableBadges />
  },
  parameters: {
    docs: {
      description: {
        story: 'Badges qui peuvent être supprimés par l\'utilisateur'
      }
    }
  }
}

// 🎯 Badges de statut spécialisés
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusBadge status="online" />
      <StatusBadge status="offline" />
      <StatusBadge status="busy" />
      <StatusBadge status="away" />
      <StatusBadge status="invisible" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges de statut préconfigurés pour les états de connexion'
      }
    }
  }
}

// 🔢 Badges compteur
export const CounterBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="relative">
          Messages
          <CounterBadge count={5} className="absolute -top-2 -right-4" />
        </span>
        <span className="relative">
          Notifications
          <CounterBadge count={12} />
        </span>
        <span className="relative">
          Tâches
          <CounterBadge count={156} />
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="relative">
          Emails non lus
          <CounterBadge count={0} showZero />
        </span>
        <span className="relative">
          Mises à jour
          <CounterBadge count={99} max={99} />
        </span>
        <span className="relative">
          Alertes critiques
          <CounterBadge count={999} max={99} />
        </span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges de compteur pour les notifications et quantités'
      }
    }
  }
}

// 🏷️ Cas d'usage réels
export const RealWorldUsage: Story = {
  render: () => (
    <div className="space-y-6">
      {/* 🎯 Catégories de contenu */}
      <div>
        <h3 className="font-semibold mb-3">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Frontend</Badge>
          <Badge variant="secondary">Backend</Badge>
          <Badge variant="outline">DevOps</Badge>
          <Badge variant="ghost">Design</Badge>
        </div>
      </div>

      {/* 📊 Niveaux de difficulté */}
      <div>
        <h3 className="font-semibold mb-3">Difficulté</h3>
        <div className="flex gap-3">
          <Badge variant="success" dot>Débutant</Badge>
          <Badge variant="warning" dot>Intermédiaire</Badge>
          <Badge variant="error" dot>Avancé</Badge>
        </div>
      </div>

      {/* 🏆 Statuts de projet */}
      <div>
        <h3 className="font-semibold mb-3">Projets</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span>Site E-commerce</span>
            <StatusBadge status="online" />
          </div>
          <div className="flex items-center gap-2">
            <span>API Mobile</span>
            <StatusBadge status="busy" />
          </div>
          <div className="flex items-center gap-2">
            <span>Dashboard Admin</span>
            <StatusBadge status="offline" />
          </div>
        </div>
      </div>

      {/* 🏷️ Tags avec suppression */}
      <div>
        <h3 className="font-semibold mb-3">Tags de l'article</h3>
        <Removable />
      </div>

      {/* 📱 Interface de notification */}
      <div>
        <h3 className="font-semibold mb-3">Centre de notifications</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span>Messages</span>
            <CounterBadge count={3} />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span>Demandes d'ami</span>
            <CounterBadge count={8} />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span>Mises à jour système</span>
            <CounterBadge count={1} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemples d\'utilisation réelle des badges dans une interface'
      }
    }
  }
}

// 🎨 Badges personnalisés
export const CustomBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge
        variant="gradient"
        className="shadow-lg"
      >
        🚀 Premium
      </Badge>
      <Badge
        variant="success"
        className="font-bold"
      >
        ✅ Vérifié
      </Badge>
      <Badge
        variant="warning"
        className="animate-pulse"
      >
        ⚡ En cours
      </Badge>
      <Badge
        variant="outline"
        className="border-dashed"
      >
        📝 Brouillon
      </Badge>
      <Badge
        variant="ghost"
        className="uppercase tracking-wider text-xs"
      >
        Beta
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges personnalisés avec styles et émojis'
      }
    }
  }
}