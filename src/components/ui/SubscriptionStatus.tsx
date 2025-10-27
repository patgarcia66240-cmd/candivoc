import React from 'react';
import { Check } from 'lucide-react';

interface SubscriptionStatusProps {
  isActive: boolean;
  planName: string;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  isActive,
  planName
}) => {
  if (!isActive) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-linear-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 animate-pulse border-2 border-orange-400/50 backdrop-blur-sm">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
        <Check className="w-5 h-5 text-white animate-bounce" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold">Abonnement actif</span>
        <span className="text-xs text-orange-100">{planName}</span>
      </div>
    </div>
  );
};
