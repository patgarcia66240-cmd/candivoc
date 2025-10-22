-- Migration: Update scenarios with detailed content
-- Description: Update existing scenarios with context, mise_en_situation, questions_typiques, objectifs

-- Update Scenario 1: Entretien technique React
UPDATE scenarios
SET
    context = 'Vous êtes développeur React senior et vous passez un entretien pour un poste de Lead Developer.',
    mise_en_situation = 'L''entreprise recherche quelqu''un pour diriger une équipe de 5 développeurs sur un projet de plateforme e-commerce.',
    questions_typiques = 'Préparez-vous à parler de votre expérience avec React, votre approche du leadership technique, et comment vous gérez les défis d''équipe.',
    objectifs = 'Démontrez votre expertise technique, vos qualités de leadership, et votre capacité à résoudre des problèmes complexes.'
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- Update Scenario 2: Vente de solution SaaS
UPDATE scenarios
SET
    context = 'Simulation d''un appel commercial pour vendre une solution SaaS à un client potentiel.',
    mise_en_situation = 'Un prospect intéressé mais prudent, qui pose beaucoup de questions.',
    questions_typiques = 'Préparez-vous à présenter les avantages et à gérer les objections.',
    objectifs = 'Entraînez-vous à présenter les avantages et à gérer les objections.'
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Update Scenario 3: Présentation de projet
UPDATE scenarios
SET
    context = 'Présentez un projet que vous avez réalisé.',
    mise_en_situation = 'Un manager bienveillant qui s''intéresse à votre parcours et vos réalisations.',
    questions_typiques = 'Choisissez un projet significatif que vous avez réalisé et présentez-le de manière structurée : contexte, objectifs, méthodologie, résultats.',
    objectifs = 'Cette simulation vous aidera à structurer votre présentation et à répondre aux questions.'
WHERE id = '550e8400-e29b-41d4-a716-446655440003';

-- Update Scenario 4: Résolution de conflit
UPDATE scenarios
SET
    context = 'Simulation d''une situation de conflit en équipe.',
    mise_en_situation = 'Un collègue frustré mais ouvert à la discussion.',
    questions_typiques = 'Un conflit a éclaté dans votre équipe. Médiez la situation et proposez des solutions pour apaiser les tensions.',
    objectifs = 'Apprenez à gérer les tensions et à trouver des solutions constructives.'
WHERE id = '550e8400-e29b-41d4-a716-446655440004';

-- Update Scenario 5: Analyse de cas pratique
UPDATE scenarios
SET
    context = 'Résolvez un problème complexe en expliquant votre raisonnement.',
    mise_en_situation = 'Un consultant senior qui évalue votre capacité d''analyse',
    questions_typiques = 'Analysez le cas présenté, identifiez les problèmes clés et proposez des solutions structurées avec justifications.',
    objectifs = 'Idéal pour les postes d''analyse et de consulting.'
WHERE id = '550e8400-e29b-41d4-a716-446655440005';