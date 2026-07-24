import React, { useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Clip } from '../hooks/useClips';
import { useToast } from './Toast';
import { ImageModal } from './ImageModal';
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
  ZoomIn,
  ExternalLink,
} from 'lucide-react';

interface ClipCardProps {
  clip: Clip;
  onPin: (id: number, currentPinned: boolean) => void;
  onDelete: (id: number) => void;
}

export const ClipCard: React.FC<ClipCardProps> = ({ clip, onPin, onDelete }) => {
  const { showToast } = useToast();
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'code':
        return <Code className="w-3.5 h-3.5 text-cyan-400" />;
      case 'link':
        return <LinkIcon className="w-3.5 h-3.5 text-blue-400" />;
      case 'color':
        return <Palette className="w-3.5 h-3.5 text-amber-400" />;
      case 'file':
        return <File className="w-3.5 h-3.5 text-emerald-400" />;
      case 'image':
      case 'screenshot':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
      case 'text':
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
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
  const charCount = textVal.length;

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
        aria-label={`Bento card: ${clip.content_type}`}
        className={`break-inside-avoid inline-block w-full group bg-slate-900/90 hover:bg-slate-800/90 border rounded-2xl p-3.5 transition-all duration-200 shadow-md hover:shadow-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 mb-4 ${
          clip.is_pinned
            ? 'border-amber-500/60 shadow-amber-500/5 bg-slate-900/95 ring-1 ring-amber-500/30'
            : 'border-slate-800 hover:border-blue-500/50'
        }`}
      >
        {/* Bento Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 shadow-inner">
              {renderTypeIcon(clip.content_type)}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              {clip.content_type}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {clip.is_pinned && (
              <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            )}
            <span className="text-[10px] font-medium bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-slate-400 truncate max-w-[120px]">
              {clip.source_app_display || clip.source_app_name || 'System'}
            </span>
          </div>
        </div>

        {/* Bento Content - Height Adapts Strictly to Content Type */}
        <div className="my-1.5">
          {/* COLOR TYPE */}
          {clip.content_type === 'color' && clip.text_content ? (
            <div className="flex items-center gap-3 p-2 bg-slate-950/70 rounded-xl border border-slate-800">
              <span
                className="w-8 h-8 rounded-lg border border-white/20 shadow-md shrink-0"
                style={{ backgroundColor: clip.text_content }}
              />
              <span className="text-xs font-mono font-semibold text-slate-100">{clip.text_content}</span>
            </div>
          ) : /* LINK TYPE */
          clip.content_type === 'link' && clip.text_content ? (
            <div className="p-2.5 bg-blue-950/20 rounded-xl border border-blue-900/40 space-y-1.5">
              <a
                href={clip.text_content}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1.5 break-all line-clamp-2"
              >
                <span>{clip.text_content}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
              </a>
            </div>
          ) : /* CODE TYPE */
          clip.content_type === 'code' && clip.text_content ? (
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/90 font-mono text-xs text-cyan-300 leading-relaxed overflow-hidden max-h-40 relative">
              <pre className="whitespace-pre-wrap break-all line-clamp-6">{clip.text_content}</pre>
            </div>
          ) : /* IMAGE / SCREENSHOT TYPE */
          imageSrc ? (
            <div className="space-y-1.5 relative group/img">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomOpen(true);
                }}
                className="relative overflow-hidden rounded-xl border border-slate-800 shadow-inner bg-slate-950 cursor-zoom-in"
              >
                <img
                  src={imageSrc}
                  alt="Captured visual clip"
                  className="w-full object-cover max-h-60 rounded-xl transition-transform duration-300 group-hover/img:scale-102"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white gap-1 text-xs font-medium backdrop-blur-[1px]">
                  <ZoomIn className="w-4 h-4" />
                  <span>Expand Preview</span>
                </div>
              </div>
              {clip.ocr_text && (
                <div className="text-[11px] text-slate-400 font-sans italic bg-slate-950/80 p-2 rounded-lg border border-slate-800 line-clamp-2">
                  OCR: {clip.ocr_text}
                </div>
              )}
            </div>
          ) : (clip.content_type === 'image' || clip.content_type === 'screenshot') ? (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3 text-slate-400">
              <ImageIcon className="w-5 h-5 text-purple-400 shrink-0" />
              <div className="text-[11px]">
                <p className="font-semibold text-slate-300">Visual Screenshot Clip</p>
                <p className="text-[10px] text-slate-500">Copy new screenshot to preview</p>
              </div>
            </div>
          ) : /* STANDARD TEXT OR FILE */
          (
            <div className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap break-all line-clamp-4">
              {textVal}
            </div>
          )}
        </div>

        {/* Bento Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2.5 mt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-sans">
              <Clock className="w-3 h-3" />
              {formatTimestamp(clip.created_at)}
            </span>
            {charCount > 0 && !imageSrc && (
              <span className="text-[10px] text-slate-600 font-mono">
                {charCount} chars
              </span>
            )}
          </div>

          <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition duration-150 flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-slate-800 hover:text-blue-400 rounded-lg transition"
              title="Copy to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {clip.id && (
              <>
                <button
                  onClick={handleTogglePin}
                  className={`p-1 hover:bg-slate-800 rounded-lg transition ${
                    clip.is_pinned ? 'text-amber-400' : 'hover:text-amber-400'
                  }`}
                  title={clip.is_pinned ? 'Unpin clip' : 'Pin clip'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 hover:bg-slate-800 hover:text-rose-400 rounded-lg transition"
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
    </>
  );
};
