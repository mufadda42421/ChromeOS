import React, { useState } from 'react';
import { TabItem, Category, Workspace, CategoryId } from '../../types';
import {
  Search,
  Pin,
  PinOff,
  Copy,
  X,
  Volume2,
  VolumeX,
  ExternalLink,
  Layers,
  ArrowUpDown,
  FolderPlus,
  RefreshCw,
  Plus,
  Filter,
} from 'lucide-react';
import { soundEngine } from '../../services/soundEffects';

interface TabManagerViewProps {
  tabs: TabItem[];
  categories: Category[];
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onOpenTab: (url: string) => void;
  onCloseTab: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleMute: (id: string) => void;
  onDuplicateTab: (tab: TabItem) => void;
  onMoveTabCategory: (tabId: string, categoryId: CategoryId) => void;
  onSaveSession: (name: string) => void;
  recentlyClosed: TabItem[];
  onRestoreTab: (tab: TabItem) => void;
  onSyncNativeGroups: () => void;
}

export const TabManagerView: React.FC<TabManagerViewProps> = ({
  tabs,
  categories,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenTab,
  onCloseTab,
  onTogglePin,
  onToggleMute,
  onDuplicateTab,
  onMoveTabCategory,
  onSaveSession,
  recentlyClosed,
  onRestoreTab,
  onSyncNativeGroups,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'category' | 'title' | 'recent' | 'domain'>('category');
  const [viewMode, setViewMode] = useState<'grouped' | 'grid'>('grouped');
  const [sessionName, setSessionName] = useState('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showNewTabInput, setShowNewTabInput] = useState(false);
  const [newUrl, setNewUrl] = useState('');

  // Filter tabs for active workspace
  const workspaceTabs = tabs.filter(
    (t) => t.workspaceId === activeWorkspaceId || !t.workspaceId
  );

  // Search and category filtering
  const filteredTabs = workspaceTabs.filter((tab) => {
    const matchesSearch =
      tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tab.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || tab.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sorting
  const sortedTabs = [...filteredTabs].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'recent') return b.lastAccessed - a.lastAccessed;
    if (sortBy === 'domain') {
      const domA = new URL(a.url || 'https://google.com').hostname;
      const domB = new URL(b.url || 'https://google.com').hostname;
      return domA.localeCompare(domB);
    }
    // Default by category name
    return a.categoryId.localeCompare(b.categoryId);
  });

  // Group tabs by category
  const tabsByCategory = categories.map((cat) => ({
    category: cat,
    tabs: sortedTabs.filter((t) => t.categoryId === cat.id),
  }));

  const handleSaveCurrentSession = () => {
    if (sessionName.trim()) {
      soundEngine.playHappy();
      onSaveSession(sessionName.trim());
      setSessionName('');
      setShowSessionModal(false);
    }
  };

  const currentWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Top Header & Workspaces */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold font-mono">
              ChromeOS Tab Engine
            </span>
            <span className="text-[10px] font-mono bg-white/10 text-slate-300 px-1.5 py-0.5 rounded tabular-nums">
              {workspaceTabs.length} Tabs Open
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Visual Tab Manager</h1>
          <p className="text-xs text-slate-400">
            Intelligently organized by category, domain, and workspace
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowNewTabInput(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open Tab</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setShowSessionModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-medium border border-white/10 transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
            <span>Save Session</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onSyncNativeGroups();
            }}
            title="Sync Chrome Tab Groups"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-medium border border-white/10 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Sync Native Groups</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search open tabs by title or URL..."
            className="w-full bg-[#0E131E] text-xs text-slate-100 placeholder:text-slate-500 rounded-xl pl-9 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-[#0E131E] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2.5 cursor-pointer hover:border-purple-500/40 focus:outline-none"
          >
            <option value="all">All Categories ({workspaceTabs.length})</option>
            {categories.map((cat) => {
              const count = workspaceTabs.filter((t) => t.categoryId === cat.id).length;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Sort & View Mode */}
        <div className="md:col-span-3 flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#0E131E] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2.5 cursor-pointer hover:border-purple-500/40 focus:outline-none"
            >
              <option value="category">Sort: Category</option>
              <option value="title">Sort: Title</option>
              <option value="recent">Sort: Recently Accessed</option>
              <option value="domain">Sort: Domain</option>
            </select>
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'grouped' ? 'grid' : 'grouped')}
            className="px-3 py-2.5 rounded-xl bg-white/[0.06] text-xs font-semibold text-slate-300 border border-white/10 hover:bg-white/10 transition-colors"
          >
            {viewMode === 'grouped' ? 'Stack' : 'Grid'}
          </button>
        </div>
      </div>

      {/* TABS VIEW: GROUPED BY CATEGORY */}
      {viewMode === 'grouped' && (
        <div className="space-y-6">
          {tabsByCategory.map(({ category, tabs: catTabs }) => {
            if (catTabs.length === 0 && selectedCategoryFilter !== 'all') return null;

            return (
              <div
                key={category.id}
                className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-md shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {category.name}
                    </h3>
                    <span className="text-[11px] font-mono tabular-nums text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                      {catTabs.length} {catTabs.length === 1 ? 'tab' : 'tabs'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundEngine.playAlert();
                        catTabs.forEach((t) => onCloseTab(t.id));
                      }}
                      disabled={catTabs.length === 0}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-40"
                    >
                      Close all in category
                    </button>
                  </div>
                </div>

                {/* Tab Cards */}
                {catTabs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    No active tabs in this category. Open a relevant website to populate.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catTabs.map((tab) => (
                      <TabCard
                        key={tab.id}
                        tab={tab}
                        category={category}
                        categories={categories}
                        onOpenTab={onOpenTab}
                        onCloseTab={onCloseTab}
                        onTogglePin={onTogglePin}
                        onToggleMute={onToggleMute}
                        onDuplicateTab={onDuplicateTab}
                        onMoveTabCategory={onMoveTabCategory}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TABS VIEW: UNIFIED GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedTabs.map((tab) => {
            const cat = categories.find((c) => c.id === tab.categoryId) || categories[0];
            return (
              <TabCard
                key={tab.id}
                tab={tab}
                category={cat}
                categories={categories}
                onOpenTab={onOpenTab}
                onCloseTab={onCloseTab}
                onTogglePin={onTogglePin}
                onToggleMute={onToggleMute}
                onDuplicateTab={onDuplicateTab}
                onMoveTabCategory={onMoveTabCategory}
              />
            );
          })}
        </div>
      )}

      {/* Recently Closed Tabs Section */}
      {recentlyClosed.length > 0 && (
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recently Closed Tabs
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {recentlyClosed.length} in history
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentlyClosed.slice(0, 6).map((rc) => (
              <button
                key={rc.id}
                onClick={() => {
                  soundEngine.playClick();
                  onRestoreTab(rc);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs text-slate-300 border border-white/5 transition-all"
              >
                <img
                  src={rc.favicon || `https://www.google.com/s2/favicons?domain=${new URL(rc.url || 'https://google.com').hostname}&sz=64`}
                  alt=""
                  className="w-3.5 h-3.5 rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="truncate max-w-[140px]">{rc.title}</span>
                <span className="text-[10px] text-purple-400">Restore</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Save Current Tab Session</h3>
            <p className="text-xs text-slate-400">
              Create a snapshot of all {workspaceTabs.length} tabs in "{currentWorkspace.name}" to restore anytime.
            </p>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g. Morning Workflow, Full Stack Sprint"
              className="w-full bg-[#0A0E17] text-sm text-slate-100 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSessionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCurrentSession}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl"
              >
                Save Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Tab Input Modal */}
      {showNewTabInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Open & Categorize Tab</h3>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter URL (e.g. https://stackoverflow.com)"
              className="w-full bg-[#0A0E17] text-sm text-slate-100 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewTabInput(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newUrl.trim()) {
                    const formatted = newUrl.startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`;
                    onOpenTab(formatted);
                    setNewUrl('');
                    setShowNewTabInput(false);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl"
              >
                Open Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Tab Card Component
interface TabCardProps {
  tab: TabItem;
  category: Category;
  categories: Category[];
  onOpenTab: (url: string) => void;
  onCloseTab: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleMute: (id: string) => void;
  onDuplicateTab: (tab: TabItem) => void;
  onMoveTabCategory: (tabId: string, categoryId: CategoryId) => void;
}

const TabCard: React.FC<TabCardProps> = ({
  tab,
  category,
  categories,
  onOpenTab,
  onCloseTab,
  onTogglePin,
  onToggleMute,
  onDuplicateTab,
  onMoveTabCategory,
}) => {
  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 group relative ${
        tab.active
          ? 'bg-purple-950/20 border-purple-500/50 shadow-md'
          : 'bg-[#0E131E]/80 border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div
          onClick={() => {
            soundEngine.playClick();
            onOpenTab(tab.url);
          }}
          className="flex items-start gap-2.5 min-w-0 cursor-pointer flex-1"
        >
          <img
            src={tab.favicon || `https://www.google.com/s2/favicons?domain=${new URL(tab.url || 'https://google.com').hostname}&sz=64`}
            alt=""
            className="w-4 h-4 rounded shrink-0 object-contain mt-0.5"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
              {tab.title}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono truncate block mt-0.5">
              {new URL(tab.url || 'https://google.com').hostname}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playClick();
            onCloseTab(tab.id);
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Close tab"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Footer Controls: Category Tag, Pin, Mute, Duplicate, Move */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[11px]">
        {/* Reassign Category dropdown */}
        <select
          value={tab.categoryId}
          onChange={(e) => {
            soundEngine.playClick();
            onMoveTabCategory(tab.id, e.target.value);
          }}
          className="bg-transparent text-[10px] font-medium border-0 cursor-pointer focus:outline-none"
          style={{ color: category.color }}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
              {c.name}
            </option>
          ))}
        </select>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => {
              soundEngine.playClick();
              onTogglePin(tab.id);
            }}
            title={tab.pinned ? 'Unpin tab' : 'Pin tab'}
            className={`p-1 rounded hover:text-white ${tab.pinned ? 'text-amber-400' : ''}`}
          >
            {tab.pinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleMute(tab.id);
            }}
            title={tab.muted ? 'Unmute tab' : 'Mute tab'}
            className={`p-1 rounded hover:text-white ${tab.muted ? 'text-rose-400' : ''}`}
          >
            {tab.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onDuplicateTab(tab);
            }}
            title="Duplicate tab"
            className="p-1 rounded hover:text-white"
          >
            <Copy className="w-3 h-3" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenTab(tab.url);
            }}
            title="Open in browser window"
            className="p-1 rounded hover:text-white"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
