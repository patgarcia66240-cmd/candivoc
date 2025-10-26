import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScenarioList } from '../components/scenarios/ScenarioList';
import { scenariosService } from '../services/api/scenarios';
import type { Scenario } from '../types/scenarios';
import { ScenariosSkeleton } from '../components/ui/ScenariosSkeleton';

export const Scenarios: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Charger les scénarios depuis Supabase
    const loadScenarios = async () => {
      try {
        console.log('🔍 Loading scenarios from Supabase...');
        const result = await scenariosService.getAllScenarios({ is_public: true });

        if (result.success && result.data) {
          console.log(`✅ Loaded ${result.data.length} scenarios`);
          setScenarios(result.data);
        } else {
          console.error('❌ Failed to load scenarios:', result.error);
        }
      } catch (error) {
        console.error('❌ Error loading scenarios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, []);

  const handleStartScenario = (scenario: Scenario) => {
    // Naviguer vers une session de démonstration
    navigate(`/session/demo-${scenario.id}`);
  };

  // Afficher le skeleton pendant le chargement des scénarios
  if (loading) {
    return <ScenariosSkeleton />;
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bibliothèque de scénarios
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScenarioList
          scenarios={scenarios}
          onStartScenario={handleStartScenario}
          loading={loading}
        />
      </div>
    </>
  );
};

