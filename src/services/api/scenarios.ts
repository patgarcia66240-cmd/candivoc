import { apiClient } from './client';
import { mockScenarios } from '../../data/mockData';

// Interfaces locales pour éviter les problèmes d'export
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

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const scenariosService = {
  async getAllScenarios(): Promise<APIResponse<Scenario[]>> {
    try {
      return await apiClient.get<Scenario[]>('/scenarios');
    } catch (error) {
      console.log('Using mock scenarios data');
      return {
        success: true,
        data: mockScenarios
      };
    }
  },

  async getScenarioById(id: string): Promise<APIResponse<Scenario>> {
    try {
      return await apiClient.get<Scenario>(`/scenarios/${id}`);
    } catch (error) {
      console.log('Using mock scenario data');
      const scenario = mockScenarios.find(s => s.id === id);
      if (scenario) {
        return {
          success: true,
          data: scenario
        };
      } else {
        return {
          success: false,
          error: 'Scenario not found'
        };
      }
    }
  },

  async getScenariosByCategory(category: string): Promise<APIResponse<Scenario[]>> {
    try {
      return await apiClient.get<Scenario[]>(`/scenarios?category=${category}`);
    } catch (error) {
      console.log('Using mock scenarios by category');
      const filteredScenarios = mockScenarios.filter(s => s.category === category);
      return {
        success: true,
        data: filteredScenarios
      };
    }
  },

  async getScenariosByDifficulty(difficulty: string): Promise<APIResponse<Scenario[]>> {
    try {
      return await apiClient.get<Scenario[]>(`/scenarios?difficulty=${difficulty}`);
    } catch (error) {
      console.log('Using mock scenarios by difficulty');
      const filteredScenarios = mockScenarios.filter(s => s.difficulty === difficulty);
      return {
        success: true,
        data: filteredScenarios
      };
    }
  },

  async createScenario(scenario: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<Scenario>> {
    return apiClient.post<Scenario>('/scenarios', scenario);
  },

  async updateScenario(id: string, scenario: Partial<Scenario>): Promise<APIResponse<Scenario>> {
    return apiClient.put<Scenario>(`/scenarios/${id}`, scenario);
  },

  async deleteScenario(id: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`/scenarios/${id}`);
  }
};