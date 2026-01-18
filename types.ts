export enum GameState {
  START_SCREEN,
  FACTION_SELECTION,
  PLAYING,
  LOADING,
  ERROR,
  GAME_OVER,
}

export interface StoryTurn {
  id: number;
  scene: string;
  choices: string[];
  imageUrl: string | null;
  imageState: 'loading' | 'loaded' | 'error';
  ending: 'tyrannical' | 'stagnation' | 'awakening' | null;
  intensity: 'low' | 'medium' | 'high';
}

export interface LoreEntry {
  id: string;
  category: string;
  category_fr: string;
  title: string;
  title_fr: string;
  content: string;
  content_fr: string;
}

export interface GeminiResponse {
  scene: string;
  choices: string[];
  ending: 'tyrannical' | 'stagnation' | 'awakening' | null;
  unlockedLore?: string[];
  intensity: 'low' | 'medium' | 'high';
}

export interface Faction {
  id: string;
  name: string;
}