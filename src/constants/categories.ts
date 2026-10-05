import { Category } from '@/types';

export interface CategoryInfo {
  name: Category;
  emoji: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { name: 'Maize', emoji: '🌽', description: 'White and yellow maize varieties' },
  { name: 'Sorghum', emoji: '🌿', description: 'Red and brown sorghum' },
  { name: 'Millet', emoji: '🌾', description: 'Finger millet (Wimbi) and pearl millet' },
  { name: 'Wheat', emoji: '🌾', description: 'Wheat grain and flour-grade wheat' },
  { name: 'Legumes', emoji: '🫘', description: 'Green grams, cowpeas, beans' },
  { name: 'Oil Seeds', emoji: '🌻', description: 'Sunflower, sesame, groundnuts' },
  { name: 'Rice', emoji: '🍚', description: 'Pishori, Basmati, and local varieties' },
  { name: 'Barley', emoji: '🌾', description: 'Malting and feed barley' },
];

export const CATEGORY_EMOJIS: Record<Category, string> = {
  'Maize': '🌽',
  'Sorghum': '🌿',
  'Millet': '🌾',
  'Wheat': '🌾',
  'Legumes': '🫘',
  'Oil Seeds': '🌻',
  'Rice': '🍚',
  'Barley': '🌾',
};
