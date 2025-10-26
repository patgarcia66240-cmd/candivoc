import React from 'react';

export const SessionSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    {/* Header skeleton */}
    <div className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="space-y-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
        </div>
      </div>
    </div>

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Alert skeleton */}
      <div className="mb-6">
        <div className="h-16 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg animate-pulse"></div>
      </div>

      {/* Main interface skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[600px]">
        {/* Start screen skeleton */}
        <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-56 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
          </div>

          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 animate-pulse"></div>

            <div className="text-center space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 mx-auto animate-pulse"></div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-80 mx-auto animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SessionSkeleton;