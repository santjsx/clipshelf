import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export interface Clip {
  id: number;
  uuid: string;
  content_type: string;
  text_content: string | null;
  asset_path: string | null;
  ocr_text: string | null;
  source_app_name: string | null;
  source_app_display: string | null;
  is_pinned: boolean;
  is_bulk_bundle: boolean;
  created_at: number;
  last_used_at: number | null;
  category_ids?: number[];
}

export interface Category {
  id: number;
  name: string;
  color: string | null;
  sort_order: number;
  created_at: number;
}

export const useClips = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'board'>('card');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClips = useCallback(async () => {
    try {
      if (searchQuery.trim()) {
        const results = await invoke<Clip[]>('search_clips', { query: searchQuery });
        setClips(results);
      } else {
        const results = await invoke<Clip[]>('get_clips', {
          limit: 100,
          offset: 0,
          filter: activeCategory === 'all' ? null : activeCategory,
        });
        setClips(results);
      }
    } catch (e) {
      console.log('Fetching clips fallback:', e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await invoke<Category[]>('get_categories');
      setCategories(cats);
    } catch (e) {
      console.log('Fetching categories fallback:', e);
    }
  }, []);

  useEffect(() => {
    fetchClips();
    fetchCategories();

    let unlisten: (() => void) | undefined;
    const setupListener = async () => {
      try {
        unlisten = await listen<Clip>('clip-captured', (event) => {
          setClips((prev) => [event.payload, ...prev.filter((c) => c.uuid !== event.payload.uuid)]);
        });
      } catch (e) {
        console.log('Tauri event listener preview fallback:', e);
      }
    };
    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, [fetchClips, fetchCategories]);

  const togglePin = async (id: number, currentPinned: boolean) => {
    try {
      await invoke('pin_clip', { id, isPinned: !currentPinned });
      setClips((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_pinned: !currentPinned } : c))
      );
    } catch (e) {
      console.log('Pin clip error:', e);
    }
  };

  const deleteClip = async (id: number) => {
    try {
      await invoke('delete_clip', { id });
      setClips((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.log('Delete clip error:', e);
    }
  };

  const clearAllClips = async () => {
    try {
      await invoke('clear_all_clips');
      setClips((prev) => prev.filter((c) => c.is_pinned));
    } catch (e) {
      console.log('Clear all clips error:', e);
      setClips((prev) => prev.filter((c) => c.is_pinned));
    }
  };

  const addCategory = async (name: string, color: string) => {
    try {
      const newCat = await invoke<Category>('create_category', { name, color });
      setCategories((prev) => [...prev, newCat]);
    } catch (e) {
      console.log('Create category error:', e);
    }
  };

  const assignClipToCategory = async (clipId: number, categoryId: number) => {
    try {
      await invoke('assign_category', { clipId, categoryId });
      setClips((prev) =>
        prev.map((c) => {
          if (c.id === clipId) {
            const currentCatIds = c.category_ids || [];
            return {
              ...c,
              category_ids: Array.from(new Set([...currentCatIds, categoryId])),
            };
          }
          return c;
        })
      );
    } catch (e) {
      console.log('Assign category error:', e);
    }
  };

  return {
    clips,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    loading,
    togglePin,
    deleteClip,
    clearAllClips,
    addCategory,
    assignClipToCategory,
    refresh: fetchClips,
  };
};
