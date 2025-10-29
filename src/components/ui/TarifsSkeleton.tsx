import React from 'react';

// 🎨 Skeleton Tarifs CandiVoc - Fidèle et professionnel avec dégradés gris
export const TarifsSkeleton: React.FC = () => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors animate-pulse">
    <div className="max-w-7xl mx-auto">

      {/* En-tête - Exactement comme dans Tarifs.tsx (seulement 2 lignes) */}
      <div className="text-center mb-12">
        <div className="h-10 bg-linear-to-r from-gray-200 to-gray-300 rounded-lg w-96 mx-auto mb-4"></div>
        <div className="h-6 bg-linear-to-r from-gray-200 to-gray-300 rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-6 bg-linear-to-r from-gray-200 to-gray-300 rounded w-1/2 mx-auto"></div>
      </div>

      {/* Cartes de tarifs - Exactement comme PricingCard.tsx mais en skeleton gris */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-stretch">

        {/* Carte Essai Gratuit - Plus petite et compacte */}
        <div className="bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl shadow-xl border border-slate-600/50 p-6 hover:shadow-2xl hover:border-slate-400/70 transition-all duration-300 backdrop-blur-sm flex flex-col h-full relative">
          {/* En-tête avec icône - Plus compact */}
          <div className="text-center mb-4 shrink-0 relative">
            <div className="w-12 h-12 bg-slate-700/90 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg backdrop-blur-sm">
              <div className="w-6 h-6 bg-linear-to-r from-slate-400 to-slate-500 rounded-lg"></div>
            </div>
            <div className="h-6 bg-linear-to-r from-gray-300 to-gray-400 rounded w-28 mx-auto mb-1"></div>
            <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-32 mx-auto"></div>
          </div>

          {/* Prix - Plus petit */}
          <div className="text-center mb-4 shrink-0">
            <div className="h-8 bg-linear-to-r from-gray-400 to-gray-500 rounded w-16 mx-auto mb-1"></div>
            <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-12 mx-auto"></div>
          </div>

          {/* Liste des fonctionnalités - Plus espacé */}
          <ul className="space-y-4 mb-8 grow">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-start min-h-[28px]">
                <div className="w-4 h-4 bg-linear-to-r from-gray-400 to-gray-500 rounded-full mr-3 mt-0.5 shrink-0"></div>
                <div className="h-3 bg-linear-to-r from-gray-300 to-gray-400 rounded flex-1 mt-0.5"></div>
              </li>
            ))}
          </ul>

          {/* Bouton - Plus petit */}
          <div className="mt-auto shrink-0">
            <div className="w-full h-10 bg-linear-to-r from-slate-400 to-slate-600 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:opacity-90"></div>
          </div>
        </div>

        {/* Carte Professionnel - Sans badge mais stylisée */}
        <div className="bg-linear-to-br from-slate-500 to-slate-700 rounded-2xl shadow-xl border border-slate-600/50 p-6 hover:shadow-2xl transition-all duration-300 flex flex-col h-full relative">
          {/* En-tête avec icône - Taille standard */}
          <div className="text-center mb-4 shrink-0 relative">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg backdrop-blur-sm">
              <div className="w-6 h-6 bg-linear-to-r from-slate-600 to-slate-700 rounded-lg"></div>
            </div>
            <div className="h-6 bg-linear-to-r from-white/40 to-white/30 rounded w-32 mx-auto mb-1"></div>
            <div className="h-4 bg-linear-to-r from-white/30 to-white/20 rounded w-36 mx-auto"></div>
          </div>

          {/* Prix - Taille standard */}
          <div className="text-center mb-4 shrink-0">
            <div className="h-8 bg-linear-to-r from-white/40 to-white/30 rounded w-20 mx-auto mb-1"></div>
            <div className="h-4 bg-linear-to-r from-white/30 to-white/20 rounded w-12 mx-auto"></div>
          </div>

          {/* Liste des fonctionnalités - Taille standard */}
          <ul className="space-y-4 mb-6 grow">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-start min-h-[24px]">
                <div className="w-4 h-4 bg-linear-to-r from-white/40 to-white/30 rounded-full mr-3 mt-0.5 shrink-0"></div>
                <div className="h-3 bg-linear-to-r from-white/30 to-white/20 rounded flex-1 mt-0.5"></div>
              </li>
            ))}
          </ul>

          {/* Bouton - Taille standard */}
          <div className="mt-auto shrink-0">
            <div className="w-full h-10 bg-gradient-to-r from-slate-400 to-slate-600 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:opacity-90"></div>
          </div>
        </div>

        {/* Carte Enterprise - Plus petite et compacte */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-600/50 p-6 hover:shadow-2xl hover:border-slate-400/70 transition-all duration-300 backdrop-blur-sm flex flex-col h-full relative">
          {/* En-tête avec icône - Plus compact */}
          <div className="text-center mb-4 shrink-0 relative">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg backdrop-blur-sm">
              <div className="w-6 h-6 bg-linear-to-r from-slate-700 to-slate-800 rounded-lg"></div>
            </div>
            <div className="h-6 bg-linear-to-r from-white/40 to-white/30 rounded w-28 mx-auto mb-1"></div>
            <div className="h-4 bg-linear-to-r from-white/30 to-white/20 rounded w-24 mx-auto"></div>
          </div>

          {/* Prix - Plus petit */}
          <div className="text-center mb-4 shrink-0">
            <div className="h-8 bg-linear-to-r from-white/40 to-white/30 rounded w-16 mx-auto mb-1"></div>
            <div className="h-4 bg-linear-to-r from-white/30 to-white/20 rounded w-12 mx-auto"></div>
          </div>

          {/* Liste des fonctionnalités - Plus espacé */}
          <ul className="space-y-4 mb-8 grow">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li key={i} className="flex items-start min-h-[28px]">
                <div className="w-4 h-4 bg-linear-to-r from-white/40 to-white/30 rounded-full mr-3 mt-0.5 shrink-0"></div>
                <div className="h-3 bg-linear-to-r from-white/30 to-white/20 rounded flex-1 mt-0.5"></div>
              </li>
            ))}
          </ul>

          {/* Bouton - Plus petit */}
          <div className="mt-auto shrink-0">
            <div className="w-full h-10 bg-linear-to-r from-slate-600 to-slate-700 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:opacity-90"></div>
          </div>
        </div>
      </div>

      
    </div>
  </div>
);

export default TarifsSkeleton;
