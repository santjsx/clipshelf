import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileText, Download, Hash } from 'lucide-react';
import { Clip } from '../hooks/useClips';
import { useToast } from './Toast';

interface TextModalProps {
  clip: Clip;
  onClose: () => void;
  onPin?: (id: number, currentPinned: boolean) => void;
}

export const TextModal: React.FC<TextModalProps> = ({ clip, onClose }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isMono, setIsMono] = useState(false);

  const textContent = clip.text_content || clip.asset_path || 'No text content available';
  const charCount = textContent.length;
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const lineCount = textContent.split('\n').length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    showToast('Copied full text to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clip_${clip.id || 'text'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded as text file', 'success');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Full Text Payload
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {clip.content_type.toUpperCase()}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Source: {clip.source_app_display || clip.source_app_name || 'System'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMono(!isMono)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                isMono
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Toggle Monospace Code View"
            >
              {isMono ? 'Monospace ON' : 'Sans-Serif'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/80">
          <div
            className={`p-4 bg-slate-900/90 rounded-xl border border-slate-800/80 text-xs text-slate-100 leading-relaxed whitespace-pre-wrap break-words select-text ${
              isMono ? 'font-mono text-cyan-300' : 'font-sans'
            }`}
          >
            {textContent}
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-500" />
              {charCount} chars
            </span>
            <span>•</span>
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{lineCount} lines</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Full Text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
