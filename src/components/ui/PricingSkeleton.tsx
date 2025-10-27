import React from 'react';

export const PricingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors">
    <div className="max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="text-center mb-12">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto animate-pulse"></div>
      </div>

      {/* Pricing cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-stretch">
        {/* Free plan skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2 animate-pulse"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto mb-4 animate-pulse"></div>
            </div>

            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded mr-3 mt-0.5 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>

            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Pro plan skeleton (featured) */}
        <div className="bg-linear-to-br from-slate-600 to-slate-800 rounded-2xl shadow-xl border-2 border-orange-400/50 overflow-hidden transform scale-105 relative">
          <div className="absolute -top-4 right-0">
            <div className="h-8 bg-orange-400 rounded-full px-3 py-1 animate-pulse"></div>
          </div>
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-white/30 mx-auto mb-4 animate-pulse"></div>
              <div className="h-8 bg-white/30 rounded w-32 mx-auto mb-2 animate-pulse"></div>
              <div className="h-12 bg-white/30 rounded w-24 mx-auto mb-4 animate-pulse"></div>
            </div>

            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start">
                  <div className="w-5 h-5 bg-white/30 rounded mr-3 mt-0.5 animate-pulse"></div>
                  <div className="h-4 bg-white/30 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>

            <div className="h-12 bg-white/30 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Enterprise plan skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 mx-auto mb-2 animate-pulse"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-4 animate-pulse"></div>
            </div>

            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-start">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded mr-3 mt-0.5 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>

            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* FAQ section skeleton */}
      <div className="bg-linear-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 mb-8 border border-slate-300/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/40 dark:bg-gray-800/60 p-6 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-gray-700/50">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA section skeleton */}
      <div className="text-center bg-linear-to-br from-slate-600 to-slate-800 rounded-2xl p-8 text-white shadow-xl border border-slate-700/50 backdrop-blur-sm">
        <div className="h-8 bg-white/20 rounded w-80 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-white/20 rounded w-96 mx-auto mb-6 animate-pulse"></div>
        <div className="h-12 bg-white/20 rounded-lg w-48 mx-auto animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default PricingSkeleton;
