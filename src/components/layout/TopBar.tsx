import React from 'react';
import { ActiveView, Workspace, RobotMascotConfig, Category, TabItem } from '../../types';
import { RobotMascot } from '../mascot/RobotMascot';
import { Download, Layers } from 'lucide-react';
import { soundEngine } from '../../services/soundEffects';

interface TopBarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  mascotConfig: RobotMascotConfig;
  activeCategory?: Category;
  activeTab?: TabItem;
  onOpenDownload: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onNavigate,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  mascotConfig,
  activeCategory,
  activeTab,
  onOpenDownload,
}) => {
  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const navItems: { id: ActiveView; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tabs', label: 'Tabs' },
    { id: 'workspaces', label: 'Workspaces' },
    { id: 'categories', label: 'Categories' },
    { id: 'mascot', label: 'Robot Mascot' },
    { id: 'themes', label: 'Themes' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0D12]/80 backdrop-blur-md border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              onNavigate('dashboard');
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0F1420] rounded-[6px] flex items-center justify-center">
                <span className="font-bold text-xs bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  OS
                </span>
              </div>
            </div>
            <span className="text-base font-bold tracking-tight text-white font-sans">
              ChromeOS
            </span>
          </button>
        </div>

        {/* Zone 2: 5 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate(item.id);
                }}
                className={`whitespace-nowrap transition-colors relative py-1 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Companion Quick Hub */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Workspace Switcher */}
          <div className="relative group">
            <select
              value={activeWorkspaceId}
              onChange={(e) => {
                soundEngine.playClick();
                onSelectWorkspace(e.target.value);
              }}
              className="appearance-none bg-slate-900/90 text-xs font-medium text-slate-200 border border-white/10 rounded-lg pl-7 pr-8 py-1.5 cursor-pointer hover:border-purple-500/40 focus:outline-none focus:border-purple-500 transition-colors"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <Layers className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Topbar Mini Robot Mascot (if enabled in tabbar) */}
          {mascotConfig.isEnabled && (
            <div
              onClick={() => {
                soundEngine.playChirp();
                onNavigate('mascot');
              }}
              title="Click to customize Robot Mascot"
              className="cursor-pointer p-0.5 hover:scale-105 transition-transform"
            >
              <RobotMascot
                skin={mascotConfig.skin}
                expression={mascotConfig.expression}
                category={mascotConfig.autoMorphByCategory ? activeCategory : undefined}
                primaryColor={mascotConfig.primaryColor}
                visorGlowColor={mascotConfig.visorGlowColor}
                accentColor={mascotConfig.accentColor}
                animationIntensity={mascotConfig.animationIntensity}
                activeWebsiteName={activeTab ? new URL(activeTab.url || 'https://google.com').hostname : undefined}
                size="sm"
                interactive={false}
              />
            </div>
          )}

          {/* Download Chrome Extension (Packaged Manifest V3) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenDownload();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg shadow-sm transition-all shadow-purple-500/20 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Extension</span>
          </button>
        </div>
      </div>
    </header>
  );
};
