import React from 'react'

// 🎨 Skeleton Dashboard CandiVoc - Fidèle et professionnel avec dégradés gris
export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-white animate-pulse">
    {/* Header - Exactement comme le dashboard CandiVoc */}
    <div className="bg-linear-to-r from-slate-50 to-white shadow-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="space-y-2">
            <div className="h-9 bg-linear-to-r from-gray-200 to-gray-300 rounded-lg w-80"></div>
            <div className="h-5 bg-linear-to-r from-gray-200 to-gray-300 rounded w-64"></div>
          </div>
          <div className="h-12 bg-linear-to-r from-gray-200 to-gray-300 rounded-xl w-40 shadow-lg"></div>
        </div>
      </div>
    </div>

    {/* Contenu principal - Structure identique au dashboard */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

      {/* Stats Grid - 3 cartes comme dans le dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Carte Stats 1 - Sessions complétées */}
        <div className="bg-linear-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/50 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-linear-to-br from-slate-500 to-slate-600 rounded-2xl p-4 mr-6 shadow-lg">
              <div className="w-8 h-8 bg-white/20 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-32 mb-2"></div>
              <div className="h-10 bg-linear-to-r from-gray-300 to-gray-400 rounded w-16"></div>
            </div>
          </div>
        </div>

        {/* Carte Stats 2 - Score moyen */}
        <div className="bg-linear-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/50 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-linear-to-br from-slate-600 to-slate-700 rounded-2xl p-4 mr-6 shadow-lg">
              <div className="w-8 h-8 bg-white/20 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-24 mb-2"></div>
              <div className="h-10 bg-linear-to-r from-gray-300 to-gray-400 rounded w-12"></div>
            </div>
          </div>
        </div>

        {/* Carte Stats 3 - Temps total */}
        <div className="bg-linear-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/50 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-linear-to-br from-slate-700 to-slate-800 rounded-2xl p-4 mr-6 shadow-lg">
              <div className="w-8 h-8 bg-white/20 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-20 mb-2"></div>
              <div className="h-10 bg-linear-to-r from-gray-300 to-gray-400 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions récentes - Structure exacte du dashboard */}
      <div className="bg-linear-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
        {/* Header de la section */}
        <div className="px-8 py-6 bg-linear-to-r from-slate-100 to-slate-200 border-b border-slate-300">
          <div className="h-7 bg-linear-to-r from-gray-300 to-gray-400 rounded w-48 mb-2"></div>
          <div className="h-5 bg-linear-to-r from-gray-200 to-gray-300 rounded w-56"></div>
        </div>

        {/* Contenu des sessions */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Session 1 */}
            <div className="flex items-center justify-between p-6 bg-white/60 rounded-xl border border-slate-200/50 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
              <div className="flex-1">
                <div className="h-6 bg-linear-to-r from-gray-300 to-gray-400 rounded w-56 mb-3"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded"></div>
                  <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-32"></div>
                  <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right mr-6">
                <div className="h-8 bg-linear-to-r from-emerald-200 to-emerald-300 rounded w-12 mb-1"></div>
                <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-12"></div>
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>

            {/* Session 2 */}
            <div className="flex items-center justify-between p-6 bg-white/60 rounded-xl border border-slate-200/50 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
              <div className="flex-1">
                <div className="h-6 bg-linear-to-r from-gray-300 to-gray-400 rounded w-48 mb-3"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded"></div>
                  <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-28"></div>
                  <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                </div>
              </div>
              <div className="text-right mr-6">
                <div className="h-8 bg-linear-to-r from-emerald-200 to-emerald-300 rounded w-10 mb-1"></div>
                <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-12"></div>
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>

            {/* Session 3 */}
            <div className="flex items-center justify-between p-6 bg-white/60 rounded-xl border border-slate-200/50 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
              <div className="flex-1">
                <div className="h-6 bg-linear-to-r from-gray-300 to-gray-400 rounded w-52 mb-3"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded"></div>
                  <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-24"></div>
                  <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right mr-6">
                <div className="h-8 bg-linear-to-r from-emerald-200 to-emerald-300 rounded w-12 mb-1"></div>
                <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-12"></div>
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// 📱 Skeleton Dashboard Mobile - Fidèle et professionnel avec dégradés gris
export const MobilePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-white animate-pulse">
    {/* Header Mobile - Compact comme sur mobile */}
    <div className="bg-linear-to-r from-slate-50 to-white shadow-lg border-b border-slate-200">
      <div className="px-4 py-4">
        <div className="flex flex-col space-y-3">
          <div className="h-7 bg-linear-to-r from-gray-200 to-gray-300 rounded-lg w-48"></div>
          <div className="h-10 bg-linear-to-r from-gray-200 to-gray-300 rounded-xl w-32 shadow-lg"></div>
        </div>
      </div>
    </div>

    {/* Contenu principal mobile */}
    <div className="px-4 py-6 space-y-6">
      {/* Cartes statistiques mobile - Grid 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Stats 1 - Sessions */}
        <div className="bg-linear-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200/50 p-4">
          <div className="space-y-3">
            <div className="bg-linear-to-br from-slate-500 to-slate-600 rounded-xl p-3 shadow">
              <div className="w-6 h-6 bg-white/20 rounded"></div>
            </div>
            <div className="space-y-1">
              <div className="h-8 bg-linear-to-r from-gray-300 to-gray-400 rounded w-12"></div>
              <div className="h-3 bg-linear-to-r from-gray-200 to-gray-300 rounded w-16"></div>
            </div>
          </div>
        </div>

        {/* Stats 2 - Score */}
        <div className="bg-linear-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200/50 p-4">
          <div className="space-y-3">
            <div className="bg-linear-to-br from-slate-600 to-slate-700 rounded-xl p-3 shadow">
              <div className="w-6 h-6 bg-white/20 rounded"></div>
            </div>
            <div className="space-y-1">
              <div className="h-8 bg-linear-to-r from-gray-300 to-gray-400 rounded w-10"></div>
              <div className="h-3 bg-linear-to-r from-gray-200 to-gray-300 rounded w-14"></div>
            </div>
          </div>
        </div>

        {/* Stats 3 - Temps */}
        <div className="bg-linear-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200/50 p-4">
          <div className="space-y-3">
            <div className="bg-linear-to-br from-slate-700 to-slate-800 rounded-xl p-3 shadow">
              <div className="w-6 h-6 bg-white/20 rounded"></div>
            </div>
            <div className="space-y-1">
              <div className="h-8 bg-linear-to-r from-gray-300 to-gray-400 rounded w-16"></div>
              <div className="h-3 bg-linear-to-r from-gray-200 to-gray-300 rounded w-12"></div>
            </div>
          </div>
        </div>

        {/* Stats 4 - Actions */}
        <div className="bg-linear-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200/50 p-4">
          <div className="space-y-3">
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl p-3 shadow">
              <div className="w-6 h-6 bg-white/20 rounded"></div>
            </div>
            <div className="space-y-1">
              <div className="h-8 bg-linear-to-r from-gray-300 to-gray-400 rounded w-8"></div>
              <div className="h-3 bg-linear-to-r from-gray-200 to-gray-300 rounded w-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions récentes mobile */}
      <div className="bg-linear-to-br from-white to-slate-50 rounded-xl shadow-xl border border-slate-200/50 overflow-hidden">
        {/* Header section mobile */}
        <div className="px-4 py-4 bg-linear-to-r from-slate-100 to-slate-200 border-b border-slate-300">
          <div className="h-6 bg-linear-to-r from-gray-300 to-gray-400 rounded w-40 mb-1"></div>
          <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-48"></div>
        </div>

        {/* Contenu sessions mobile */}
        <div className="p-4 space-y-4">
          {/* Session 1 mobile */}
          <div className="p-4 bg-white/60 rounded-lg border border-slate-200/50">
            <div className="space-y-3">
              <div className="h-5 bg-linear-to-r from-gray-300 to-gray-400 rounded w-40"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-linear-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-24"></div>
                <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-12"></div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 bg-linear-to-r from-emerald-200 to-emerald-300 rounded w-10"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Session 2 mobile */}
          <div className="p-4 bg-white/60 rounded-lg border border-slate-200/50">
            <div className="space-y-3">
              <div className="h-5 bg-linear-to-r from-gray-300 to-gray-400 rounded w-36"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-linear-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-16"></div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 bg-linear-to-r from-emerald-200 to-emerald-300 rounded w-8"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Session 3 mobile */}
          <div className="p-4 bg-white/60 rounded-lg border border-slate-200/50">
            <div className="space-y-3">
              <div className="h-5 bg-linear-to-r from-gray-300 to-gray-400 rounded w-44"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-linear-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-28"></div>
                <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-12"></div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 bg-linear-to-r from-emerald-200 to-emerald-300 rounded w-10"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default PageSkeleton
