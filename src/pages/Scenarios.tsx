import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useScenarios } from '../hooks/useScenarios';
import { ScenarioList } from '../components/scenarios/ScenarioList';
import type { Scenario } from '../types/scenarios';
import { ScenariosSkeleton } from '../components/ui/ScenariosSkeleton';

export const Scenarios: React.FC = () => {
  const navigate = useNavigate();

  // Utiliser le hook React Query pour les scénarios
  const { data: scenarios = [], isLoading, error } = useScenarios({ is_public: true });

  const handleStartScenario = (scenario: Scenario) => {
    // Naviguer vers le chat avec le nom du scénario
    navigate({
      to: '/app/chat/$sessionId',
      params: { sessionId: `scenario-${scenario.id}` }
    });
  };

  // Afficher le skeleton pendant le chargement
  if (isLoading) {
    return <ScenariosSkeleton />;
  }

  // Gérer les erreurs
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Erreur lors du chargement des scénarios
          </h2>
          <p className="text-red-700">
            Impossible de charger les scénarios. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      {/* <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bibliothèque de scénarios
            </h1>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ScenarioList
          scenarios={scenarios}
          onStartScenario={handleStartScenario}
          loading={isLoading}
        />
      </div>
    </>
  );
};

