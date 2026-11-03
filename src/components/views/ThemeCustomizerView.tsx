import React, { useState } from 'react';
import { ThemeSettings } from '../../types';
import {
  Palette,
  Sun,
  Moon,
  Image,
  Sliders,
  Check,
  Search,
  Clock,
  Sparkles,
} from 'lucide-react';
import { soundEngine } from '../../services/soundEffects';

interface ThemeCustomizerViewProps {
  theme: ThemeSettings;
  onUpdateTheme: (newTheme: ThemeSettings) => void;
}

const PRESET_THEMES: {
  id: ThemeSettings['preset'];
  name: string;
  bg: string;
  accent: string;
  desc: string;
}[] = [
  {
    id: 'deep_space',
    name: 'Deep Space',
    bg: '#0B0D12',
    accent: '#8B5CF6',
    desc: 'Default futuristic dark slate aesthetic with violet quantum accents.',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Obsidian',
    bg: '#05070B',
    accent: '#06B6D4',
    desc: 'High-contrast nocturnal cockpit with cyan laser lines.',
  },
  {
    id: 'aurora',
    name: 'Aurora Glass',
    bg: '#0D111A',
    accent: '#10B981',
    desc: 'Deep boreal emerald with layered translucent glass surfaces.',
  },
  {
    id: 'minimal_carbon',
    name: 'Minimal Carbon',
    bg: '#111317',
    accent: '#94A3B8',
    desc: 'Monochrome executive styling with subtle slate hairline borders.',
  },
  {
    id: 'clean_slate',
    name: 'Clean Slate',
    bg: '#161922',
    accent: '#3B82F6',
    desc: 'Modern developer workstation palette with indigo highlights.',
  },
];

const WALLPAPERS = [
  {
    id: 'wall-nebula',
    name: 'Quantum Nebula',
    css: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.25) 0%, rgba(11, 13, 18, 0.95) 70%)',
  },
  {
    id: 'wall-cybergrid',
    name: 'Cyber Mesh',
    css: 'radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.2) 0%, rgba(5, 7, 11, 0.98) 80%)',
  },
  {
    id: 'wall-aurora',
    name: 'Boreal Aurora',
    css: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(11, 13, 18, 1) 100%)',
  },
  {
    id: 'wall-sunset',
    name: 'Solar Horizon',
    css: 'radial-gradient(circle at top right, rgba(244, 63, 94, 0.18) 0%, rgba(15, 20, 32, 0.95) 75%)',
  },
  {
    id: 'wall-darkmatter',
    name: 'Void Minimal',
    css: 'linear-gradient(180deg, rgba(20, 24, 33, 0.6) 0%, rgba(11, 13, 18, 1) 100%)',
  },
];

const ACCENT_COLORS = [
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F43F5E', // Rose
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#A3E635', // Lime
];

export const ThemeCustomizerView: React.FC<ThemeCustomizerViewProps> = ({
  theme,
  onUpdateTheme,
}) => {
  const [localTheme, setLocalTheme] = useState<ThemeSettings>({ ...theme });

  const update = (patch: Partial<ThemeSettings>) => {
    const next = { ...localTheme, ...patch };
    setLocalTheme(next);
    onUpdateTheme(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold font-mono">
            Aesthetic Configuration
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Theme & Glassmorphism</h1>
          <p className="text-xs text-slate-400">
            Customize system presets, dynamic wallpapers, glass opacity, and search engines
          </p>
        </div>

        {/* Light / Dark Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/10">
          <button
            onClick={() => {
              soundEngine.playClick();
              update({ mode: 'dark' });
              document.documentElement.classList.add('dark');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              localTheme.mode === 'dark'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark OS</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              update({ mode: 'light' });
              document.documentElement.classList.remove('dark');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              localTheme.mode === 'light'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light OS</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Preset Themes and Wallpapers */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset System Themes */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              Futuristic OS Themes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_THEMES.map((preset) => {
                const isSelected = localTheme.preset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      soundEngine.playClick();
                      update({ preset: preset.id, accentColor: preset.accent });
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/25 ring-1 ring-purple-500/50 shadow-md'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-3.5 rounded-md"
                          style={{ backgroundColor: preset.accent }}
                        />
                        <span className="text-xs font-bold text-white">{preset.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">{preset.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wallpaper Selection */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Image className="w-4 h-4 text-cyan-400" />
              Dynamic Wallpapers & Gradients
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {WALLPAPERS.map((wall) => {
                const isSelected = localTheme.wallpaperId === wall.id;
                return (
                  <div
                    key={wall.id}
                    onClick={() => {
                      soundEngine.playClick();
                      update({ wallpaperId: wall.id });
                    }}
                    className={`h-24 rounded-2xl border cursor-pointer p-3 flex flex-col justify-between relative overflow-hidden transition-all ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/40'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ background: wall.css }}
                  >
                    <span className="text-xs font-semibold text-white drop-shadow">
                      {wall.name}
                    </span>
                    {isSelected && (
                      <span className="self-end text-[10px] font-mono bg-cyan-500/30 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-400/40">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Image URL input */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Custom Wallpaper Image URL (Optional)
              </label>
              <input
                type="text"
                value={localTheme.customWallpaperUrl || ''}
                onChange={(e) => update({ customWallpaperUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... or your custom hosted image"
                className="w-full bg-[#080B12] text-xs text-slate-200 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Accent, Glassmorphism & Dashboard Layout */}
        <div className="lg:col-span-5 space-y-6">
          {/* Accent Color Palette */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Accent Lighting
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {ACCENT_COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => {
                    soundEngine.playClick();
                    update({ accentColor: col });
                  }}
                  className={`w-9 h-9 rounded-xl transition-transform ${
                    localTheme.accentColor === col ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          {/* Glassmorphism & Blur Sliders */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Glassmorphism Controls
            </h2>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Backdrop Blur</span>
                <span className="font-mono text-slate-400">{localTheme.blurIntensity}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={localTheme.blurIntensity}
                onChange={(e) => update({ blurIntensity: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Panel Opacity</span>
                <span className="font-mono text-slate-400">
                  {Math.round(localTheme.glassOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                value={Math.round(localTheme.glassOpacity * 100)}
                onChange={(e) => update({ glassOpacity: parseInt(e.target.value, 10) / 100 })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* New Tab Widgets Preferences */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              Dashboard Preferences
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Default Search Engine
                </label>
                <select
                  value={localTheme.searchEngine}
                  onChange={(e) => update({ searchEngine: e.target.value as any })}
                  className="w-full bg-[#080B12] text-xs text-slate-200 p-2.5 rounded-xl border border-white/10"
                >
                  <option value="google">Google Search</option>
                  <option value="duckduckgo">DuckDuckGo (Privacy)</option>
                  <option value="perplexity">Perplexity AI</option>
                  <option value="youtube">YouTube</option>
                  <option value="github">GitHub</option>
                  <option value="bing">Microsoft Bing</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={localTheme.clockFormat24h}
                  onChange={(e) => update({ clockFormat24h: e.target.checked })}
                  className="accent-purple-500 w-4 h-4"
                />
                <span className="text-slate-200">24-Hour Digital Clock</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localTheme.showWeather}
                  onChange={(e) => update({ showWeather: e.target.checked })}
                  className="accent-purple-500 w-4 h-4"
                />
                <span className="text-slate-200">Show Local Weather & Wind Telemetry</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
