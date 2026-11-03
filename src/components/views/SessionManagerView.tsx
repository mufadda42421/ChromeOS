import React, { useState } from 'react';
import { SessionSnapshot, TabItem, Workspace, Category } from '../../types';
import {
  History,
  FolderPlus,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Calendar,
  Layers,
  Check,
} from 'lucide-react';
import { soundEngine } from '../../services/soundEffects';

interface SessionManagerViewProps {
  sessions: SessionSnapshot[];
  onSaveCurrentSession: (name: string) => void;
  onRestoreSession: (session: SessionSnapshot, mode: 'replace' | 'append') => void;
  onDeleteSession: (id: string) => void;
  onImportSession: (session: SessionSnapshot) => void;
  currentTabs: TabItem[];
  workspaces: Workspace[];
  categories: Category[];
}

export const SessionManagerView: React.FC<SessionManagerViewProps> = ({
  sessions,
  onSaveCurrentSession,
  onRestoreSession,
  onDeleteSession,
  onImportSession,
  currentTabs,
  workspaces,
  categories,
}) => {
  const [sessionName, setSessionName] = useState('');
  const [previewSession, setPreviewSession] = useState<SessionSnapshot | null>(
    sessions[0] || null
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;
    soundEngine.playHappy();
    onSaveCurrentSession(sessionName.trim());
    setSessionName('');
  };

  const handleExportJson = (session: SessionSnapshot) => {
    soundEngine.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chromeos-session-${session.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tabs && Array.isArray(parsed.tabs)) {
          soundEngine.playHappy();
          onImportSession({
            ...parsed,
            id: 'session-' + Date.now(),
            createdAt: Date.now(),
          });
        }
      } catch (err) {
        console.error('Failed to parse session file', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold font-mono">
            State Persistence
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Session Manager</h1>
          <p className="text-xs text-slate-400">
            Snapshot active browser workspaces and restore sessions in one click
          </p>
        </div>

        {/* Snapshot form */}
        <form onSubmit={handleSave} className="flex items-center gap-2">
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder={`Save current ${currentTabs.length} tabs as...`}
            className="bg-[#080B12] text-xs text-slate-200 placeholder:text-slate-500 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 w-56"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md whitespace-nowrap"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Save Snapshot</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Saved Sessions List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              Saved Snapshots ({sessions.length})
            </h2>

            <label className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 font-medium">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => {
              const isSelected = previewSession?.id === session.id;
              const dateStr = new Date(session.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setPreviewSession(session);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-purple-500 bg-purple-950/20 ring-1 ring-purple-500/40 shadow-md'
                      : 'border-white/10 bg-[#0E131E]/80 hover:border-white/20'
                  }`}
                >
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white truncate">
                      {session.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{session.tabs.length} tabs</span>
                      <span aria-hidden="true">·</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportJson(session);
                      }}
                      title="Export JSON"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playAlert();
                        onDeleteSession(session.id);
                        if (previewSession?.id === session.id) {
                          setPreviewSession(null);
                        }
                      }}
                      title="Delete session"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {sessions.length === 0 && (
              <div className="glass-panel rounded-3xl p-8 text-center text-slate-500 text-xs">
                No saved tab sessions. Use "Save Snapshot" above to preserve your tabs.
              </div>
            )}
          </div>
        </div>

        {/* Right: Snapshot Detail & Restore Controls */}
        <div className="lg:col-span-7">
          {previewSession ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {previewSession.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Saved on {new Date(previewSession.createdAt).toLocaleString()} · {previewSession.tabs.length} tabs stored
                  </p>
                </div>

                {/* Restore Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playHappy();
                      onRestoreSession(previewSession, 'append');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 border border-white/10 transition-all"
                  >
                    Append Tabs
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playHappy();
                      onRestoreSession(previewSession, 'replace');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restore & Replace</span>
                  </button>
                </div>
              </div>

              {/* Tabs Inside Snapshot */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Tabs in Snapshot ({previewSession.tabs.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {previewSession.tabs.map((tab, idx) => {
                    const cat = categories.find((c) => c.id === tab.categoryId);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 min-w-0"
                      >
                        <img
                          src={tab.favicon || `https://www.google.com/s2/favicons?domain=${new URL(tab.url || 'https://google.com').hostname}&sz=64`}
                          alt=""
                          className="w-4 h-4 rounded shrink-0 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium text-white truncate">
                            {tab.title}
                          </h4>
                          <span
                            className="text-[10px] truncate block font-mono"
                            style={{ color: cat?.color || '#94A3B8' }}
                          >
                            {cat?.name || 'Tab'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center text-slate-500 text-xs">
              Select a session from the list on the left to inspect its tabs and restore.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
