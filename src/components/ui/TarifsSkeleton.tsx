import React from 'react';

export const TarifsSkeleton: React.FC = () => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-900">
    {/* Header skeleton */}
    <div className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Hero section skeleton */}
    <div className="relative bg-linear-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Pricing cards skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free plan skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
            </div>

            <div className="mt-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>

            <div className="mt-8 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Pro plan skeleton (featured) */}
        <div className="bg-linear-to-br from-orange-500 to-amber-500 rounded-2xl shadow-xl border-2 border-orange-200 overflow-hidden transform scale-105">
          <div className="p-8">
            <div className="space-y-4">
              <div className="h-8 bg-white/30 rounded w-32 animate-pulse"></div>
              <div className="h-12 bg-white/30 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-white/30 rounded w-40 animate-pulse"></div>
            </div>

            <div className="mt-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-white/30 rounded animate-pulse"></div>
                  <div className="h-4 bg-white/30 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>

            <div className="mt-8 h-12 bg-white/30 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Enterprise plan skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
            </div>

            <div className="mt-8 space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>

            <div className="mt-8 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    {/* FAQ section skeleton */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
      </div>

      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* CTA section skeleton */}
    <div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-80 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

export default TarifsSkeleton;
