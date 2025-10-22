-- Migration: Add content fields to scenarios table
-- Description: Add context, mise_en_situation, questions_typiques, objectifs fields

-- Add new content fields to scenarios table
ALTER TABLE scenarios
ADD COLUMN context TEXT,
ADD COLUMN mise_en_situation TEXT,
ADD COLUMN questions_typiques TEXT,
ADD COLUMN objectifs TEXT;

-- Add comments for documentation
COMMENT ON COLUMN scenarios.context IS 'Contexte général du scénario d''entretien';
COMMENT ON COLUMN scenarios.mise_en_situation IS 'Description détaillée de la situation de l''entretien';
COMMENT ON COLUMN scenarios.questions_typiques IS 'Types de questions typiques pour ce scénario';
COMMENT ON COLUMN scenarios.objectifs IS 'Objectifs d''apprentissage du scénario';