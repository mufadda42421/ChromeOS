import React, { useState } from 'react';
import { UserSettings, UserPrivacySettings } from '../../types';
import {
  Settings,
  Shield,
  Trash2,
  Download,
  Key,
  Check,
  AlertTriangle,
  Sparkles,
  Command,
  ExternalLink,
} from 'lucide-react';
import { soundEngine } from '../../services/soundEffects';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdatePrivacy: (privacy: UserPrivacySettings) => void;
  onClearAllData: () => void;
  onOpenDownloadExtension: () => void;
  onRestartTour: () => void;
}

const CHROME_PERMISSIONS = [
  { id: 'tabs', desc: 'Detect tab creation, activation, URL changes, and title updates.' },
  { id: 'tabGroups', desc: 'Create and organize native Chrome tab groups colored by category.' },
  { id: 'storage', desc: 'Persist workspaces, categories, and mascot states locally in chrome.storage.local.' },
  { id: 'sidePanel', desc: 'Provide persistent companion dock and workspace switcher via Chrome side panel.' },
  { id: 'bookmarks', desc: 'Organize and access categorized bookmarks without third-party tracking.' },
  { id: 'sessions', desc: 'Save and restore browser tab sessions across restarts.' },
];

const KEYBOARD_SHORTCUTS = [
  { key: 'Alt + Shift + O', desc: 'Open ChromeOS Main Workspace' },
  { key: 'Alt + Shift + T', desc: 'Toggle Visual Tab Manager' },
  { key: 'Alt + Shift + R', desc: 'Trigger Robot Mascot Reaction / Speech' },
  { key: 'Alt + Shift + W', desc: 'Switch to Next Workspace' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdatePrivacy,
  onClearAllData,
  onOpenDownloadExtension,
  onRestartTour,
}) => {
  const [privacy, setPrivacy] = useState<UserPrivacySettings>(settings.privacy);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePrivacyToggle = (patch: Partial<UserPrivacySettings>) => {
    soundEngine.playClick();
    const next = { ...privacy, ...patch };
    setPrivacy(next);
    onUpdatePrivacy(next);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExecuteClear = () => {
    soundEngine.playAlert();
    onClearAllData();
    setShowConfirmClear(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold font-mono">
            Extension Configuration
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Settings & Privacy</h1>
          <p className="text-xs text-slate-400">
            Control local data storage, AI classification permissions, shortcuts, and extension package
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onRestartTour();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 border border-white/10 transition-all"
          >
            Restart Tour
          </button>
          <button
            onClick={() => {
              soundEngine.playHappy();
              onOpenDownloadExtension();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Extension (.zip)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Privacy & Data Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Privacy & Storage Section */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Data & Local Storage Guarantee
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              ChromeOS is designed privacy-first. All workspaces, tab hierarchies, and mascot customizations are kept strictly in your browser using <code className="text-purple-300 font-mono">chrome.storage.local</code>. Your browsing history is never sold or transmitted to third parties.
            </p>

            <div className="space-y-3 pt-2">
              {/* Optional AI Classification */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-purple-500/30 transition-colors">
                <input
                  type="checkbox"
                  checked={privacy.allowAIClassification}
                  onChange={(e) =>
                    handlePrivacyToggle({ allowAIClassification: e.target.checked })
                  }
                  className="accent-purple-500 w-4 h-4 mt-0.5"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">
                    Optional Gemini AI Classification
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    When enabled, unclassified or unknown domains are analyzed via server-side Gemini 3.8 Flash to determine their category. Only the domain and title are analyzed; URL parameters and page content are never transmitted.
                  </p>
                </div>
              </label>

              {/* Local Only Guarantee */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.localOnly}
                  onChange={(e) =>
                    handlePrivacyToggle({ localOnly: e.target.checked })
                  }
                  className="accent-purple-500 w-4 h-4 mt-0.5"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">
                    Enforce Local Storage Isolation
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Prevent any external telemetry or diagnostics. Keep all application state confined to your machine.
                  </p>
                </div>
              </label>
            </div>

            {/* Clear All Data */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-rose-400">Clear All Workspace Data</h3>
                  <p className="text-[11px] text-slate-500">
                    Reset all custom categories, tabs, and mascot themes to factory defaults.
                  </p>
                </div>
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Command className="w-4 h-4 text-cyan-400" />
              Keyboard Shortcuts
            </h2>

            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.map((sc) => (
                <div
                  key={sc.key}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                >
                  <span className="text-slate-300">{sc.desc}</span>
                  <kbd className="font-mono text-[11px] bg-slate-900 text-purple-300 px-2 py-1 rounded border border-white/10 shadow-inner">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Permissions & Architecture */}
        <div className="lg:col-span-6 space-y-6">
          {/* Manifest V3 Permissions Audit */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Manifest V3 Extension Permissions
            </h2>

            <p className="text-xs text-slate-400">
              ChromeOS requests only the minimum required capabilities to deliver native tab grouping, persistence, and side-panel companions:
            </p>

            <div className="space-y-2.5">
              {CHROME_PERMISSIONS.map((perm) => (
                <div
                  key={perm.id}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3"
                >
                  <code className="text-xs font-mono font-bold text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                    {perm.id}
                  </code>
                  <span className="text-xs text-slate-300 leading-snug">{perm.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monetization Ready Tier Architecture */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Tier Architecture
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Free Tier */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Starter Edition</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li>Automatic tab categorization</li>
                  <li>3 persistent workspaces</li>
                  <li>All 6 core robot mascot skins</li>
                  <li>Interactive audio synthesizer</li>
                  <li>Local session snapshots</li>
                </ul>
              </div>

              {/* Pro Tier */}
              <div className="p-4 rounded-2xl bg-purple-950/15 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">Enterprise Pro</span>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-900/40 px-1.5 py-0.5 rounded">
                    Architecture Ready
                  </span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li>Unlimited workspaces & rules</li>
                  <li>Custom robot mascot SVG uploads</li>
                  <li>Cloud team sync (Stripe-ready)</li>
                  <li>Advanced telemetry & AI agents</li>
                  <li>Cross-device tab mirroring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Reset All ChromeOS Data?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will erase all custom categories, tabs, bookmarks, and saved sessions from your local browser storage. Built-in defaults will be restored.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteClear}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
