import React, { useState } from 'react';
import { Category, CategoryId, RobotExpression } from '../../types';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  GitMerge,
  Sparkles,
  Check,
  X,
  Palette,
} from 'lucide-react';
import { soundEngine } from '../../services/soundEffects';

interface CategoryManagerViewProps {
  categories: Category[];
  onCreateCategory: (cat: Category) => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: CategoryId) => void;
  onMergeCategories: (sourceId: CategoryId, targetId: CategoryId) => void;
  tabCountByCategory: Record<string, number>;
}

const PRESET_COLORS = [
  '#8B5CF6',
  '#10B981',
  '#EC4899',
  '#06B6D4',
  '#F43F5E',
  '#F59E0B',
  '#6366F1',
  '#14B8A6',
  '#84CC16',
  '#A855F7',
  '#3B82F6',
  '#E11D48',
];

const MASCOT_MOODS: RobotExpression[] = [
  'focused',
  'happy',
  'alert',
  'chill',
  'turbo',
  'zen',
  'wink',
];

export const CategoryManagerView: React.FC<CategoryManagerViewProps> = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onMergeCategories,
  tabCountByCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [mergeSource, setMergeSource] = useState<CategoryId>('');
  const [mergeTarget, setMergeTarget] = useState<CategoryId>('');
  const [showMergeModal, setShowMergeModal] = useState(false);

  // Form State for create/edit
  const [formData, setFormData] = useState<Category>({
    id: '',
    name: '',
    description: '',
    color: '#8B5CF6',
    bgGradient: 'from-purple-500/20 to-indigo-500/10',
    icon: 'Folder',
    mascotMood: 'focused',
    mascotOverlay: 'default',
    rules: [],
    isBuiltIn: false,
  });

  const handleStartCreate = () => {
    soundEngine.playClick();
    setFormData({
      id: 'cat-' + Date.now(),
      name: '',
      description: '',
      color: '#8B5CF6',
      bgGradient: 'from-purple-500/20 to-indigo-500/10',
      icon: 'Folder',
      mascotMood: 'focused',
      mascotOverlay: 'default',
      rules: ['example.com'],
      isBuiltIn: false,
    });
    setIsCreating(true);
    setEditingCategory(null);
  };

  const handleStartEdit = (cat: Category) => {
    soundEngine.playClick();
    setFormData({ ...cat });
    setEditingCategory(cat);
    setIsCreating(false);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    soundEngine.playHappy();
    if (isCreating) {
      onCreateCategory(formData);
    } else {
      onUpdateCategory(formData);
    }

    setIsCreating(false);
    setEditingCategory(null);
  };

  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    const clean = newRuleInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (!formData.rules.includes(clean)) {
      setFormData({
        ...formData,
        rules: [...formData.rules, clean],
      });
      setNewRuleInput('');
    }
  };

  const handleRemoveRule = (ruleToRemove: string) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((r) => r !== ruleToRemove),
    });
  };

  const handleExecuteMerge = () => {
    if (!mergeSource || !mergeTarget || mergeSource === mergeTarget) return;
    soundEngine.playHappy();
    onMergeCategories(mergeSource, mergeTarget);
    setShowMergeModal(false);
    setMergeSource('');
    setMergeTarget('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold font-mono">
            Classification Engine
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Category Management</h1>
          <p className="text-xs text-slate-400">
            Define classification categories, domain routing rules, and mascot reaction styles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowMergeModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-medium border border-white/10 transition-all"
          >
            <GitMerge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Merge Categories</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const tabCount = tabCountByCategory[cat.id] || 0;
          return (
            <div
              key={cat.id}
              className="glass-panel rounded-3xl p-5 border border-white/10 flex flex-col justify-between gap-4 hover:border-purple-500/30 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-lg shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {cat.name}
                    </h3>
                  </div>

                  <span className="text-[11px] font-mono tabular-nums text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                    {tabCount} active {tabCount === 1 ? 'tab' : 'tabs'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {cat.description}
                </p>

                {/* Domain Rules Preview */}
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span>Domain Match Rules</span>
                    <span className="font-mono">{cat.rules.length} patterns</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {cat.rules.slice(0, 6).map((rule) => (
                      <span
                        key={rule}
                        className="text-[10px] font-mono bg-white/[0.04] text-slate-300 border border-white/5 px-2 py-0.5 rounded-md"
                      >
                        {rule}
                      </span>
                    ))}
                    {cat.rules.length > 6 && (
                      <span className="text-[10px] font-mono text-purple-400 self-center">
                        +{cat.rules.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  Mood: <span className="text-slate-200 capitalize">{cat.mascotMood}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {!cat.isBuiltIn && (
                    <button
                      onClick={() => {
                        soundEngine.playAlert();
                        onDeleteCategory(cat.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Category"
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

      {/* Edit / Create Category Modal */}
      {(isCreating || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <form
            onSubmit={handleSaveCategory}
            className="glass-panel w-full max-w-lg p-6 sm:p-7 rounded-3xl border border-white/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {isCreating ? 'Create Category' : `Edit: ${editingCategory?.name}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCategory(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Design & 3D, Cloud Infrastructure"
                className="w-full bg-[#080B12] text-sm text-slate-100 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of websites in this category"
                className="w-full bg-[#080B12] text-xs text-slate-200 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" /> Category Accent Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((col) => (
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

            {/* Mascot Mood */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Mascot Expression Mood
              </label>
              <div className="grid grid-cols-4 gap-2">
                {MASCOT_MOODS.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setFormData({ ...formData, mascotMood: mood })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium capitalize border transition-all ${
                      formData.mascotMood === mood
                        ? 'bg-purple-600/30 text-white border-purple-500'
                        : 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain Patterns */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Domain Match Rules ({formData.rules.length})
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  placeholder="e.g. *.cursor.com or replit.com"
                  className="flex-1 bg-[#080B12] text-xs text-slate-200 p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-3 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold"
                >
                  Add Rule
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#080B12] rounded-xl border border-white/10">
                {formData.rules.map((rule) => (
                  <span
                    key={rule}
                    className="flex items-center gap-1 text-[11px] font-mono bg-white/[0.05] text-slate-200 px-2 py-1 rounded-md"
                  >
                    <span>{rule}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(rule)}
                      className="text-slate-400 hover:text-rose-400 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCategory(null);
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
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              Merge Two Categories
            </h3>
            <p className="text-xs text-slate-400">
              Transfer all tabs and domain rules from a source category into a target category.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Source Category (will be merged & removed)
                </label>
                <select
                  value={mergeSource}
                  onChange={(e) => setMergeSource(e.target.value)}
                  className="w-full bg-[#080B12] text-xs text-slate-200 p-2.5 rounded-xl border border-white/10"
                >
                  <option value="">Select source category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.id === mergeTarget}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Category (will receive tabs & rules)
                </label>
                <select
                  value={mergeTarget}
                  onChange={(e) => setMergeTarget(e.target.value)}
                  className="w-full bg-[#080B12] text-xs text-slate-200 p-2.5 rounded-xl border border-white/10"
                >
                  <option value="">Select target category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.id === mergeSource}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowMergeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteMerge}
                disabled={!mergeSource || !mergeTarget || mergeSource === mergeTarget}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-xl"
              >
                Merge Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
