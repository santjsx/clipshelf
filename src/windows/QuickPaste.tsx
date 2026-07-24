import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Search, Code, FileText, Link as LinkIcon, Palette, File } from 'lucide-react';
import { Clip } from '../hooks/useClips';

export const QuickPasteWindow: React.FC = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchClips = async (search: string) => {
    try {
      if (search.trim()) {
        const results = await invoke<Clip[]>('search_clips', { query: search });
        setClips(results);
      } else {
        const results = await invoke<Clip[]>('get_clips', { limit: 20, offset: 0, filter: null });
        setClips(results);
      }
      setSelectedIndex(0);
    } catch (e) {
      console.log('Quick paste fetch fallback:', e);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
    fetchClips(query);
  }, [query]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, clips.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (clips[selectedIndex] && clips[selectedIndex].id) {
        await invoke('paste_clip', { id: clips[selectedIndex].id });
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      await invoke('hide_quick_paste');
    }
  };

  const handleItemClick = async (clipId: number | undefined) => {
    if (clipId) {
      await invoke('paste_clip', { id: clipId });
    }
  };

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'code':
        return <Code className="w-4 h-4 text-cyan-400" />;
      case 'link':
        return <LinkIcon className="w-4 h-4 text-blue-400" />;
      case 'color':
        return <Palette className="w-4 h-4 text-amber-400" />;
      case 'file':
        return <File className="w-4 h-4 text-emerald-400" />;
      case 'text':
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const elapsed = Math.floor(Date.now() / 1000) - timestamp;
    if (elapsed < 60) return 'Just now';
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
    return `${Math.floor(elapsed / 86400)}d ago`;
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="w-full h-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl flex flex-col overflow-hidden shadow-2xl select-none"
    >
      {/* Search Header */}
      <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3 bg-slate-950/40">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clips... (Ctrl+Shift+V)"
          className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-sm font-sans"
        />
        <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
          ESC
        </kbd>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {clips.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-xs text-slate-500">
            No matching clips found
          </div>
        ) : (
          clips.map((item, index) => (
            <div
              key={item.uuid}
              onClick={() => handleItemClick(item.id)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                selectedIndex === index
                  ? 'bg-blue-600/20 border-blue-500/60 text-white shadow-md'
                  : 'bg-slate-800/40 border-transparent hover:bg-slate-800/70 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1 mr-4">
                <div className="p-1.5 rounded-md bg-slate-900 border border-slate-700/60 shrink-0">
                  {renderTypeIcon(item.content_type)}
                </div>
                <span className="font-mono text-xs truncate max-w-[500px]">
                  {item.content_type === 'color' && item.text_content ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded border border-white/20"
                        style={{ backgroundColor: item.text_content }}
                      />
                      <span>{item.text_content}</span>
                    </div>
                  ) : (
                    item.text_content || item.asset_path
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                <span className="bg-slate-900 px-2 py-0.5 rounded text-[11px] border border-slate-700/50">
                  {item.source_app_display || item.source_app_name}
                </span>
                <span className="text-[11px] w-14 text-right">{formatTimestamp(item.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Navigation Hints */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-800 px-1 rounded border border-slate-700">↑</kbd>
            <kbd className="bg-slate-800 px-1 rounded border border-slate-700">↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-800 px-1 rounded border border-slate-700">↵</kbd> Paste
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-800 px-1 rounded border border-slate-700">Esc</kbd> Close
          </span>
        </div>
        <span className="text-slate-500 font-mono text-[10px]">ClipShelf Quick Paste</span>
      </div>
    </div>
  );
};
