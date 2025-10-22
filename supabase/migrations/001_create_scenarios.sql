-- Migration: Create scenarios table
-- Description: Create table for storing interview scenarios with evaluation criteria

-- Create enum types
CREATE TYPE scenario_category AS ENUM ('technical', 'commercial', 'presentation', 'problem-solving', 'communication');
CREATE TYPE scenario_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE criteria_type AS ENUM ('semantic', 'emotional', 'fluency', 'relevance', 'timing');

-- Create main scenarios table
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category scenario_category NOT NULL,
    difficulty scenario_difficulty NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0),
    language TEXT NOT NULL DEFAULT 'fr',
    instructions TEXT NOT NULL,
    ai_personality TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create evaluation_criteria table
CREATE TABLE evaluation_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    weight INTEGER NOT NULL CHECK (weight > 0 AND weight <= 100),
    type criteria_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_scenarios_category ON scenarios(category);
CREATE INDEX idx_scenarios_difficulty ON scenarios(difficulty);
CREATE INDEX idx_scenarios_created_by ON scenarios(created_by);
CREATE INDEX idx_scenarios_is_public ON scenarios(is_public);
CREATE INDEX idx_scenarios_is_active ON scenarios(is_active);
CREATE INDEX idx_evaluation_criteria_scenario_id ON evaluation_criteria(scenario_id);

-- Create trigger for updated_at on scenarios
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_scenarios_timestamp
BEFORE UPDATE ON scenarios
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Create trigger for updated_at on evaluation_criteria
CREATE TRIGGER set_evaluation_criteria_timestamp
BEFORE UPDATE ON evaluation_criteria
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Row Level Security (RLS)
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scenarios
CREATE POLICY "Users can view public scenarios" ON scenarios
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own scenarios" ON scenarios
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create scenarios" ON scenarios
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own scenarios" ON scenarios
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own scenarios" ON scenarios
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for evaluation_criteria (based on parent scenario)
CREATE POLICY "Users can view criteria for accessible scenarios" ON evaluation_criteria
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scenarios
            WHERE scenarios.id = evaluation_criteria.scenario_id
            AND (scenarios.is_public = true OR scenarios.created_by = auth.uid())
        )
    );

CREATE POLICY "Users can manage criteria for their scenarios" ON evaluation_criteria
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM scenarios
            WHERE scenarios.id = evaluation_criteria.scenario_id
            AND scenarios.created_by = auth.uid()
        )
    );