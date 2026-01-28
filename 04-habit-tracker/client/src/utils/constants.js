export const API_URL = import.meta.env.VITE_API_URL || '';

export const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
];

export const ICONS = [
  { id: 'check', label: 'Check', emoji: '✓' },
  { id: 'fire', label: 'Fire', emoji: '🔥' },
  { id: 'star', label: 'Star', emoji: '⭐' },
  { id: 'heart', label: 'Heart', emoji: '❤️' },
  { id: 'book', label: 'Book', emoji: '📚' },
  { id: 'gym', label: 'Gym', emoji: '💪' },
  { id: 'water', label: 'Water', emoji: '💧' },
  { id: 'sleep', label: 'Sleep', emoji: '😴' },
  { id: 'meditate', label: 'Meditate', emoji: '🧘' },
  { id: 'walk', label: 'Walk', emoji: '🚶' },
  { id: 'code', label: 'Code', emoji: '💻' },
  { id: 'music', label: 'Music', emoji: '🎵' },
];

export const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Every Day', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'weekdays', label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { id: 'weekends', label: 'Weekends', days: [0, 6] },
  { id: 'custom', label: 'Custom', days: null },
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
