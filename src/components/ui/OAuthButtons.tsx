import React from 'react';
import { Button } from './Button';

interface OAuthButtonsProps {
  onOAuthLogin: (provider: 'google' | 'linkedin_oidc' | 'github') => void;
  className?: string;
  showLabel?: boolean;
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({
  onOAuthLogin,
  className = "",
  showLabel = true
}) => {
  const oauthProviders = [
    {
      name: 'google',
      label: 'Google',
      icon: 'https://www.svgrepo.com/show/355037/google.svg',
      alt: 'Google'
    },
    {
      name: 'linkedin_oidc' as const,
      label: 'LinkedIn',
      icon: 'https://www.svgrepo.com/show/448234/linkedin.svg',
      alt: 'LinkedIn'
    },
    {
      name: 'github' as const,
      label: 'GitHub',
      icon: 'https://www.svgrepo.com/show/349375/github.svg',
      alt: 'GitHub'
    }
  ];

  return (
    <div className={`flex justify-center gap-3 ${className}`}>
      {oauthProviders.map((provider) => (
        <Button
          key={provider.name}
          variant="outline"
          onClick={() => onOAuthLogin(provider.name)}
          className="flex items-center"
        >
          <img
            src={provider.icon}
            alt={provider.alt}
            className="w-5 h-5 mr-2"
          />
          {showLabel && provider.label}
        </Button>
      ))}
    </div>
  );
};