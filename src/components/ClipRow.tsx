import React, { useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Clip } from '../hooks/useClips';
import { useToast } from './Toast';
import { ImageModal } from './ImageModal';
import { TextModal } from './TextModal';
import {
  Code,
  FileText,
  Link as LinkIcon,
  Palette,
  File,
  Copy,
  Pin,
  Trash2,
  Clock,
  Image as ImageIcon,
  Maximize2,
} from 'lucide-react';

interface ClipRowProps {
  clip: Clip;
  onPin: (id: number, currentPinned: boolean) => void;
  onDelete: (id: number) => void;
}

export const ClipRow: React.FC<ClipRowProps> = ({ clip, onPin, onDelete }) => {
  const { showToast } = useToast();
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isTextExpandOpen, setIsTextExpandOpen] = useState(false);

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
      case 'image':
      case 'screenshot':
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case 'text':
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const elapsed = Math.floor(Date.now() / 1000) - timestamp;
    if (elapsed < 60) return 'Just now';
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
    return `${Math.floor(elapsed / 86400)}d ago`;
  };

  const getImageSrc = (): string | null => {
    if (clip.text_content && (clip.text_content.startsWith('data:image/') || clip.text_content.startsWith('http://') || clip.text_content.startsWith('https://'))) {
      return clip.text_content;
    }
    if (clip.asset_path && (clip.asset_path.startsWith('data:image/') || clip.asset_path.startsWith('http://') || clip.asset_path.startsWith('https://'))) {
      return clip.asset_path;
    }
    const rawPath = clip.asset_path || clip.text_content;
    if (!rawPath) return null;
    try {
      return convertFileSrc(rawPath);
    } catch {
      return rawPath;
    }
  };

  const imageSrc = getImageSrc();

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (clip.text_content) {
      navigator.clipboard.writeText(clip.text_content);
      showToast('Copied to clipboard!', 'success');
    } else if (imageSrc) {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
          showToast('Image copied to clipboard!', 'success');
        })
        .catch(() => showToast('Failed to copy image', 'error'));
    }
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clip.id) {
      onPin(clip.id, clip.is_pinned);
      showToast(clip.is_pinned ? 'Unpinned clip' : 'Pinned clip', 'info');
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clip.id) {
      onDelete(clip.id);
      showToast('Clip deleted', 'info');
    }
  };

  const textVal = clip.text_content || clip.asset_path || '';

  return (
    <>
      <div
        draggable
        onDragStart={(e) => {
          if (clip.id) {
            e.dataTransfer.setData('text/plain', String(clip.id));
          }
        }}
        onClick={() => handleCopy()}
        tabIndex={0}
        role="button"
        aria-label={`Clipboard row: ${clip.content_type}`}
        className={`group bg-slate-900/80 hover:bg-slate-800/90 border rounded-xl p-3.5 transition duration-150 flex items-center justify-between shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${
          clip.is_pinned ? 'border-amber-500/60 shadow-amber-500/5 bg-slate-900/95' : 'border-slate-800 hover:border-blue-500/40'
        }`}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-4">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
            {renderTypeIcon(clip.content_type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
                {clip.content_type}
              </span>
              <span className="text-[10px] font-medium bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                {clip.source_app_display || clip.source_app_name || 'System'}
              </span>
              {clip.is_pinned && (
                <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />
              )}
            </div>

            <div className="text-xs font-sans text-slate-100 truncate">
              {clip.content_type === 'color' && clip.text_content ? (
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded border border-white/20 inline-block"
                    style={{ backgroundColor: clip.text_content }}
                  />
                  <span className="font-mono">{clip.text_content}</span>
                </div>
              ) : imageSrc ? (
                <div className="flex items-center gap-2">
                  <img
                    src={imageSrc}
                    alt="Clip preview"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZoomOpen(true);
                    }}
                    className="w-9 h-9 object-cover rounded-lg border border-slate-700 bg-slate-950 shrink-0 hover:scale-105 transition cursor-zoom-in"
                  />
                  <span className="text-slate-400 italic text-xs truncate">
                    {clip.ocr_text || 'Visual Image Content (Click to expand)'}
                  </span>
                </div>
              ) : textVal.trim() !== '' ? (
                <span>{textVal}</span>
              ) : (
                <span className="text-slate-400 font-semibold">Captured Text Snippet (Click to view full text)</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500 shrink-0">
          <span className="text-[11px] flex items-center gap-1 font-sans">
            <Clock className="w-3 h-3" />
            {formatTimestamp(clip.created_at)}
          </span>

          <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition duration-150 flex items-center gap-1 border-l border-slate-800 pl-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTextExpandOpen(true);
              }}
              className="p-1.5 hover:bg-slate-800 hover:text-blue-400 rounded-lg transition"
              title="Expand full text"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-slate-800 hover:text-blue-400 rounded-lg transition"
              title="Copy to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {clip.id && (
              <>
                <button
                  onClick={handleTogglePin}
                  className={`p-1.5 hover:bg-slate-800 rounded-lg transition ${
                    clip.is_pinned ? 'text-amber-400' : 'hover:text-amber-400'
                  }`}
                  title={clip.is_pinned ? 'Unpin clip' : 'Pin clip'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 hover:bg-slate-800 hover:text-rose-400 rounded-lg transition"
                  title="Delete clip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isZoomOpen && imageSrc && (
        <ImageModal imageSrc={imageSrc} onClose={() => setIsZoomOpen(false)} />
      )}

      {isTextExpandOpen && (
        <TextModal clip={clip} onClose={() => setIsTextExpandOpen(false)} onPin={onPin} />
      )}
    </>
  );
};
