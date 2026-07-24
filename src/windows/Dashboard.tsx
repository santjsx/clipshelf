import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useClips } from '../hooks/useClips';
import { ClipCard } from '../components/ClipCard';
import { ClipRow } from '../components/ClipRow';
import { BoardColumn } from '../components/BoardColumn';
import { useToast } from '../components/Toast';
import logoImg from '../assets/logo.png';
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
  Settings as SettingsIcon,
  Sliders,
  Keyboard,
  Info,
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [sampledColor, setSampledColor] = useState<string | null>(null);

  // Settings State
  const [settingsTab, setSettingsTab] = useState<'general' | 'privacy' | 'shortcuts' | 'about'>('general');
  const [startOnLogin, setStartOnLogin] = useState(true);
  const [privacyFilterEnabled, setPrivacyFilterEnabled] = useState(true);
  const [accentColor, setAccentColor] = useState<'blue' | 'cyan' | 'purple' | 'emerald'>('blue');

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
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (searchQuery) setSearchQuery('');
        else searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCategoryModalOpen, isClearModalOpen, isSettingsOpen, searchQuery, setSearchQuery]);

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
    showToast('Unpinned history cleared (pinned items preserved)', 'info');
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

  const unpinnedCount = clips.filter((c) => !c.is_pinned).length;

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      {/* Top Header Navigation Bar */}
      <header className="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="ClipShelf Logo"
            className="w-8 h-8 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-400/30 object-cover"
          />
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

        {/* Color Sampler, Settings, Clear All & View Mode Controls */}
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
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition"
            title="Open Application Settings"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
            Settings
          </button>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-700/50 text-xs font-medium text-slate-400 hover:text-rose-400 transition"
            title="Clear unpinned clips history"
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
              title="Bento Masonry Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Bento
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Row List View"
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
              Kanban
            </button>
          </div>
        </div>
      </header>

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-56 border-r border-slate-800/80 bg-slate-900/40 p-3 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Quick Content Filters */}
            <div>
              <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Filter Clips
              </div>
              <div className="space-y-0.5">
                {filterTabs.map((tab) => {
                  const Icon = tab.icon;
                  const count =
                    tab.id === 'all'
                      ? clips.length
                      : clips.filter((c) => c.content_type === tab.id).length;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        activeCategory === tab.id
                          ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Collections */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Collections
                </span>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-slate-400 hover:text-blue-400 transition p-0.5"
                  title="New Collection"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(`cat-${cat.id}`)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                      activeCategory === `cat-${cat.id}`
                        ? 'bg-slate-800 text-slate-100 border border-slate-700'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || '#3b82f6' }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & System Status */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <Shield className="w-3.5 h-3.5" />
              <span>Local Privacy Shield Active</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Password managers & sensitive keys automatically filtered locally.
            </p>
          </div>
        </aside>

        {/* Content Workspace Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/60">
          {clips.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-900/20">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Your Clipboard Shelf is Empty</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Copy any text, code, web link, screenshot, or image to auto-save it to your local clipboard shelf.
              </p>
            </div>
          ) : viewMode === 'board' ? (
            /* Kanban Board Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full items-start">
              {[
                { id: 1, name: 'TEXT', color: '#3b82f6', type: 'text' },
                { id: 2, name: 'CODE', color: '#06b6d4', type: 'code' },
                { id: 3, name: 'LINKS', color: '#8b5cf6', type: 'link' },
                { id: 4, name: 'IMAGES', color: '#ec4899', type: 'image' },
              ].map((col) => (
                <BoardColumn
                  key={col.id}
                  category={{ id: col.id, name: col.name, color: col.color }}
                  clips={clips.filter((c) => c.content_type === col.type)}
                  onPin={togglePin}
                  onDelete={deleteClip}
                  onDropClip={(clipId, categoryId) => assignClipToCategory(clipId, categoryId)}
                />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            /* Compact Row List View */
            <div className="space-y-2.5 max-w-5xl mx-auto">
              {clips.map((clip) => (
                <ClipRow key={clip.id} clip={clip} onPin={togglePin} onDelete={deleteClip} />
              ))}
            </div>
          ) : (
            /* Masonry Bento Grid View */
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-0">
              {clips.map((clip) => (
                <ClipCard key={clip.id} clip={clip} onPin={togglePin} onDelete={deleteClip} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Collection Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Create New Collection</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Work Snippets, Colors, React Links"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Badge Color</label>
                <div className="flex items-center gap-2">
                  {['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        newCatColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Modal (Preserving Pinned Items) */}
      {isClearModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Clear Clipboard History</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to clear {unpinnedCount} unpinned item{unpinnedCount === 1 ? '' : 's'}?{' '}
                  <strong className="text-amber-400 font-semibold">Your pinned clips will be preserved safely.</strong>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition"
              >
                Clear Unpinned History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl h-[480px] shadow-2xl flex overflow-hidden">
            {/* Settings Sidebar */}
            <aside className="w-48 border-r border-slate-800 bg-slate-950/50 p-3 space-y-1 shrink-0 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="px-3 py-2 font-bold text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Settings
                </div>
                <button
                  onClick={() => setSettingsTab('general')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    settingsTab === 'general'
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  General
                </button>
                <button
                  onClick={() => setSettingsTab('privacy')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    settingsTab === 'privacy'
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Privacy
                </button>
                <button
                  onClick={() => setSettingsTab('shortcuts')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    settingsTab === 'shortcuts'
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Keyboard className="w-4 h-4" />
                  Shortcuts
                </button>
                <button
                  onClick={() => setSettingsTab('about')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    settingsTab === 'about'
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  About
                </button>
              </div>

              <div className="px-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
                ClipShelf v0.1.0
              </div>
            </aside>

            {/* Settings Main View */}
            <main className="flex-1 p-6 overflow-y-auto relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                  <h2 className="text-sm font-bold text-slate-100 capitalize">
                    {settingsTab} Settings
                  </h2>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-slate-400 hover:text-slate-200 transition p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {settingsTab === 'general' && (
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Start on Windows Login</div>
                        <div className="text-[11px] text-slate-400">Launch ClipShelf automatically when logging in</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={startOnLogin}
                        onChange={(e) => setStartOnLogin(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      />
                    </label>

                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-slate-200">Theme Accent</div>
                      <div className="flex items-center gap-2">
                        {[
                          { id: 'blue', color: '#3b82f6', label: 'Neon Blue' },
                          { id: 'cyan', color: '#06b6d4', label: 'Cyber Cyan' },
                          { id: 'purple', color: '#8b5cf6', label: 'Radiant Purple' },
                          { id: 'emerald', color: '#10b981', label: 'Emerald' },
                        ].map((acc) => (
                          <button
                            key={acc.id}
                            onClick={() => setAccentColor(acc.id as any)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition ${
                              accentColor === acc.id
                                ? 'border-blue-500 bg-blue-500/10 text-white'
                                : 'border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: acc.color }} />
                            <span>{acc.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'privacy' && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 leading-relaxed flex items-start gap-2.5">
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">100% Offline Local Storage</strong>
                        No clipboard text, code, or images leave your device. All data is kept securely in your local SQLite database.
                      </div>
                    </div>

                    <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Sensitive Process Filter</div>
                        <div className="text-[11px] text-slate-400">Ignore copies originating from password managers (*Bitwarden, 1Password, KeePass*)</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacyFilterEnabled}
                        onChange={(e) => setPrivacyFilterEnabled(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                )}

                {settingsTab === 'shortcuts' && (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-slate-300 font-medium">Global Quick Paste Window</span>
                      <kbd className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px]">
                        Ctrl + Shift + V
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-slate-300 font-medium">Focus Search Bar</span>
                      <kbd className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px]">
                        / or Ctrl + F
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-slate-300 font-medium">Dismiss Search / Close Modals</span>
                      <kbd className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px]">
                        Esc
                      </kbd>
                    </div>
                  </div>
                )}

                {settingsTab === 'about' && (
                  <div className="space-y-3 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <img src={logoImg} alt="Logo" className="w-10 h-10 rounded-xl border border-slate-800 shadow-md" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">ClipShelf Desktop</h3>
                        <p className="text-[11px] text-slate-400">Version 0.1.0 (Production Build)</p>
                      </div>
                    </div>
                    <p className="leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px]">
                      Open-source visual clipboard history manager built with Tauri v2, Rust, React 19, TypeScript, and SQLite FTS5.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md transition"
                >
                  Done
                </button>
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};
