import { supabase } from './client';
import type {
  Scenario,
  ScenarioWithCriteria,
  CreateScenarioInput,
  UpdateScenarioInput,
  ScenarioFilters,
  ScenarioListResponse
} from '../../types/scenarios';

export class ScenariosService {
  // Récupérer tous les scénarios (avec filtres optionnels)
  static async getScenarios(filters?: ScenarioFilters): Promise<{ data: Scenario[] | null; error: any }> {
    let query = supabase
      .from('scenarios')
      .select('*')
      .eq('is_active', true);

    // Appliquer les filtres
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.language) {
      query = query.eq('language', filters.language);
    }
    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  }

  // Récupérer un scénario par son ID avec ses critères d'évaluation
  static async getScenarioById(id: string): Promise<{ data: ScenarioWithCriteria | null; error: any }> {
    const { data, error } = await supabase
      .from('scenarios')
      .select(`
        *,
        evaluation_criteria (*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    return { data, error };
  }

  // Récupérer les scénarios créés par un utilisateur
  static async getUserScenarios(userId: string, filters?: ScenarioFilters): Promise<{ data: Scenario[] | null; error: any }> {
    let query = supabase
      .from('scenarios')
      .select('*')
      .eq('created_by', userId)
      .eq('is_active', true);

    // Appliquer les filtres
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  }

  // Créer un nouveau scénario avec ses critères d'évaluation
  static async createScenario(scenario: CreateScenarioInput): Promise<{ data: Scenario | null; error: any }> {
    // Créer le scénario principal
    const { data: scenarioData, error: scenarioError } = await supabase
      .from('scenarios')
      .insert({
        title: scenario.title,
        description: scenario.description,
        category: scenario.category,
        difficulty: scenario.difficulty,
        duration: scenario.duration,
        language: scenario.language || 'fr',
        instructions: scenario.instructions,
        ai_personality: scenario.ai_personality,
        context: scenario.context,
        mise_en_situation: scenario.mise_en_situation,
        questions_typiques: scenario.questions_typiques,
        objectifs: scenario.objectifs,
        is_public: scenario.is_public ?? true,
        is_active: true
      })
      .select()
      .single();

    if (scenarioError || !scenarioData) {
      return { data: null, error: scenarioError };
    }

    // Ajouter les critères d'évaluation s'ils existent
    if (scenario.evaluation_criteria && scenario.evaluation_criteria.length > 0) {
      const criteriaWithScenarioId = scenario.evaluation_criteria.map(criteria => ({
        scenario_id: scenarioData.id,
        name: criteria.name,
        description: criteria.description,
        weight: criteria.weight,
        type: criteria.type
      }));

      const { error: criteriaError } = await supabase
        .from('evaluation_criteria')
        .insert(criteriaWithScenarioId);

      if (criteriaError) {
        // Si l'insertion des critères échoue, supprimer le scénario créé
        await supabase.from('scenarios').delete().eq('id', scenarioData.id);
        return { data: null, error: criteriaError };
      }
    }

    return { data: scenarioData, error: null };
  }

  // Mettre à jour un scénario
  static async updateScenario(id: string, updates: UpdateScenarioInput): Promise<{ data: Scenario | null; error: any }> {
    // Mettre à jour le scénario principal
    const { data: scenarioData, error: scenarioError } = await supabase
      .from('scenarios')
      .update({
        title: updates.title,
        description: updates.description,
        category: updates.category,
        difficulty: updates.difficulty,
        duration: updates.duration,
        language: updates.language,
        instructions: updates.instructions,
        ai_personality: updates.ai_personality,
        context: updates.context,
        mise_en_situation: updates.mise_en_situation,
        questions_typiques: updates.questions_typiques,
        objectifs: updates.objectifs,
        is_public: updates.is_public,
        is_active: updates.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (scenarioError) {
      return { data: null, error: scenarioError };
    }

    // Si des critères d'évaluation sont fournis, les mettre à jour
    if (updates.evaluation_criteria) {
      // Supprimer les anciens critères
      await supabase
        .from('evaluation_criteria')
        .delete()
        .eq('scenario_id', id);

      // Insérer les nouveaux critères
      if (updates.evaluation_criteria.length > 0) {
        const criteriaWithScenarioId = updates.evaluation_criteria.map(criteria => ({
          scenario_id: id,
          name: criteria.name,
          description: criteria.description,
          weight: criteria.weight,
          type: criteria.type
        }));

        const { error: criteriaError } = await supabase
          .from('evaluation_criteria')
          .insert(criteriaWithScenarioId);

        if (criteriaError) {
          return { data: null, error: criteriaError };
        }
      }
    }

    return { data: scenarioData, error: null };
  }

  // Supprimer un scénario (désactiver)
  static async deleteScenario(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('scenarios')
      .update({ is_active: false })
      .eq('id', id);

    return { error };
  }

  // Supprimer définitivement un scénario
  static async hardDeleteScenario(id: string): Promise<{ error: any }> {
    // Supprimer d'abord les critères d'évaluation (à cause de la contrainte de clé étrangère)
    const { error: criteriaError } = await supabase
      .from('evaluation_criteria')
      .delete()
      .eq('scenario_id', id);

    if (criteriaError) {
      return { error: criteriaError };
    }

    // Supprimer le scénario
    const { error } = await supabase
      .from('scenarios')
      .delete()
      .eq('id', id);

    return { error };
  }

  // Dupliquer un scénario
  static async duplicateScenario(id: string, newTitle?: string): Promise<{ data: Scenario | null; error: any }> {
    // Récupérer le scénario original avec ses critères
    const { data: originalScenario, error: fetchError } = await this.getScenarioById(id);

    if (fetchError || !originalScenario) {
      return { data: null, error: fetchError };
    }

    // Préparer les données pour le nouveau scénario
    const newScenario: CreateScenarioInput = {
      title: newTitle || `${originalScenario.title} (copie)`,
      description: originalScenario.description,
      category: originalScenario.category,
      difficulty: originalScenario.difficulty,
      duration: originalScenario.duration,
      language: originalScenario.language,
      instructions: originalScenario.instructions,
      ai_personality: originalScenario.ai_personality,
      context: originalScenario.context,
      mise_en_situation: originalScenario.mise_en_situation,
      questions_typiques: originalScenario.questions_typiques,
      objectifs: originalScenario.objectifs,
      is_public: false, // Les copies ne sont pas publiques par défaut
      evaluation_criteria: originalScenario.evaluation_criteria.map(criteria => ({
        name: criteria.name,
        description: criteria.description,
        weight: criteria.weight,
        type: criteria.type
      }))
    };

    // Créer le nouveau scénario
    return this.createScenario(newScenario);
  }

  // Compter les scénarios par catégorie
  static async getScenariosCountByCategory(): Promise<{ data: Record<string, number> | null; error: any }> {
    const { data, error } = await supabase
      .from('scenarios')
      .select('category')
      .eq('is_active', true)
      .eq('is_public', true);

    if (error) {
      return { data: null, error };
    }

    const counts: Record<string, number> = {};
    data?.forEach(scenario => {
      counts[scenario.category] = (counts[scenario.category] || 0) + 1;
    });

    return { data: counts, error: null };
  }
}