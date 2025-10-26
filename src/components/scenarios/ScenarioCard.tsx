import React from 'react';
import { Clock, Users, Star, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Scenario } from '../../types/scenarios';

interface ScenarioCardProps {
  scenario: Scenario;
  onStart: (scenario: Scenario) => void;
  disabled?: boolean;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onStart,
  disabled = false
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return '💻';
      case 'commercial':
        return '💼';
      case 'presentation':
        return '📊';
      case 'problem-solving':
        return '🧩';
      case 'communication':
        return '💬';
      default:
        return '📝';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getCategoryIcon(scenario.category)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {scenario.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {scenario.category}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
            scenario.difficulty
          )}`}
        >
          {scenario.difficulty}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {scenario.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{scenario.duration} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{scenario.is_public ? 'Public' : 'Privé'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>4.5</span>
        </div>
      </div>

      {/* Action */}
      <Button
        variant="gradient"
        onClick={() => onStart(scenario)}
        disabled={disabled}
        className="w-full"
      >
        <Play className="w-4 h-4 mr-2" />
        Commencer la session
      </Button>
    </div>
  );
};

