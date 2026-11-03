import React, { useState } from 'react';
import { Workspace, TabItem, RobotSkin } from '../../types';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { soundEngine } from '../../services/soundEffects';

interface WorkspaceManagerViewProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (ws: Workspace) => void;
  onUpdateWorkspace: (ws: Workspace) => void;
  onDeleteWorkspace: (id: string) => void;
  tabs: TabItem[];
}

const PRESET_SKINS: RobotSkin[] = [
  'cyber',
  'cute',
  'minimal',
  'neon',
  'retro',
  'professional',
];

const WORKSPACE_COLORS = [
  '#8B5CF6',
  '#10B981',
  '#06B6D4',
  '#F43F5E',
  '#F59E0B',
  '#EC4899',
  '#6366F1',
];

export const WorkspaceManagerView: React.FC<WorkspaceManagerViewProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  tabs,
}) => {
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Workspace>({
    id: '',
    name: '',
    description: '',
    icon: 'Briefcase',
    color: '#8B5CF6',
    mascotSkinOverride: 'cyber',
    created: Date.now(),
  });

  const handleStartCreate = () => {
    soundEngine.playClick();
    setFormData({
      id: 'ws-' + Date.now(),
      name: '',
      description: '',
      icon: 'Briefcase',
      color: '#8B5CF6',
      mascotSkinOverride: 'cyber',
      created: Date.now(),
    });
    setIsCreating(true);
    setEditingWorkspace(null);
  };

  const handleStartEdit = (ws: Workspace) => {
    soundEngine.playClick();
    setFormData({ ...ws });
    setEditingWorkspace(ws);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    soundEngine.playHappy();
    if (isCreating) {
      onCreateWorkspace(formData);
    } else {
      onUpdateWorkspace(formData);
    }

    setIsCreating(false);
    setEditingWorkspace(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold font-mono">
            Context Separation
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Workspace Manager</h1>
          <p className="text-xs text-slate-400">
            Isolate tab groups, mascot identities, and browsing contexts for focused workflows
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {workspaces.map((ws) => {
          const wsTabs = tabs.filter((t) => t.workspaceId === ws.id);
          const isActive = ws.id === activeWorkspaceId;

          return (
            <div
              key={ws.id}
              className={`glass-panel rounded-3xl p-6 border transition-all flex flex-col justify-between gap-5 relative overflow-hidden group ${
                isActive
                  ? 'border-purple-500/60 shadow-lg shadow-purple-500/10 bg-purple-950/15'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
                      style={{ backgroundColor: `${ws.color}25`, border: `1px solid ${ws.color}50` }}
                    >
                      <Briefcase className="w-5 h-5" style={{ color: ws.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {ws.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        Created {new Date(ws.created).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        soundEngine.playHappy();
                        onSelectWorkspace(ws.id);
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      Switch <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-4">{ws.description}</p>

                {/* Workspace Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">
                      Assigned Tabs
                    </span>
                    <span className="text-xs font-semibold text-white font-mono tabular-nums">
                      {wsTabs.length} tabs
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">
                      Mascot Skin
                    </span>
                    <span className="text-xs font-semibold text-slate-200 capitalize">
                      {ws.mascotSkinOverride || 'Default'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    soundEngine.playHappy();
                    onSelectWorkspace(ws.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                      : 'bg-white/[0.06] hover:bg-white/[0.1] text-white'
                  }`}
                >
                  {isActive ? 'Current Workspace' : 'Set as Active'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(ws)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Edit Workspace"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {workspaces.length > 1 && (
                    <button
                      onClick={() => {
                        soundEngine.playAlert();
                        onDeleteWorkspace(ws.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Workspace Modal */}
      {(isCreating || editingWorkspace) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <form
            onSubmit={handleSave}
            className="glass-panel w-full max-w-md p-6 sm:p-7 rounded-3xl border border-white/20 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {isCreating ? 'Create Workspace' : `Edit: ${editingWorkspace?.name}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingWorkspace(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Engineering, Research & Learning"
                className="w-full bg-[#080B12] text-sm text-slate-100 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Purpose & Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of what this workspace is used for"
                className="w-full bg-[#080B12] text-xs text-slate-200 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Accent Color */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Workspace Accent Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {WORKSPACE_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: col })}
                    className={`w-7 h-7 rounded-lg transition-transform ${
                      formData.color === col ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            {/* Mascot Override */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Mascot Skin for this Workspace
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_SKINS.map((skin) => (
                  <button
                    key={skin}
                    type="button"
                    onClick={() => setFormData({ ...formData, mascotSkinOverride: skin })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium capitalize border transition-all ${
                      formData.mascotSkinOverride === skin
                        ? 'bg-purple-600/30 text-white border-purple-500'
                        : 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    {skin}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingWorkspace(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Workspace</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
