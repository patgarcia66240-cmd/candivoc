-- Migration: Insert mock scenarios data
-- Description: Insert the mock scenarios data into the scenarios table

-- Insert Scenario 1: Entretien technique React
INSERT INTO scenarios (id, title, description, category, difficulty, duration, language, instructions, ai_personality, created_by, is_public, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001',
 'Entretien technique React',
 'Simulation d''un entretien technique pour un poste de développeur React senior. Vous serez évalué sur vos connaissances de React, hooks, state management et meilleures pratiques.',
 'technical',
 'advanced',
 45,
 'fr',
 'Présentez-vous et décrivez votre expérience avec React. Préparez-vous à répondre à des questions techniques et à résoudre des problèmes de code.',
 'Un recruteur technique expérimenté, amical mais rigoureux.',
 NULL,
 true,
 '2024-01-10 00:00:00 UTC',
 '2024-01-10 00:00:00 UTC');

-- Insert evaluation criteria for scenario 1
INSERT INTO evaluation_criteria (id, scenario_id, name, description, weight, type) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Connaissances React', 'Maîtrise des concepts fondamentaux de React', 30, 'semantic'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Communication', 'Clarté et précision des explications techniques', 25, 'semantic'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Résolution de problèmes', 'Capacité à analyser et résoudre des problèmes', 25, 'relevance'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Fluidité', 'Aisance dans l''expression et gestion du stress', 20, 'fluency');

-- Insert Scenario 2: Vente de solution SaaS
INSERT INTO scenarios (id, title, description, category, difficulty, duration, language, instructions, ai_personality, created_by, is_public, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440002',
 'Vente de solution SaaS',
 'Simulation d''un appel commercial pour vendre une solution SaaS à un client potentiel. Entraînez-vous à présenter les avantages et à gérer les objections.',
 'commercial',
 'intermediate',
 30,
 'fr',
 'Vous êtes commercial pour une entreprise SaaS. Contactez un prospect et présentez votre solution. Soyez prêt à gérer les objections.',
 'Un prospect intéressé mais prudent, qui pose beaucoup de questions.',
 NULL,
 true,
 '2024-01-08 00:00:00 UTC',
 '2024-01-08 00:00:00 UTC');

-- Insert evaluation criteria for scenario 2
INSERT INTO evaluation_criteria (id, scenario_id, name, description, weight, type) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'Argumentation', 'Pertinence des arguments commerciaux', 35, 'semantic'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'Gestion des objections', 'Capacité à répondre aux objections', 30, 'relevance'),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 'Écoute active', 'Capacité à comprendre les besoins du client', 20, 'semantic'),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440002', 'Confiance', 'Niveau de confiance et assurance', 15, 'emotional');

-- Insert Scenario 3: Présentation de projet
INSERT INTO scenarios (id, title, description, category, difficulty, duration, language, instructions, ai_personality, created_by, is_public, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440003',
 'Présentation de projet',
 'Présentez un projet que vous avez réalisé. Cette simulation vous aidera à structurer votre présentation et à répondre aux questions.',
 'presentation',
 'beginner',
 20,
 'fr',
 'Choisissez un projet significatif que vous avez réalisé et présentez-le de manière structurée : contexte, objectifs, méthodologie, résultats.',
 'Un manager bienveillant qui s''intéresse à votre parcours et vos réalisations.',
 NULL,
 true,
 '2024-01-05 00:00:00 UTC',
 '2024-01-05 00:00:00 UTC');

-- Insert evaluation criteria for scenario 3
INSERT INTO evaluation_criteria (id, scenario_id, name, description, weight, type) VALUES
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440003', 'Structure', 'Organisation logique de la présentation', 30, 'semantic'),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440003', 'Clarté', 'Clarté de l''expression', 25, 'fluency'),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440003', 'Pertinence', 'Pertinence des informations présentées', 25, 'relevance'),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440003', 'Gestion du temps', 'Respect du temps imparti', 20, 'timing');

-- Insert Scenario 4: Résolution de conflit
INSERT INTO scenarios (id, title, description, category, difficulty, duration, language, instructions, ai_personality, created_by, is_public, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440004',
 'Résolution de conflit',
 'Simulation d''une situation de conflit en équipe. Apprenez à gérer les tensions et à trouver des solutions constructives.',
 'communication',
 'intermediate',
 25,
 'fr',
 'Un conflit a éclaté dans votre équipe. Médiez la situation et proposez des solutions pour apaiser les tensions.',
 'Un collègue frustré mais ouvert à la discussion.',
 NULL,
 true,
 '2024-01-03 00:00:00 UTC',
 '2024-01-03 00:00:00 UTC');

-- Insert evaluation criteria for scenario 4
INSERT INTO evaluation_criteria (id, scenario_id, name, description, weight, type) VALUES
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440004', 'Écoute', 'Capacité à écouter et comprendre les différents points de vue', 30, 'semantic'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440004', 'Empathie', 'Capacité à comprendre les émotions des autres', 25, 'emotional'),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440004', 'Médiation', 'Capacité à trouver un terrain d''entente', 25, 'relevance'),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440004', 'Communication', 'Qualité de la communication verbale', 20, 'fluency');

-- Insert Scenario 5: Analyse de cas pratique
INSERT INTO scenarios (id, title, description, category, difficulty, duration, language, instructions, ai_personality, created_by, is_public, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440005',
 'Analyse de cas pratique',
 'Résolvez un problème complexe en expliquant votre raisonnement. Idéal pour les postes d''analyse et de consulting.',
 'problem-solving',
 'advanced',
 40,
 'fr',
 'Analysez le cas présenté, identifiez les problèmes clés et proposez des solutions structurées avec justifications.',
 'Un consultant senior qui évalue votre capacité d''analyse',
 NULL,
 true,
 '2024-01-01 00:00:00 UTC',
 '2024-01-01 00:00:00 UTC');

-- Insert evaluation criteria for scenario 5
INSERT INTO evaluation_criteria (id, scenario_id, name, description, weight, type) VALUES
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440005', 'Analyse', 'Profondeur et pertinence de l''analyse', 35, 'semantic'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440005', 'Logique', 'Cohérence du raisonnement', 30, 'relevance'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440005', 'Solutions', 'Qualité et pertinence des solutions proposées', 25, 'semantic'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440005', 'Structuration', 'Organisation de la présentation', 10, 'semantic');