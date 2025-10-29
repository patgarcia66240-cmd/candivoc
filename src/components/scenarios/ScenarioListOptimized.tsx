import React, { useState } from 'react';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { ScenarioCard } from './ScenarioCard';
import { Input } from '../ui/Input';
import { CustomSelect } from '../ui/CustomSelect';
import { useScenarios } from '@/hooks/useScenarios';
import type { Scenario } from '../../types/scenarios';

interface ScenarioListOptimizedProps {
  onStartScenario: (scenario: Scenario) => void;
}

export const ScenarioListOptimized: React.FC<ScenarioListOptimizedProps> = ({
  onStartScenario
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // 📊 Récupération des scénarios avec React Query
  const {
    data: scenarios = [],
    isLoading,
    error,
    refetch
  } = useScenarios({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
    is_public: true
  });

  
  const categories = ['all', 'technical', 'commercial', 'presentation', 'problem-solving', 'communication'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const categoryOptions = categories.map(category => ({
    value: category,
    label: category === 'all' ? 'Toutes catégories' : category
  }));

  const difficultyOptions = difficulties.map(difficulty => ({
    value: difficulty,
    label: difficulty === 'all' ? 'Tous niveaux' : difficulty
  }));

  // 🔍 Filtrage local pour la recherche (rapide car côté client)
  const filteredScenarios = scenarios.filter((scenario) => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 🔄 Retry en cas d'erreur
  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un scénario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <CustomSelect
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
          />

          {/* Difficulty Filter */}
          <CustomSelect
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
            options={difficultyOptions}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erreur de chargement
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Impossible de charger les scénarios. Veuillez réessayer.
              </p>
              <button
                onClick={handleRetry}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Scénarios disponibles ({filteredScenarios.length})
          </h2>

          {/* 📊 Indicateur de cache */}
          {scenarios.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Données mises en cache
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Chargement des scénarios...</p>
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {scenarios.length === 0 ? 'Aucun scénario disponible' : 'Aucun scénario trouvé'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {scenarios.length === 0
                ? 'Les scénarios apparaîtront bientôt'
                : 'Essayez de modifier vos filtres de recherche'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onStart={onStartScenario}
              />
            ))}
          </div>
        )}
      </div>

      {/* 🎯 Debug info (uniquement en développement) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
          <div>Cache Status: {error ? 'Error' : isLoading ? 'Loading' : 'Fresh'}</div>
          <div>Scenarios: {scenarios.length}</div>
          <div>Filtered: {filteredScenarios.length}</div>
        </div>
      )}
    </div>
  );
};