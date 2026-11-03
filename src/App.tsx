import React, { useState, useEffect } from 'react';
import {
  ActiveView,
  Category,
  Workspace,
  TabItem,
  RobotMascotConfig,
  ThemeSettings,
  UserPrivacySettings,
  SessionSnapshot,
  BookmarkItem,
  CategoryId,
} from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_WORKSPACES,
  INITIAL_TABS,
  INITIAL_BOOKMARKS,
  DEFAULT_MASCOT_CONFIG,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_PRIVACY_SETTINGS,
} from './data/initialData';
import { TabClassifier } from './services/classifier';
import { ChromeBridge, isChromeExtension } from './services/chromeBridge';
import { soundEngine } from './services/soundEffects';

// Layout & Views
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { TabManagerView } from './components/views/TabManagerView';
import { CategoryManagerView } from './components/views/CategoryManagerView';
import { WorkspaceManagerView } from './components/views/WorkspaceManagerView';
import { MascotCustomizerView } from './components/views/MascotCustomizerView';
import { ThemeCustomizerView } from './components/views/ThemeCustomizerView';
import { BookmarkManagerView } from './components/views/BookmarkManagerView';
import { SessionManagerView } from './components/views/SessionManagerView';
import { SettingsView } from './components/views/SettingsView';
import { FloatingMascot } from './components/mascot/FloatingMascot';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { ExtensionDownloadModal } from './components/modals/ExtensionDownloadModal';

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Core Persistent State
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('chromeos_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem('chromeos_workspaces');
    return saved ? JSON.parse(saved) : INITIAL_WORKSPACES;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem('chromeos_active_workspace') || 'ws-main';
  });

  const [tabs, setTabs] = useState<TabItem[]>(() => {
    const saved = localStorage.getItem('chromeos_tabs');
    return saved ? JSON.parse(saved) : INITIAL_TABS;
  });

  const [recentlyClosed, setRecentlyClosed] = useState<TabItem[]>(() => {
    const saved = localStorage.getItem('chromeos_recently_closed');
    return saved ? JSON.parse(saved) : [];
  });

  const [sessions, setSessions] = useState<SessionSnapshot[]>(() => {
    const saved = localStorage.getItem('chromeos_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem('chromeos_bookmarks');
    return saved ? JSON.parse(saved) : INITIAL_BOOKMARKS;
  });

  const [mascotConfig, setMascotConfig] = useState<RobotMascotConfig>(() => {
    const saved = localStorage.getItem('chromeos_mascot_config');
    return saved ? JSON.parse(saved) : DEFAULT_MASCOT_CONFIG;
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('chromeos_theme_settings');
    return saved ? JSON.parse(saved) : DEFAULT_THEME_SETTINGS;
  });

  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings>(() => {
    const saved = localStorage.getItem('chromeos_privacy_settings');
    return saved ? JSON.parse(saved) : DEFAULT_PRIVACY_SETTINGS;
  });

  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    return localStorage.getItem('chromeos_onboarding_done') === 'true';
  });

  // Modals
  const [showOnboarding, setShowOnboarding] = useState(!onboardingCompleted);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('chromeos_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('chromeos_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('chromeos_active_workspace', activeWorkspaceId);
  }, [activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem('chromeos_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('chromeos_recently_closed', JSON.stringify(recentlyClosed));
  }, [recentlyClosed]);

  useEffect(() => {
    localStorage.setItem('chromeos_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('chromeos_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('chromeos_mascot_config', JSON.stringify(mascotConfig));
  }, [mascotConfig]);

  useEffect(() => {
    localStorage.setItem('chromeos_theme_settings', JSON.stringify(themeSettings));
  }, [themeSettings]);

  useEffect(() => {
    localStorage.setItem('chromeos_privacy_settings', JSON.stringify(privacySettings));
  }, [privacySettings]);

  useEffect(() => {
    localStorage.setItem('chromeos_onboarding_done', String(onboardingCompleted));
  }, [onboardingCompleted]);

  // Sync SoundEngine enable state
  useEffect(() => {
    soundEngine.setEnabled(mascotConfig.soundEffectsEnabled);
  }, [mascotConfig.soundEffectsEnabled]);

  // Sync Dark/Light class on <html>
  useEffect(() => {
    if (themeSettings.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeSettings.mode]);

  // Determine active tab & active category
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const activeTab = tabs.find((t) => t.active && t.workspaceId === activeWorkspaceId) || tabs[0];
  const activeCategory = categories.find((c) => c.id === activeTab?.categoryId);

  // Tab count index by category
  const tabCountByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = tabs.filter((t) => t.categoryId === cat.id).length;
    return acc;
  }, {} as Record<string, number>);

  // TAB ACTIONS
  const handleOpenTab = async (url: string) => {
    try {
      const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
      const domain = TabClassifier.extractDomain(cleanUrl);
      const title = domain.charAt(0).toUpperCase() + domain.slice(1);

      // Classify tab using intelligent classifier
      const result = await TabClassifier.classifyWithAI(
        cleanUrl,
        title,
        categories,
        {},
        privacySettings.allowAIClassification
      );

      const newTab: TabItem = {
        id: 'tab-' + Date.now(),
        url: cleanUrl,
        title,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        categoryId: result.categoryId,
        pinned: false,
        muted: false,
        active: true,
        workspaceId: activeWorkspaceId,
        lastAccessed: Date.now(),
      };

      // Set other tabs as inactive in this workspace
      const updated = tabs.map((t) =>
        t.workspaceId === activeWorkspaceId ? { ...t, active: false } : t
      );

      setTabs([newTab, ...updated]);
      soundEngine.playMorph();

      // Native Chrome Extension hook
      ChromeBridge.createTab(cleanUrl);
    } catch (e) {
      console.warn('Error opening tab:', e);
    }
  };

  const handleCloseTab = (id: string) => {
    const tabToClose = tabs.find((t) => t.id === id);
    if (tabToClose) {
      setRecentlyClosed([tabToClose, ...recentlyClosed.slice(0, 19)]);
    }

    const remaining = tabs.filter((t) => t.id !== id);
    if (tabToClose?.active && remaining.length > 0) {
      // Activate next tab
      remaining[0].active = true;
    }
    setTabs(remaining);
    ChromeBridge.closeTab(id);
  };

  const handleTogglePin = (id: string) => {
    setTabs(
      tabs.map((t) => {
        if (t.id === id) {
          const next = !t.pinned;
          ChromeBridge.togglePinTab(id, next);
          return { ...t, pinned: next };
        }
        return t;
      })
    );
  };

  const handleToggleMute = (id: string) => {
    setTabs(
      tabs.map((t) => (t.id === id ? { ...t, muted: !t.muted } : t))
    );
  };

  const handleDuplicateTab = (tab: TabItem) => {
    const dup: TabItem = {
      ...tab,
      id: 'tab-' + Date.now(),
      active: true,
      lastAccessed: Date.now(),
    };
    setTabs([dup, ...tabs.map((t) => ({ ...t, active: false }))]);
  };

  const handleMoveTabCategory = (tabId: string, categoryId: CategoryId) => {
    setTabs(
      tabs.map((t) => (t.id === tabId ? { ...t, categoryId } : t))
    );
  };

  const handleRestoreTab = (tab: TabItem) => {
    setRecentlyClosed(recentlyClosed.filter((t) => t.id !== tab.id));
    setTabs([{ ...tab, id: 'tab-' + Date.now(), active: true }, ...tabs]);
  };

  // CATEGORY ACTIONS
  const handleCreateCategory = (cat: Category) => {
    setCategories([...categories, cat]);
  };

  const handleUpdateCategory = (cat: Category) => {
    setCategories(categories.map((c) => (c.id === cat.id ? cat : c)));
  };

  const handleDeleteCategory = (id: CategoryId) => {
    const fallbackId = categories.find((c) => c.id !== id)?.id || 'ai';
    setTabs(tabs.map((t) => (t.categoryId === id ? { ...t, categoryId: fallbackId } : t)));
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleMergeCategories = (sourceId: CategoryId, targetId: CategoryId) => {
    const sourceCat = categories.find((c) => c.id === sourceId);
    const targetCat = categories.find((c) => c.id === targetId);
    if (!sourceCat || !targetCat) return;

    // Move tabs
    setTabs(tabs.map((t) => (t.categoryId === sourceId ? { ...t, categoryId: targetId } : t)));

    // Merge rules
    const mergedRules = Array.from(new Set([...targetCat.rules, ...sourceCat.rules]));
    setCategories(
      categories
        .filter((c) => c.id !== sourceId)
        .map((c) => (c.id === targetId ? { ...c, rules: mergedRules } : c))
    );
  };

  // WORKSPACE ACTIONS
  const handleCreateWorkspace = (ws: Workspace) => {
    setWorkspaces([...workspaces, ws]);
  };

  const handleUpdateWorkspace = (ws: Workspace) => {
    setWorkspaces(workspaces.map((w) => (w.id === ws.id ? ws : w)));
  };

  const handleDeleteWorkspace = (id: string) => {
    if (workspaces.length <= 1) return;
    const remaining = workspaces.filter((w) => w.id !== id);
    setWorkspaces(remaining);
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(remaining[0].id);
    }
  };

  // SESSION ACTIONS
  const handleSaveCurrentSession = (name: string) => {
    const newSession: SessionSnapshot = {
      id: 'session-' + Date.now(),
      name,
      workspaceId: activeWorkspaceId,
      createdAt: Date.now(),
      tabs: tabs.filter((t) => t.workspaceId === activeWorkspaceId),
      tags: [activeWorkspace.name],
    };
    setSessions([newSession, ...sessions]);
  };

  const handleRestoreSession = (session: SessionSnapshot, mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      const otherWorkspaceTabs = tabs.filter((t) => t.workspaceId !== activeWorkspaceId);
      setTabs([...session.tabs.map((t) => ({ ...t, workspaceId: activeWorkspaceId })), ...otherWorkspaceTabs]);
    } else {
      setTabs([...session.tabs.map((t) => ({ ...t, id: 'tab-' + Math.random(), workspaceId: activeWorkspaceId })), ...tabs]);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleImportSession = (session: SessionSnapshot) => {
    setSessions([session, ...sessions]);
  };

  // BOOKMARK ACTIONS
  const handleAddBookmark = (bm: BookmarkItem) => {
    setBookmarks([bm, ...bookmarks]);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  // RESET TO DEFAULT
  const handleClearAllData = () => {
    localStorage.clear();
    setCategories(INITIAL_CATEGORIES);
    setWorkspaces(INITIAL_WORKSPACES);
    setActiveWorkspaceId('ws-main');
    setTabs(INITIAL_TABS);
    setRecentlyClosed([]);
    setSessions([]);
    setBookmarks(INITIAL_BOOKMARKS);
    setMascotConfig(DEFAULT_MASCOT_CONFIG);
    setThemeSettings(DEFAULT_THEME_SETTINGS);
    setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
  };

  // Compute active background wallpaper style
  const getWallpaperBackground = () => {
    if (themeSettings.customWallpaperUrl) {
      return {
        backgroundImage: `linear-gradient(rgba(11, 13, 18, 0.75), rgba(11, 13, 18, 0.95)), url(${themeSettings.customWallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    switch (themeSettings.wallpaperId) {
      case 'wall-cybergrid':
        return {
          background: 'radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.16) 0%, rgba(5, 7, 11, 0.98) 85%)',
        };
      case 'wall-aurora':
        return {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(11, 13, 18, 1) 100%)',
        };
      case 'wall-sunset':
        return {
          background: 'radial-gradient(circle at top right, rgba(244, 63, 94, 0.15) 0%, rgba(15, 20, 32, 0.95) 75%)',
        };
      case 'wall-darkmatter':
        return {
          background: 'linear-gradient(180deg, rgba(20, 24, 33, 0.6) 0%, rgba(11, 13, 18, 1) 100%)',
        };
      case 'wall-nebula':
      default:
        return {
          background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.2) 0%, rgba(11, 13, 18, 0.98) 75%)',
        };
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col text-[#F8FAFC] transition-colors selection:bg-purple-500/30 font-sans"
      style={getWallpaperBackground()}
    >
      {/* Top Bar with Strict 3-zone contract */}
      <TopBar
        activeView={activeView}
        onNavigate={setActiveView}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={setActiveWorkspaceId}
        mascotConfig={mascotConfig}
        activeCategory={activeCategory}
        activeTab={activeTab}
        onOpenDownload={() => setShowDownloadModal(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          categories={categories}
          tabs={tabs}
          mascotConfig={mascotConfig}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto pb-16">
          {activeView === 'dashboard' && (
            <DashboardView
              tabs={tabs}
              categories={categories}
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSelectWorkspace={setActiveWorkspaceId}
              mascotConfig={mascotConfig}
              themeSettings={themeSettings}
              onNavigate={setActiveView}
              onOpenTab={handleOpenTab}
              onCloseTab={handleCloseTab}
            />
          )}

          {activeView === 'tabs' && (
            <TabManagerView
              tabs={tabs}
              categories={categories}
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSelectWorkspace={setActiveWorkspaceId}
              onOpenTab={handleOpenTab}
              onCloseTab={handleCloseTab}
              onTogglePin={handleTogglePin}
              onToggleMute={handleToggleMute}
              onDuplicateTab={handleDuplicateTab}
              onMoveTabCategory={handleMoveTabCategory}
              onSaveSession={handleSaveCurrentSession}
              recentlyClosed={recentlyClosed}
              onRestoreTab={handleRestoreTab}
              onSyncNativeGroups={() => ChromeBridge.syncTabGroups(tabs, categories)}
            />
          )}

          {activeView === 'categories' && (
            <CategoryManagerView
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onMergeCategories={handleMergeCategories}
              tabCountByCategory={tabCountByCategory}
            />
          )}

          {activeView === 'workspaces' && (
            <WorkspaceManagerView
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSelectWorkspace={setActiveWorkspaceId}
              onCreateWorkspace={handleCreateWorkspace}
              onUpdateWorkspace={handleUpdateWorkspace}
              onDeleteWorkspace={handleDeleteWorkspace}
              tabs={tabs}
            />
          )}

          {activeView === 'mascot' && (
            <MascotCustomizerView
              config={mascotConfig}
              onUpdateConfig={setMascotConfig}
              categories={categories}
            />
          )}

          {activeView === 'themes' && (
            <ThemeCustomizerView
              theme={themeSettings}
              onUpdateTheme={setThemeSettings}
            />
          )}

          {activeView === 'bookmarks' && (
            <BookmarkManagerView
              bookmarks={bookmarks}
              categories={categories}
              onAddBookmark={handleAddBookmark}
              onDeleteBookmark={handleDeleteBookmark}
              onOpenTab={handleOpenTab}
            />
          )}

          {activeView === 'sessions' && (
            <SessionManagerView
              sessions={sessions}
              onSaveCurrentSession={handleSaveCurrentSession}
              onRestoreSession={handleRestoreSession}
              onDeleteSession={handleDeleteSession}
              onImportSession={handleImportSession}
              currentTabs={tabs.filter((t) => t.workspaceId === activeWorkspaceId)}
              workspaces={workspaces}
              categories={categories}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              settings={{
                activeWorkspaceId,
                theme: themeSettings,
                mascot: mascotConfig,
                privacy: privacySettings,
                onboardingCompleted,
              }}
              onUpdatePrivacy={setPrivacySettings}
              onClearAllData={handleClearAllData}
              onOpenDownloadExtension={() => setShowDownloadModal(true)}
              onRestartTour={() => setShowOnboarding(true)}
            />
          )}
        </main>
      </div>

      {/* Floating Mascot Dock (if configured) */}
      {mascotConfig.position === 'floating' && (
        <FloatingMascot
          config={mascotConfig}
          activeCategory={activeCategory}
          activeTab={activeTab}
          onOpenCustomizer={() => setActiveView('mascot')}
          onToggleSound={() => {
            const nextSound = !mascotConfig.soundEffectsEnabled;
            soundEngine.setEnabled(nextSound);
            setMascotConfig({ ...mascotConfig, soundEffectsEnabled: nextSound });
          }}
          onClose={() => setMascotConfig({ ...mascotConfig, position: 'tabbar' })}
        />
      )}

      {/* Onboarding Interactive Tour Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        initialMascotConfig={mascotConfig}
        onComplete={(custom) => {
          if (custom) {
            setMascotConfig({ ...mascotConfig, ...custom });
          }
          setOnboardingCompleted(true);
          setShowOnboarding(false);
        }}
      />

      {/* Download Chrome Extension Manifest V3 Modal */}
      <ExtensionDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
}
