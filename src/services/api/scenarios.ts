import { ScenariosService } from '../supabase/scenarios';
import type { Scenario, ScenarioWithCriteria, CreateScenarioInput, UpdateScenarioInput } from '../../types/scenarios';

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const scenariosService = {
  async getAllScenarios(filters?: { category?: string; difficulty?: string; is_public?: boolean }): Promise<APIResponse<Scenario[]>> {
    try {
      const { data, error } = await ScenariosService.getScenarios(filters);

      if (error) {
        console.error('Error fetching scenarios:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        success: false,
        error: 'Failed to fetch scenarios'
      };
    }
  },

  async getScenarioById(id: string): Promise<APIResponse<ScenarioWithCriteria>> {
    try {
      const { data, error } = await ScenariosService.getScenarioById(id);

      if (error) {
        console.error('Error fetching scenario:', error);
        return {
          success: false,
          error: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Scenario not found'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        success: false,
        error: 'Failed to fetch scenario'
      };
    }
  },

  async getScenariosByCategory(category: string): Promise<APIResponse<Scenario[]>> {
    return this.getAllScenarios({ category });
  },

  async getScenariosByDifficulty(difficulty: string): Promise<APIResponse<Scenario[]>> {
    return this.getAllScenarios({ difficulty });
  },

  async createScenario(scenario: CreateScenarioInput): Promise<APIResponse<Scenario>> {
    try {
      const { data, error } = await ScenariosService.createScenario(scenario);

      if (error) {
        console.error('Error creating scenario:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data!
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        success: false,
        error: 'Failed to create scenario'
      };
    }
  },

  async updateScenario(id: string, scenario: UpdateScenarioInput): Promise<APIResponse<Scenario>> {
    try {
      const { data, error } = await ScenariosService.updateScenario(id, scenario);

      if (error) {
        console.error('Error updating scenario:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data!
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        success: false,
        error: 'Failed to update scenario'
      };
    }
  },

  async deleteScenario(id: string): Promise<APIResponse<void>> {
    try {
      const { error } = await ScenariosService.deleteScenario(id);

      if (error) {
        console.error('Error deleting scenario:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        success: false,
        error: 'Failed to delete scenario'
      };
    }
  }
};