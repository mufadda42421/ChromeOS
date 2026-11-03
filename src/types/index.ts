export type CategoryId =
  | 'ai'
  | 'development'
  | 'design'
  | 'communication'
  | 'entertainment'
  | 'shopping'
  | 'research'
  | 'education'
  | 'finance'
  | 'social'
  | string;

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  color: string; // e.g. '#8B5CF6'
  bgGradient: string; // e.g. 'from-purple-500/20 to-indigo-500/10'
  icon: string; // Lucide icon name
  mascotMood: RobotExpression;
  mascotOverlay: 'ai' | 'dev' | 'design' | 'entertainment' | 'shopping' | 'communication' | 'research' | 'finance' | 'default';
  rules: string[]; // Domain patterns e.g. ['github.com', 'gitlab.com']
  isBuiltIn: boolean;
}

export interface TabItem {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  categoryId: CategoryId;
  pinned: boolean;
  muted: boolean;
  active: boolean;
  workspaceId: string;
  lastAccessed: number;
  previewUrl?: string;
}

export type RobotSkin =
  | 'cyber'
  | 'cute'
  | 'minimal'
  | 'neon'
  | 'retro'
  | 'professional';

export type RobotExpression =
  | 'happy'
  | 'focused'
  | 'alert'
  | 'chill'
  | 'turbo'
  | 'zen'
  | 'wink';

export type MascotPosition = 'tabbar' | 'floating' | 'sidebar' | 'dashboard';

export interface RobotMascotConfig {
  isEnabled: boolean;
  name: string;
  skin: RobotSkin;
  expression: RobotExpression;
  primaryColor: string;
  visorGlowColor: string;
  accentColor: string;
  animationIntensity: 'calm' | 'dynamic' | 'hyper' | 'off';
  autoMorphByCategory: boolean;
  soundEffectsEnabled: boolean;
  speechBubbleEnabled: boolean;
  position: MascotPosition;
  customImageUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  mascotSkinOverride?: RobotSkin;
  accentColorOverride?: string;
  created: number;
}

export interface ThemeSettings {
  mode: 'dark' | 'light';
  preset: 'deep_space' | 'cyberpunk' | 'aurora' | 'minimal_carbon' | 'clean_slate';
  accentColor: string;
  wallpaperId: string;
  customWallpaperUrl?: string;
  blurIntensity: number; // 0-30 px
  glassOpacity: number; // 0.3-0.95
  animationIntensity: 'minimal' | 'balanced' | 'energetic' | 'off';
  searchEngine: 'google' | 'duckduckgo' | 'perplexity' | 'bing' | 'youtube' | 'github';
  clockFormat24h: boolean;
  showWeather: boolean;
  showQuickShortcuts: boolean;
}

export interface SessionSnapshot {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: number;
  tabs: TabItem[];
  tags: string[];
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  folder: string;
  categoryId: CategoryId;
  createdAt: number;
}

export interface UserPrivacySettings {
  localOnly: boolean;
  allowAIClassification: boolean;
  anonymizeData: boolean;
}

export interface UserSettings {
  activeWorkspaceId: string;
  theme: ThemeSettings;
  mascot: RobotMascotConfig;
  privacy: UserPrivacySettings;
  onboardingCompleted: boolean;
}

export type ActiveView =
  | 'dashboard'
  | 'tabs'
  | 'categories'
  | 'workspaces'
  | 'mascot'
  | 'themes'
  | 'bookmarks'
  | 'sessions'
  | 'settings';
