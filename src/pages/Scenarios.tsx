import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScenarioList } from '../components/scenarios/ScenarioList';
import { mockScenarios } from '../data/mockData';

// Interface locale pour éviter les problèmes d'export
interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'commercial' | 'presentation' | 'problem-solving' | 'communication';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  language: string;
  instructions: string;
  aiPersonality: string;
  evaluationCriteria: EvaluationCriteria[];
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  type: 'semantic' | 'emotional' | 'fluency' | 'relevance' | 'timing';
}

export const Scenarios: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Utiliser les données de démonstration pour le MVP
    const loadScenarios = async () => {
      try {
        // Simuler un chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        setScenarios(mockScenarios);
      } catch (error) {
        console.error('Error loading scenarios:', error);
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

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">
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
