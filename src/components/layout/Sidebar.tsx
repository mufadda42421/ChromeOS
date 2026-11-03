import React from 'react';
import { ActiveView, Category, TabItem, RobotMascotConfig } from '../../types';
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  Briefcase,
  Bot,
  Palette,
  Bookmark,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { soundEngine } from '../../services/soundEffects';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  categories: Category[];
  tabs: TabItem[];
  mascotConfig: RobotMascotConfig;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  categories,
  tabs,
  mascotConfig,
}) => {
  const menuItems: { id: ActiveView; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'New Tab Dashboard', icon: LayoutDashboard },
    { id: 'tabs', label: 'Tab Manager', icon: Layers, badge: tabs.length },
    { id: 'workspaces', label: 'Workspaces', icon: Briefcase },
    { id: 'categories', label: 'Categories', icon: FolderTree, badge: categories.length },
    { id: 'mascot', label: 'Robot Mascot', icon: Bot },
    { id: 'themes', label: 'Themes & Wallpapers', icon: Palette },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'sessions', label: 'Tab Sessions', icon: History },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings },
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col justify-between bg-[#0F1420]/90 backdrop-blur-xl border-r border-white/[0.08] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div className="p-3">
        {/* Toggle Collapse Button */}
        <div className={`flex items-center mb-4 ${collapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!collapsed && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Navigation
              </span>
            </div>
          )}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleCollapse();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate(item.id);
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && typeof item.badge === 'number' && (
                  <span className="text-[10px] font-mono tabular-nums text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mascot Teaser & Info */}
      {!collapsed ? (
        <div className="p-3 border-t border-white/[0.08]">
          <div
            onClick={() => {
              soundEngine.playChirp();
              onNavigate('mascot');
            }}
            className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 cursor-pointer hover:border-purple-500/40 transition-all flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white truncate">{mascotConfig.name}</span>
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
              </div>
              <span className="text-[11px] text-slate-400 block truncate">
                {mascotConfig.skin} skin active
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 flex justify-center border-t border-white/[0.08]">
          <button
            onClick={() => {
              soundEngine.playChirp();
              onNavigate('mascot');
            }}
            className="p-2 rounded-lg text-purple-400 hover:bg-purple-500/10 transition-colors"
            title="Robot Mascot Studio"
          >
            <Bot className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
};
