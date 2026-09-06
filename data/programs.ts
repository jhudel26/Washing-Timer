import { WashingProgram } from '@/types/programs';

export const washingPrograms: WashingProgram[] = [
  {
    id: 'cotton',
    name: 'Cotton',
    icon: '👕',
    duration: 105, // 1h 45m
    temperature: 40,
    spinSpeed: 1200,
    description: 'Standard wash for cotton fabrics',
    stages: [
      { name: 'Wash', duration: 55 },
      { name: 'Rinse', duration: 35 },
      { name: 'Spin', duration: 15 },
    ],
  },
  {
    id: 'eco-40-60',
    name: 'Eco 40-60',
    icon: '🌿',
    duration: 180, // 3h
    temperature: 40,
    spinSpeed: 1000,
    description: 'Energy-efficient cotton cycle',
    stages: [
      { name: 'Wash', duration: 90 },
      { name: 'Rinse', duration: 60 },
      { name: 'Spin', duration: 30 },
    ],
  },
  {
    id: 'mixed',
    name: 'Mixed',
    icon: '👔',
    duration: 60, // 1h
    temperature: 30,
    spinSpeed: 1000,
    description: 'For mixed fabric types',
    stages: [
      { name: 'Wash', duration: 35 },
      { name: 'Rinse', duration: 20 },
      { name: 'Spin', duration: 5 },
    ],
  },
  {
    id: 'synthetics',
    name: 'Synthetics',
    icon: '🧵',
    duration: 50, // 50 min
    temperature: 40,
    spinSpeed: 800,
    description: 'For synthetic fabrics',
    stages: [
      { name: 'Wash', duration: 30 },
      { name: 'Rinse', duration: 15 },
      { name: 'Spin', duration: 5 },
    ],
  },
  {
    id: 'delicates',
    name: 'Delicates',
    icon: '🧦',
    duration: 45, // 45 min
    temperature: 30,
    spinSpeed: 600,
    description: 'Gentle wash for delicate items',
    stages: [
      { name: 'Wash', duration: 30 },
      { name: 'Rinse', duration: 15 },
    ],
  },
  {
    id: 'quick-wash',
    name: 'Quick Wash',
    icon: '⚡',
    duration: 30, // 30 min
    temperature: 30,
    spinSpeed: 800,
    description: 'Fast wash for lightly soiled items',
    stages: [
      { name: 'Wash', duration: 15 },
      { name: 'Rinse', duration: 10 },
      { name: 'Spin', duration: 5 },
    ],
  },
  {
    id: 'heavy-duty',
    name: 'Heavy Duty',
    icon: '🛏️',
    duration: 120, // 2h
    temperature: 60,
    spinSpeed: 1400,
    description: 'Intensive wash for heavily soiled items',
    stages: [
      { name: 'Wash', duration: 70 },
      { name: 'Rinse', duration: 35 },
      { name: 'Spin', duration: 15 },
    ],
  },
  {
    id: 'bedding',
    name: 'Bedding',
    icon: '🛌',
    duration: 90, // 1h 30m
    temperature: 40,
    spinSpeed: 1000,
    description: 'For sheets and bedding',
    stages: [
      { name: 'Wash', duration: 50 },
      { name: 'Rinse', duration: 30 },
      { name: 'Spin', duration: 10 },
    ],
  },
  {
    id: 'towels',
    name: 'Towels',
    icon: '🧖',
    duration: 75, // 1h 15m
    temperature: 60,
    spinSpeed: 1200,
    description: 'For towels and bath textiles',
    stages: [
      { name: 'Wash', duration: 45 },
      { name: 'Rinse', duration: 25 },
      { name: 'Spin', duration: 5 },
    ],
  },
  {
    id: 'baby-care',
    name: 'Baby Care',
    icon: '👶',
    duration: 90, // 1h 30m
    temperature: 40,
    spinSpeed: 1000,
    description: 'Extra gentle wash for baby clothes',
    stages: [
      { name: 'Wash', duration: 50 },
      { name: 'Rinse', duration: 30 },
      { name: 'Spin', duration: 10 },
    ],
  },
  {
    id: 'rinse-spin',
    name: 'Rinse + Spin',
    icon: '💧',
    duration: 20, // 20 min
    temperature: 30,
    spinSpeed: 1200,
    description: 'Rinse and spin only',
    stages: [
      { name: 'Rinse', duration: 15 },
      { name: 'Spin', duration: 5 },
    ],
  },
  {
    id: 'spin-only',
    name: 'Spin Only',
    icon: '🌀',
    duration: 10, // 10 min
    temperature: 30,
    spinSpeed: 1400,
    description: 'Spin cycle only',
    stages: [
      { name: 'Spin', duration: 10 },
    ],
  },
  {
    id: 'tub-clean',
    name: 'Tub Clean',
    icon: '🧹',
    duration: 90, // 1h 30m
    temperature: 60,
    spinSpeed: 0,
    description: 'Clean the washing machine drum',
    stages: [
      { name: 'Cleaning', duration: 90 },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '⏱️',
    duration: 60, // Default 1 hour
    temperature: 30,
    spinSpeed: 800,
    description: 'Custom timer duration',
    stages: [
      { name: 'Custom', duration: 60 },
    ],
  },
];

export const getProgramById = (id: string): WashingProgram | undefined => {
  return washingPrograms.find(program => program.id === id);
};

export const getProgramByIndex = (index: number): WashingProgram => {
  return washingPrograms[index % washingPrograms.length];
};