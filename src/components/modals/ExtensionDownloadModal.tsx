import React, { useState } from 'react';
import { ChromeBridge } from '../../services/chromeBridge';
import { soundEngine } from '../../services/soundEffects';
import { Download, X, Check, Terminal, ExternalLink, FileCode } from 'lucide-react';

interface ExtensionDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionDownloadModal: React.FC<ExtensionDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'manifest' | 'background'>('install');

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      soundEngine.playHappy();

      // Fetch the standalone production bundle compiled directly from dist
      const res = await fetch('/api/download-extension-zip');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chromeos-extension-manifest-v3.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 3000);
        return;
      }

      // Fallback
      const blob = await ChromeBridge.generateExtensionPackage();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chromeos-extension-manifest-v3.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to generate extension zip:', err);
    } finally {
      setDownloading(false);
    }
  };

  const sampleManifest = `{
  "manifest_version": 3,
  "name": "ChromeOS — Intelligent Browser Workspace",
  "version": "1.0.0",
  "description": "Transforms Chrome tabs into intelligent, categorized workspaces with dynamic robot mascots.",
  "permissions": [
    "tabs",
    "tabGroups",
    "storage",
    "sidePanel",
    "bookmarks",
    "history",
    "sessions"
  ],
  "host_permissions": ["<all_urls>"],
  "action": {
    "default_title": "ChromeOS Workspace",
    "default_popup": "index.html"
  },
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "side_panel": {
    "default_path": "index.html"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  }
}`;

  const sampleBackground = `// background.js - ChromeOS Manifest V3 Service Worker
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['categories'], (data) => {
      // Auto-categorize and assign native Chrome tab group
      console.log('Classifying tab:', tab.url);
    });
  }
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Chrome Extension Manifest V3 Package
              </h3>
              <p className="text-xs text-slate-400">
                Download ready-to-load extension or inspect source files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 p-1 bg-white/[0.04] rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'install'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Installation Guide
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'manifest'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            manifest.json (MV3)
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'background'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            background.js
          </button>
        </div>

        {/* TAB 1: INSTALLATION GUIDE */}
        {activeTab === 'install' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">Ready for Production</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Package contains Manifest V3 definition, background service worker, icons, and redirect page.
                </p>
              </div>

              <button
                onClick={handleDownloadZip}
                disabled={downloading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md transition-all shrink-0"
              >
                {downloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading ? 'Packing...' : 'Download (.zip)'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                How to load unpacked in Google Chrome:
              </h4>

              <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside font-sans">
                <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <strong>Download & Extract:</strong> Download the .zip file above and unzip it into any local folder (e.g., <code className="text-purple-300 font-mono">~/chromeos-extension</code>).
                </li>
                <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <strong>Open Extensions:</strong> In Google Chrome, navigate to <code className="text-cyan-300 font-mono">chrome://extensions</code> in your address bar.
                </li>
                <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <strong>Enable Developer Mode:</strong> Toggle the <strong>Developer mode</strong> switch in the upper-right corner of Chrome.
                </li>
                <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <strong>Load Unpacked:</strong> Click the <strong>"Load unpacked"</strong> button in the upper-left corner and select your unzipped folder.
                </li>
                <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <strong>Experience ChromeOS:</strong> Open a new tab or click the extension puzzle piece icon to activate your robot mascot and intelligent workspace!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: MANIFEST.JSON */}
        {activeTab === 'manifest' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Manifest V3 Specification</span>
              <span className="font-mono">JSON</span>
            </div>
            <pre className="p-4 rounded-2xl bg-[#080B12] text-xs font-mono text-purple-300 overflow-x-auto border border-white/10 max-h-80">
              {sampleManifest}
            </pre>
          </div>
        )}

        {/* TAB 3: BACKGROUND.JS */}
        {activeTab === 'background' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Service Worker Script</span>
              <span className="font-mono">JavaScript (ESM)</span>
            </div>
            <pre className="p-4 rounded-2xl bg-[#080B12] text-xs font-mono text-cyan-300 overflow-x-auto border border-white/10 max-h-80">
              {sampleBackground}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
