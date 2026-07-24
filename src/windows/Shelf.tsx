import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Clipboard, Code, FileText, Link as LinkIcon, Palette, File, GripHorizontal } from 'lucide-react';
import { Clip } from '../hooks/useClips';

export const ShelfWindow: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);

  const fetchClips = async () => {
    try {
      const results = await invoke<Clip[]>('get_clips', { limit: 8, offset: 0, filter: null });
      setClips(results);
    } catch (e) {
      console.log('Shelf fetch fallback:', e);
    }
  };

  useEffect(() => {
    fetchClips();

    let unlisten: (() => void) | undefined;
    const setupListener = async () => {
      try {
        unlisten = await listen<Clip>('clip-captured', (event) => {
          setClips((prev) => [event.payload, ...prev.filter((c) => c.uuid !== event.payload.uuid)].slice(0, 8));
        });
      } catch (e) {
        console.log('Shelf listener preview fallback:', e);
      }
    };
    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'code':
        return <Code className="w-3 h-3 text-cyan-400 shrink-0" />;
      case 'link':
        return <LinkIcon className="w-3 h-3 text-blue-400 shrink-0" />;
      case 'color':
        return <Palette className="w-3 h-3 text-amber-400 shrink-0" />;
      case 'file':
        return <File className="w-3 h-3 text-emerald-400 shrink-0" />;
      case 'text':
      default:
        return <FileText className="w-3 h-3 text-slate-400 shrink-0" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, clip: Clip) => {
    const textData = clip.text_content || clip.asset_path || '';
    e.dataTransfer.setData('text/plain', textData);
    if (clip.content_type === 'link') {
      e.dataTransfer.setData('text/uri-list', textData);
    }
  };

  const handlePasteClip = async (clipId: number | undefined) => {
    if (clipId) {
      await invoke('paste_clip', { id: clipId });
    }
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center select-none overflow-hidden bg-transparent"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`bg-slate-900/90 border border-slate-700/60 backdrop-blur-xl transition-all duration-200 shadow-xl flex items-center overflow-hidden ${
          isExpanded
            ? 'rounded-xl px-2.5 py-1 w-[400px] h-[52px]'
            : 'rounded-full px-2.5 py-0.5 w-[130px] h-[24px]'
        }`}
      >
        {!isExpanded ? (
          <div
            data-tauri-drag-region
            className="flex items-center justify-between w-full cursor-grab active:cursor-grabbing text-[11px] font-medium text-slate-300 px-0.5"
            title="Click & drag to reposition anywhere on screen"
          >
            <div data-tauri-drag-region className="flex items-center gap-1.5 pointer-events-none">
              <Clipboard className="w-3 h-3 text-blue-400" />
              <span className="font-semibold tracking-wide">ClipShelf</span>
            </div>
            <GripHorizontal className="w-3 h-3 text-slate-500 hover:text-slate-300 transition" />
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <div data-tauri-drag-region className="cursor-grab active:cursor-grabbing p-1 shrink-0 text-slate-500 hover:text-slate-300">
              <GripHorizontal className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar w-full">
              {clips.length === 0 ? (
                <span className="text-[11px] text-slate-500 font-sans px-1">No recent clips</span>
              ) : (
                clips.map((clip) => (
                  <div
                    key={clip.uuid}
                    draggable
                    onDragStart={(e) => handleDragStart(e, clip)}
                    onClick={() => handlePasteClip(clip.id)}
                    className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/50 rounded-md px-2 py-1 text-[11px] cursor-grab active:cursor-grabbing transition shrink-0 max-w-[120px]"
                    title="Click to paste or drag into any app"
                  >
                    {renderTypeIcon(clip.content_type)}
                    {clip.content_type === 'color' && clip.text_content ? (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: clip.text_content }}
                      />
                    ) : null}
                    <span className="truncate font-mono text-[10px] text-slate-200">
                      {clip.text_content || clip.asset_path}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
