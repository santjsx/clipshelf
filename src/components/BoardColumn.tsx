import React, { useState } from 'react';
import { Clip, Category } from '../hooks/useClips';
import { ClipCard } from './ClipCard';

interface BoardColumnProps {
  category: Category | { id: number; name: string; color: string };
  clips: Clip[];
  onPin: (id: number, currentPinned: boolean) => void;
  onDelete: (id: number) => void;
  onDropClip: (clipId: number, categoryId: number) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  category,
  clips,
  onPin,
  onDelete,
  onDropClip,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const clipIdStr = e.dataTransfer.getData('text/plain');
    if (clipIdStr) {
      const clipId = parseInt(clipIdStr, 10);
      if (!isNaN(clipId)) {
        onDropClip(clipId, category.id);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-80 shrink-0 bg-slate-950/40 rounded-2xl border p-3 flex flex-col h-full transition ${
        isDragOver ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between px-2 py-1.5 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color || '#3b82f6' }}
          />
          <h3 className="font-semibold text-xs text-slate-200">{category.name}</h3>
        </div>
        <span className="text-[11px] bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded-full text-slate-400 font-mono">
          {clips.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {clips.length === 0 ? (
          <div className="h-32 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
            Drag clip cards here
          </div>
        ) : (
          clips.map((clip) => (
            <ClipCard key={clip.uuid} clip={clip} onPin={onPin} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
};
