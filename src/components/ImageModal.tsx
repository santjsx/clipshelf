import React from 'react';
import { X, Copy, Download } from 'lucide-react';

interface ImageModalProps {
  imageSrc: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageSrc, onClose }) => {
  if (!imageSrc) return null;

  const handleCopyImage = () => {
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
      })
      .catch((e) => console.error('Failed to copy image:', e));
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageSrc;
    a.download = `clipshelf_image_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-700/60 rounded-2xl p-4 shadow-2xl flex flex-col items-center overflow-hidden"
      >
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-300">Image Preview (Click anywhere outside to close)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyImage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition"
              title="Copy Image to Clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-blue-400" />
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition"
              title="Download Image"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="my-4 flex items-center justify-center overflow-auto max-h-[70vh] w-full">
          <img
            src={imageSrc}
            alt="Full size visual clip"
            className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg border border-slate-800 shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};
