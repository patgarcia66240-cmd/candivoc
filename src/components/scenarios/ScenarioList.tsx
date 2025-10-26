import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { ScenarioCard } from './ScenarioCard';
import { Input } from '../ui/Input';
import { CustomSelect } from '../ui/CustomSelect';
import type { Scenario } from '../../types/scenarios';

interface ScenarioListProps {
  scenarios: Scenario[];
  onStartScenario: (scenario: Scenario) => void;
  loading?: boolean;
}

export const ScenarioList: React.FC<ScenarioListProps> = ({
  scenarios,
  onStartScenario,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

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

  const filteredScenarios = scenarios.filter((scenario) => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scenario.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Scénarios disponibles ({filteredScenarios.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des scénarios...</p>
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">
              Aucun scénario trouvé
            </p>
            <p className="text-gray-500 mt-2">
              Essayez de modifier vos filtres de recherche
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
    </div>
  );
};
