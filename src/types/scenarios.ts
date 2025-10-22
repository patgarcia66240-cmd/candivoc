export type ScenarioCategory = 'technical' | 'commercial' | 'presentation' | 'problem-solving' | 'communication';
export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CriteriaType = 'semantic' | 'emotional' | 'fluency' | 'relevance' | 'timing';

export interface EvaluationCriteria {
  id: string;
  scenario_id: string;
  name: string;
  description: string;
  weight: number;
  type: CriteriaType;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  difficulty: ScenarioDifficulty;
  duration: number;
  language: string;
  instructions: string;
  ai_personality: string;
  context?: string;
  mise_en_situation?: string;
  questions_typiques?: string;
  objectifs?: string;
  created_by: string | null;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScenarioWithCriteria extends Scenario {
  evaluation_criteria: EvaluationCriteria[];
}

export interface CreateScenarioInput {
  title: string;
  description: string;
  category: ScenarioCategory;
  difficulty: ScenarioDifficulty;
  duration: number;
  language?: string;
  instructions: string;
  ai_personality: string;
  context?: string;
  mise_en_situation?: string;
  questions_typiques?: string;
  objectifs?: string;
  is_public?: boolean;
  evaluation_criteria: Omit<EvaluationCriteria, 'id' | 'scenario_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateScenarioInput {
  title?: string;
  description?: string;
  category?: ScenarioCategory;
  difficulty?: ScenarioDifficulty;
  duration?: number;
  language?: string;
  instructions?: string;
  ai_personality?: string;
  context?: string;
  mise_en_situation?: string;
  questions_typiques?: string;
  objectifs?: string;
  is_public?: boolean;
  is_active?: boolean;
  evaluation_criteria?: Omit<EvaluationCriteria, 'id' | 'scenario_id' | 'created_at' | 'updated_at'>[];
}

export interface ScenarioFilters {
  category?: ScenarioCategory;
  difficulty?: ScenarioDifficulty;
  language?: string;
  is_public?: boolean;
  search?: string;
}

export interface ScenarioListResponse {
  scenarios: Scenario[];
  total: number;
  page: number;
  limit: number;
}