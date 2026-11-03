import React, { useState, useEffect } from 'react';
import {
  TabItem,
  Category,
  Workspace,
  RobotMascotConfig,
  ThemeSettings,
  ActiveView,
} from '../../types';
import { RobotMascot } from '../mascot/RobotMascot';
import {
  Search,
  ExternalLink,
  Plus,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Layers,
  ArrowUpRight,
  Pin,
  FileText,
} from 'lucide-react';
import { soundEngine } from '../../services/soundEffects';

interface DashboardViewProps {
  tabs: TabItem[];
  categories: Category[];
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  mascotConfig: RobotMascotConfig;
  themeSettings: ThemeSettings;
  onNavigate: (view: ActiveView) => void;
  onOpenTab: (url: string) => void;
  onCloseTab: (id: string) => void;
}

const SEARCH_ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { id: 'perplexity', name: 'Perplexity AI', url: 'https://www.perplexity.ai/search?q=' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=' },
  { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  tabs,
  categories,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  mascotConfig,
  themeSettings,
  onNavigate,
  onOpenTab,
}) => {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState(themeSettings.searchEngine || 'google');
  const [weather, setWeather] = useState<{ temp: number; humidity: number; wind: number; code: number } | null>(null);
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem('chromeos_scratchpad') || 'Welcome to ChromeOS. Tabs are categorized automatically. Customize your mascot anytime!';
  });
  const [newTabUrl, setNewTabUrl] = useState('');
  const [showAddTabModal, setShowAddTabModal] = useState(false);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather');
        if (res.ok) {
          const data = await res.json();
          if (data.current) {
            setWeather({
              temp: Math.round(data.current.temperature_2m),
              humidity: data.current.relative_humidity_2m,
              wind: Math.round(data.current.wind_speed_10m),
              code: data.current.weather_code,
            });
          }
        }
      } catch {
        setWeather({ temp: 22, humidity: 55, wind: 14, code: 1 });
      }
    };
    fetchWeather();
  }, []);

  // Save scratchpad
  const handleScratchpadChange = (text: string) => {
    setScratchpad(text);
    localStorage.setItem('chromeos_scratchpad', text);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    soundEngine.playClick();
    const query = searchQuery.trim();

    // Check if user entered direct URL
    if (query.includes('.') && !query.includes(' ') && (query.startsWith('http') || query.includes('/'))) {
      const target = query.startsWith('http') ? query : `https://${query}`;
      onOpenTab(target);
      return;
    }

    const engine = SEARCH_ENGINES.find((s) => s.id === selectedEngine) || SEARCH_ENGINES[0];
    onOpenTab(`${engine.url}${encodeURIComponent(query)}`);
  };

  // Greeting based on hour
  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const timeFormatted = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !themeSettings.clockFormat24h,
  });

  const dateFormatted = time.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const workspaceTabs = tabs.filter((t) => t.workspaceId === activeWorkspaceId || !t.workspaceId);
  const activeTab = workspaceTabs.find((t) => t.active) || workspaceTabs[0];
  const activeCategory = categories.find((c) => c.id === activeTab?.categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Hero Header: Clock, Date, Weather & Greeting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Clock & Greeting Hub */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold font-mono">
                Workspace Active · {activeWorkspace.name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-sans tracking-tight">
                {greeting}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {dateFormatted} · {workspaceTabs.length} open tabs synchronized
              </p>
            </div>

            {/* Weather Widget */}
            {themeSettings.showWeather && weather && (
              <div className="hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-right">
                {weather.code <= 2 ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : weather.code <= 48 ? (
                  <Cloud className="w-5 h-5 text-slate-300" />
                ) : (
                  <CloudRain className="w-5 h-5 text-cyan-400" />
                )}
                <div>
                  <div className="text-sm font-bold text-white font-mono tabular-nums">
                    {weather.temp}°C
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Wind className="w-2.5 h-2.5" /> {weather.wind} km/h
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Futuristic Big Tabular Clock */}
          <div className="my-6">
            <div className="text-5xl sm:text-7xl font-extrabold text-white font-mono tabular-nums tracking-tighter drop-shadow-lg">
              {timeFormatted}
            </div>
          </div>

          {/* Unified Smart Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search the web or type a URL (using ${SEARCH_ENGINES.find((e) => e.id === selectedEngine)?.name})...`}
                className="w-full bg-[#080B11]/90 text-slate-100 placeholder:text-slate-500 rounded-2xl pl-12 pr-36 py-3.5 text-sm border border-white/10 focus:outline-none focus:border-purple-500/80 transition-all shadow-inner"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value as any)}
                  className="bg-[#141824] text-xs text-slate-300 border border-white/10 rounded-xl px-2.5 py-1.5 cursor-pointer hover:border-purple-400 focus:outline-none"
                >
                  {SEARCH_ENGINES.map((engine) => (
                    <option key={engine.id} value={engine.id}>
                      {engine.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Go
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Mascot Interactive Companion Card */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 flex flex-col justify-between border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-wide">{mascotConfig.name}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                Mascot
              </span>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                onNavigate('mascot');
              }}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Customize
            </button>
          </div>

          {/* Interactive Mascot Visual */}
          <div className="py-4 flex flex-col items-center justify-center">
            <RobotMascot
              skin={mascotConfig.skin}
              expression={mascotConfig.expression}
              category={mascotConfig.autoMorphByCategory ? activeCategory : undefined}
              primaryColor={mascotConfig.primaryColor}
              visorGlowColor={mascotConfig.visorGlowColor}
              accentColor={mascotConfig.accentColor}
              animationIntensity={mascotConfig.animationIntensity}
              size="lg"
              showSpeechBubble={mascotConfig.speechBubbleEnabled}
              interactive={true}
              speechText={
                activeCategory
                  ? `${activeCategory.name} Mode Active`
                  : 'Workspace ready'
              }
            />
          </div>

          {/* Mascot Info & Category Status */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Morph State</span>
              <span className="font-semibold text-white" style={{ color: activeCategory?.color }}>
                {activeCategory?.name || 'Standard'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Tab</span>
              <span className="text-slate-200 truncate max-w-[160px] font-mono text-[11px]">
                {activeTab ? new URL(activeTab.url || 'https://google.com').hostname : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch & Category Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Quick Workspaces & Categories
          </h2>
          <button
            onClick={() => {
              soundEngine.playClick();
              onNavigate('tabs');
            }}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
          >
            Open Tab Manager <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {categories.slice(0, 10).map((cat) => {
            const count = tabs.filter((t) => t.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate('tabs');
                }}
                className="glass-panel p-4 rounded-2xl cursor-pointer hover:border-purple-500/40 hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs font-mono tabular-nums text-slate-400 group-hover:text-white">
                    {count} {count === 1 ? 'tab' : 'tabs'}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-white truncate font-sans">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {cat.rules.length} domain rules
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Tabs Strip & Quick Scratchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Open Tabs in this Workspace */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Active Browser Tabs</h2>
              <p className="text-xs text-slate-400">
                Categorized tabs currently loaded in {activeWorkspace.name}
              </p>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowAddTabModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold border border-purple-500/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Tab
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workspaceTabs.map((tab) => {
              const cat = categories.find((c) => c.id === tab.categoryId);
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenTab(tab.url);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    tab.active
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-md shadow-purple-500/10'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={tab.favicon || `https://www.google.com/s2/favicons?domain=${new URL(tab.url || 'https://google.com').hostname}&sz=64`}
                      alt=""
                      className="w-5 h-5 rounded shrink-0 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                        {tab.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span style={{ color: cat?.color }}>{cat?.name || 'General'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[10px] truncate max-w-[120px]">
                          {new URL(tab.url || 'https://google.com').hostname}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {tab.pinned && <Pin className="w-3.5 h-3.5 text-amber-400" />}
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scratchpad & Browser Notes */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Browser Scratchpad
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Local Sync</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Jot notes, URLs, or prompts. Saved instantly to your browser storage.
            </p>
            <textarea
              value={scratchpad}
              onChange={(e) => handleScratchpadChange(e.target.value)}
              rows={8}
              placeholder="Paste notes, scratch code, or quick reminders..."
              className="w-full bg-[#080B11]/90 text-xs text-slate-200 p-3 rounded-2xl border border-white/10 focus:outline-none focus:border-purple-500 font-mono resize-none"
            />
          </div>

          <div className="pt-3 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>{scratchpad.length} characters</span>
            <button
              onClick={() => handleScratchpadChange('')}
              className="hover:text-rose-400 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Add Tab Modal */}
      {showAddTabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Open New Tab</h3>
            <p className="text-xs text-slate-400">
              Enter any URL or domain. ChromeOS will automatically categorize it and trigger the robot mascot!
            </p>
            <input
              type="text"
              value={newTabUrl}
              onChange={(e) => setNewTabUrl(e.target.value)}
              placeholder="e.g. https://github.com or figma.com"
              className="w-full bg-[#0A0E17] text-sm text-slate-100 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddTabModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newTabUrl.trim()) {
                    const formatted = newTabUrl.startsWith('http') ? newTabUrl.trim() : `https://${newTabUrl.trim()}`;
                    onOpenTab(formatted);
                    setNewTabUrl('');
                    setShowAddTabModal(false);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl"
              >
                Open & Categorize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
