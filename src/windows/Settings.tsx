import React, { useState } from 'react';
import { Shield, Keyboard, Sliders, Info } from 'lucide-react';

export const SettingsWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'hotkeys' | 'privacy' | 'about'>('general');

  return (
    <div className="w-full h-screen bg-slate-900 text-slate-100 flex overflow-hidden select-none">
      {/* Settings Navigation Sidebar */}
      <aside className="w-52 border-r border-slate-800 bg-slate-950/40 p-3 space-y-1">
        <div className="px-3 py-2 font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2">
          Settings
        </div>
        <button
          onClick={() => setActiveTab('general')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'general' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          General
        </button>
        <button
          onClick={() => setActiveTab('hotkeys')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'hotkeys' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          Hotkeys
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'privacy' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-4 h-4" />
          Privacy & Security
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'about' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50'
          }`}
        >
          <Info className="w-4 h-4" />
          About ClipShelf
        </button>
      </aside>

      {/* Main Settings Panel */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-xl">
            <h2 className="text-base font-semibold text-slate-100">General Preferences</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-200">Start on Windows Login</div>
                  <div className="text-[11px] text-slate-400">Launch ClipShelf automatically when you log in</div>
                </div>
                <input type="checkbox" defaultChecked className="accent-blue-600 rounded" />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-200">History Retention</div>
                  <div className="text-[11px] text-slate-400">Automatically delete unpinned clips older than N days</div>
                </div>
                <select className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200">
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6 max-w-xl">
            <h2 className="text-base font-semibold text-slate-100">Privacy & Sensitive Filtering</h2>
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300">
              ClipShelf operates 100% offline. No clipboard contents, text, or screenshots are ever transmitted to any server.
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-medium text-slate-300">Blocked Password Managers</h3>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs text-slate-400 space-y-1">
                <div>• bitwarden.exe</div>
                <div>• 1password.exe</div>
                <div>• keepass.exe</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hotkeys' && (
          <div className="space-y-6 max-w-xl">
            <h2 className="text-base font-semibold text-slate-100">Global Keyboard Shortcuts</h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <span className="text-slate-300">Toggle Quick Paste Palette</span>
                <kbd className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono">Ctrl+Shift+V</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <span className="text-slate-300">Keystroke Retrieval (Last 10 Clips)</span>
                <kbd className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono">Ctrl+Alt+0 ... 9</kbd>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4 max-w-xl text-xs text-slate-400">
            <h2 className="text-base font-semibold text-slate-100">About ClipShelf</h2>
            <p>ClipShelf v0.1.0 — Local-First Visual Clipboard Manager for Windows.</p>
            <p>Built with Tauri v2, Rust, React, and SQLite (FTS5).</p>
          </div>
        )}
      </main>
    </div>
  );
};
