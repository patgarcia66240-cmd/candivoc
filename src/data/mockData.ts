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

export const mockScenarios: Scenario[] = [
  {
    id: '1',
    title: 'Entretien technique React',
    description: 'Simulation d\'un entretien technique pour un poste de développeur React senior. Vous serez évalué sur vos connaissances de React, hooks, state management et meilleures pratiques.',
    category: 'technical',
    difficulty: 'advanced',
    duration: 45,
    language: 'fr',
    instructions: 'Présentez-vous et décrivez votre expérience avec React. Préparez-vous à répondre à des questions techniques et à résoudre des problèmes de code.',
    aiPersonality: 'Un recruteur technique expérimenté, amical mais rigoureux.',
    evaluationCriteria: [
      {
        id: '1',
        name: 'Connaissances React',
        description: 'Maîtrise des concepts fondamentaux de React',
        weight: 30,
        type: 'semantic'
      },
      {
        id: '2',
        name: 'Communication',
        description: 'Clarté et précision des explications techniques',
        weight: 25,
        type: 'semantic'
      },
      {
        id: '3',
        name: 'Résolution de problèmes',
        description: 'Capacité à analyser et résoudre des problèmes',
        weight: 25,
        type: 'relevance'
      },
      {
        id: '4',
        name: 'Fluidité',
        description: 'Aisance dans l\'expression et gestion du stress',
        weight: 20,
        type: 'fluency'
      }
    ],
    createdBy: 'admin',
    isPublic: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    title: 'Vente de solution SaaS',
    description: 'Simulation d\'un appel commercial pour vendre une solution SaaS à un client potentiel. Entraînez-vous à présenter les avantages et à gérer les objections.',
    category: 'commercial',
    difficulty: 'intermediate',
    duration: 30,
    language: 'fr',
    instructions: 'Vous êtes commercial pour une entreprise SaaS. Contactez un prospect et présentez votre solution. Soyez prêt à gérer les objections.',
    aiPersonality: 'Un prospect intéressé mais prudent, qui pose beaucoup de questions.',
    evaluationCriteria: [
      {
        id: '5',
        name: 'Argumentation',
        description: 'Pertinence des arguments commerciaux',
        weight: 35,
        type: 'semantic'
      },
      {
        id: '6',
        name: 'Gestion des objections',
        description: 'Capacité à répondre aux objections',
        weight: 30,
        type: 'relevance'
      },
      {
        id: '7',
        name: 'Écoute active',
        description: 'Capacité à comprendre les besoins du client',
        weight: 20,
        type: 'semantic'
      },
      {
        id: '8',
        name: 'Confiance',
        description: 'Niveau de confiance et assurance',
        weight: 15,
        type: 'emotional'
      }
    ],
    createdBy: 'admin',
    isPublic: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '3',
    title: 'Présentation de projet',
    description: 'Présentez un projet que vous avez réalisé. Cette simulation vous aidera à structurer votre présentation et à répondre aux questions.',
    category: 'presentation',
    difficulty: 'beginner',
    duration: 20,
    language: 'fr',
    instructions: 'Choisissez un projet significatif que vous avez réalisé et présentez-le de manière structurée : contexte, objectifs, méthodologie, résultats.',
    aiPersonality: 'Un manager bienveillant qui s\'intéresse à votre parcours et vos réalisations.',
    evaluationCriteria: [
      {
        id: '9',
        name: 'Structure',
        description: 'Organisation logique de la présentation',
        weight: 30,
        type: 'semantic'
      },
      {
        id: '10',
        name: 'Clarté',
        description: 'Clarté de l\'expression',
        weight: 25,
        type: 'fluency'
      },
      {
        id: '11',
        name: 'Pertinence',
        description: 'Pertinence des informations présentées',
        weight: 25,
        type: 'relevance'
      },
      {
        id: '12',
        name: 'Gestion du temps',
        description: 'Respect du temps imparti',
        weight: 20,
        type: 'timing'
      }
    ],
    createdBy: 'admin',
    isPublic: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '4',
    title: 'Résolution de conflit',
    description: 'Simulation d\'une situation de conflit en équipe. Apprenez à gérer les tensions et à trouver des solutions constructives.',
    category: 'communication',
    difficulty: 'intermediate',
    duration: 25,
    language: 'fr',
    instructions: 'Un conflit a éclaté dans votre équipe. Médiez la situation et proposez des solutions pour apaiser les tensions.',
    aiPersonality: 'Un collègue frustré mais ouvert à la discussion.',
    evaluationCriteria: [
      {
        id: '13',
        name: 'Écoute',
        description: 'Capacité à écouter et comprendre les différents points de vue',
        weight: 30,
        type: 'semantic'
      },
      {
        id: '14',
        name: 'Empathie',
        description: 'Capacité à comprendre les émotions des autres',
        weight: 25,
        type: 'emotional'
      },
      {
        id: '15',
        name: 'Médiation',
        description: 'Capacité à trouver un terrain d\'entente',
        weight: 25,
        type: 'relevance'
      },
      {
        id: '16',
        name: 'Communication',
        description: 'Qualité de la communication verbale',
        weight: 20,
        type: 'fluency'
      }
    ],
    createdBy: 'admin',
    isPublic: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  },
  {
    id: '5',
    title: 'Analyse de cas pratique',
    description: 'Résolvez un problème complexe en expliquant votre raisonnement. Idéal pour les postes d\'analyse et de consulting.',
    category: 'problem-solving',
    difficulty: 'advanced',
    duration: 40,
    language: 'fr',
    instructions: 'Analysez le cas présenté, identifiez les problèmes clés et proposez des solutions structurées avec justifications.',
    aiPersonality: 'Un consultant senior qui évalue votre capacité d\'analyse',
    evaluationCriteria: [
      {
        id: '17',
        name: 'Analyse',
        description: 'Profondeur et pertinence de l\'analyse',
        weight: 35,
        type: 'semantic'
      },
      {
        id: '18',
        name: 'Logique',
        description: 'Cohérence du raisonnement',
        weight: 30,
        type: 'relevance'
      },
      {
        id: '19',
        name: 'Solutions',
        description: 'Qualité et pertinence des solutions proposées',
        weight: 25,
        type: 'semantic'
      },
      {
        id: '20',
        name: 'Structuration',
        description: 'Organisation de la présentation',
        weight: 10,
        type: 'semantic'
      }
    ],
    createdBy: 'admin',
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];