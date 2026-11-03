import React, { useState } from 'react';
import { BookmarkItem, Category } from '../../types';
import {
  Bookmark,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Folder,
  FolderPlus,
  X,
  Check,
} from 'lucide-react';
import { soundEngine } from '../../services/soundEffects';

interface BookmarkManagerViewProps {
  bookmarks: BookmarkItem[];
  categories: Category[];
  onAddBookmark: (bm: BookmarkItem) => void;
  onDeleteBookmark: (id: string) => void;
  onOpenTab: (url: string) => void;
}

export const BookmarkManagerView: React.FC<BookmarkManagerViewProps> = ({
  bookmarks,
  categories,
  onAddBookmark,
  onDeleteBookmark,
  onOpenTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Bookmark form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [folder, setFolder] = useState('General');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'ai');

  const folders = Array.from(new Set(bookmarks.map((b) => b.folder || 'General')));

  const filteredBookmarks = bookmarks.filter((bm) => {
    const matchesSearch =
      bm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bm.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || bm.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleSaveBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    soundEngine.playHappy();
    const formattedUrl = url.startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const domain = new URL(formattedUrl).hostname;

    const newBm: BookmarkItem = {
      id: 'bm-' + Date.now(),
      title: title.trim(),
      url: formattedUrl,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      folder: folder.trim() || 'General',
      categoryId,
      createdAt: Date.now(),
    };

    onAddBookmark(newBm);
    setTitle('');
    setUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold font-mono">
            Navigation Index
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Bookmark Manager</h1>
          <p className="text-xs text-slate-400">
            Categorized bookmark library synchronized across your workspaces
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Bookmark</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookmarks by title or domain..."
            className="w-full bg-[#0E131E] text-xs text-slate-100 placeholder:text-slate-500 rounded-xl pl-9 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="w-full bg-[#0E131E] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2.5 cursor-pointer hover:border-purple-500/40 focus:outline-none"
          >
            <option value="all">All Folders ({bookmarks.length})</option>
            {folders.map((f) => {
              const count = bookmarks.filter((b) => b.folder === f).length;
              return (
                <option key={f} value={f}>
                  {f} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBookmarks.map((bm) => {
          const cat = categories.find((c) => c.id === bm.categoryId);
          return (
            <div
              key={bm.id}
              className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-3 hover:border-purple-500/30 transition-all group"
            >
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onOpenTab(bm.url);
                }}
                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
              >
                <img
                  src={bm.favicon || `https://www.google.com/s2/favicons?domain=${new URL(bm.url || 'https://google.com').hostname}&sz=64`}
                  alt=""
                  className="w-5 h-5 rounded shrink-0 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                    {bm.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span style={{ color: cat?.color }}>{bm.folder}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono truncate max-w-[120px]">
                      {new URL(bm.url || 'https://google.com').hostname}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenTab(bm.url);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Open bookmark"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    soundEngine.playAlert();
                    onDeleteBookmark(bm.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBookmarks.length === 0 && (
        <div className="glass-panel rounded-3xl p-8 text-center text-slate-500 text-xs">
          No bookmarks match your search. Click "Add Bookmark" above to save quick links.
        </div>
      )}

      {/* Add Bookmark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <form
            onSubmit={handleSaveBookmark}
            className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Add New Bookmark</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Bookmark Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. OpenAI Documentation"
                className="w-full bg-[#080B12] text-sm text-slate-100 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#080B12] text-xs text-slate-200 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="e.g. Work, Tools"
                  className="w-full bg-[#080B12] text-xs text-slate-200 p-2.5 rounded-xl border border-white/10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#080B12] text-xs text-slate-200 p-2.5 rounded-xl border border-white/10"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl"
              >
                Save Bookmark
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
