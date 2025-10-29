import type { StorybookConfig } from '@storybook/react-vite';
import { resolve } from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-onboarding'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  // 🎨 Configuration TypeScript et paths pour Storybook
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true)
    }
  },
  // 🎯 Configuration Vite pour les paths aliases
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, '../src')
    };

    // 🚫 Désactiver le plugin PWA pour Storybook pour éviter les erreurs de build
    config.plugins = config.plugins?.filter((plugin) => {
      return plugin && typeof plugin === 'object' && 'name' in plugin
        ? plugin.name !== 'vite-plugin-pwa'
        : true;
    });

    return config;
  },
  };

export default config;