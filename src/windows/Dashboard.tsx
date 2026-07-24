import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useClips } from '../hooks/useClips';
import { ClipCard } from '../components/ClipCard';
import { ClipRow } from '../components/ClipRow';
import { BoardColumn } from '../components/BoardColumn';
import { useToast } from '../components/Toast';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Columns3,
  Shield,
  Folder,
  Code,
  FileText,
  Link as LinkIcon,
  Plus,
  X,
  Pipette,
  Trash2,
  Image as ImageIcon,
  Palette,
  File,
  AlertTriangle,
  Sparkles,
  Command,
} from 'lucide-react';

export const DashboardWindow: React.FC = () => {
  const {
    clips,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    togglePin,
    deleteClip,
    clearAllClips,
    addCategory,
    assignClipToCategory,
  } = useClips();

  const { showToast } = useToast();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [sampledColor, setSampledColor] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcuts (Jakob's Law & Efficiency)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus Search Bar on '/' or 'Ctrl+F'
      if ((e.key === '/' || (e.ctrlKey && e.key === 'f')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Clear Search or close modals on 'Escape'
      if (e.key === 'Escape') {
        if (isCategoryModalOpen) setIsCategoryModalOpen(false);
        else if (isClearModalOpen) setIsClearModalOpen(false);
        else if (searchQuery) setSearchQuery('');
        else searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCategoryModalOpen, isClearModalOpen, searchQuery, setSearchQuery]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim(), newCatColor);
      showToast(`Collection "${newCatName.trim()}" created!`, 'success');
      setNewCatName('');
      setIsCategoryModalOpen(false);
    }
  };

  const handlePickColor = async () => {
    try {
      const hexColor = await invoke<string>('sample_color_at_cursor');
      if (hexColor) {
        const hexStr = String(hexColor);
        setSampledColor(hexStr);
        navigator.clipboard.writeText(hexStr);
        showToast(`Sampled color ${hexStr} copied to clipboard!`, 'success');
      }
    } catch (e) {
      console.log('Color picker error:', e);
      showToast('Color sampling cancelled', 'info');
    }
  };

  const handleConfirmClearAll = () => {
    clearAllClips();
    setIsClearModalOpen(false);
    showToast('Clipboard history cleared', 'info');
  };

  const filterTabs = [
    { id: 'all', label: 'All Items', icon: Folder },
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'link', label: 'Links', icon: LinkIcon },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'file', label: 'Files', icon: File },
    { id: 'color', label: 'Colors', icon: Palette },
  ];

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      {/* Top Header Navigation Bar */}
      <header className="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
            CS
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-slate-100 flex items-center gap-2">
              ClipShelf
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-normal">
                v0.1.0
              </span>
            </h1>
          </div>
        </div>

        {/* Global Search Bar (Fitts's & Hick's Law) */}
        <div className="flex-1 max-w-lg mx-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search text, code, links, colors, and OCR images... (Press '/' to focus)"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-12 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-slate-500"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-0.5"
              title="Clear search (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              <Command className="w-2.5 h-2.5" />
              <span>/</span>
            </div>
          )}
        </div>

        {/* Color Sampler, Clear All & View Mode Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePickColor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 transition shadow-sm"
            title="Sample pixel color anywhere under cursor"
          >
            <Pipette className="w-3.5 h-3.5" />
            {sampledColor ? sampledColor : 'Color Picker'}
          </button>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-700/50 text-xs font-medium text-slate-400 hover:text-rose-400 transition"
            title="Clear all stored clips"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>

          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                viewMode === 'card' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                viewMode === 'board' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <Columns3 className="w-3.5 h-3.5" />
              Board
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-56 border-r border-slate-800/80 bg-slate-950/40 p-3.5 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Filter Categories */}
            <div>
              <div className="flex items-center justify-between px-2.5 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Content Types
                </span>
              </div>
              <nav className="space-y-1">
                {filterTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 font-semibold'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Custom Folders / Collections */}
            <div>
              <div className="flex items-center justify-between px-2.5 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Custom Collections
                </span>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-blue-400 transition"
                  title="Create New Folder"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <nav className="space-y-1 max-h-44 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="px-2.5 py-1 text-[11px] text-slate-600 italic">No collections yet</p>
                ) : (
                  categories.map((cat) => {
                    const isCatActive = activeCategory === `cat_${cat.id}`;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(`cat_${cat.id}`)}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                          isCatActive
                            ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 font-semibold'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: cat.color || '#3b82f6' }}
                        />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })
                )}
              </nav>
            </div>
          </div>

          {/* Privacy Protection Badge */}
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs shadow-inner">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <Shield className="w-4 h-4 shrink-0" />
              Privacy Shield Active
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              100% local database. Passwords, API keys, and sensitive entries are auto-blocked.
            </p>
          </div>
        </aside>

        {/* Center Presentation View */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-base font-bold text-slate-100 capitalize flex items-center gap-2">
                {activeCategory.startsWith('cat_')
                  ? categories.find((c) => `cat_${c.id}` === activeCategory)?.name || 'Custom Collection'
                  : activeCategory === 'all'
                  ? 'All History'
                  : `${activeCategory} Clips`}
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                {searchQuery ? `Search results for "${searchQuery}"` : 'Everything automatically captured from your PC'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{clips.length} {clips.length === 1 ? 'item' : 'items'}</span>
            </div>
          </div>

          {/* Render View Presentation */}
          {clips.length === 0 ? (
            <div className="h-[400px] border-2 border-dashed border-slate-800/80 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-slate-900/20">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-xl">
                <FileText className="w-7 h-7 text-blue-400/80" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                {searchQuery ? 'No matching clips found' : 'No clipboard items yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                {searchQuery
                  ? 'Try searching for a different keyword or filter category.'
                  : 'Copy text, code, colors, or take a screenshot (Win+Shift+S). They will instantly appear here!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium shadow-lg transition"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : viewMode === 'card' ? (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-0">
              {clips.map((clip) => (
                <ClipCard key={clip.uuid} clip={clip} onPin={togglePin} onDelete={deleteClip} />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2.5">
              {clips.map((clip) => (
                <ClipRow key={clip.uuid} clip={clip} onPin={togglePin} onDelete={deleteClip} />
              ))}
            </div>
          ) : (
            /* Kanban Board View */
            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-180px)]">
              <BoardColumn
                category={{ id: 0, name: 'Uncategorized', color: '#64748b' }}
                clips={clips.filter((c) => !c.category_ids || c.category_ids.length === 0)}
                onPin={togglePin}
                onDelete={deleteClip}
                onDropClip={assignClipToCategory}
              />
              {categories.map((cat) => (
                <BoardColumn
                  key={cat.id}
                  category={cat}
                  clips={clips.filter((c) => c.category_ids?.includes(cat.id))}
                  onPin={togglePin}
                  onDelete={deleteClip}
                  onDropClip={assignClipToCategory}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Collection Modal */}
      {isCategoryModalOpen && (
        <div
          onClick={() => setIsCategoryModalOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100">Create New Collection</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Collection Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Snippets & Ideas"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Badge Color</label>
                <div className="flex items-center gap-2.5">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        newCatColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Clear History Modal (Error Prevention UX Law) */}
      {isClearModalOpen && (
        <div
          onClick={() => setIsClearModalOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Clear Clipboard History?</h3>
                <p className="text-xs text-slate-400 font-sans">This will delete all stored clips. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
