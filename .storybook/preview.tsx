// 🎨 Configuration Storybook pour CandiVoc Design System
import type { Preview } from '@storybook/react'
import React from 'react'
import './styles.css'

const preview: Preview = {
  parameters: {
    // 🎨 Layout
    layout: 'centered',
  },

  // 🎨 Décorateurs globaux
  decorators: [
    (Story) => (
      <div className="p-4 bg-white">
        <Story />
      </div>
    ),
  ],

  // 📋 Tags pour l'organisation
  tags: ['autodocs'],
}

export default preview