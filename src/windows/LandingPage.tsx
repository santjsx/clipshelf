import React, { useState, useEffect } from 'react';
import {
  Code,
  Download,
  ExternalLink,
  ChevronDown,
  Lock,
  Layers,
  Sparkles,
  Palette,
  ArrowRight,
  Monitor,
} from 'lucide-react';
import logoImg from '../assets/logo.png';

interface LandingPageProps {
  onOpenDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenDashboard }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (currentScroll / totalHeight) * 100 : 0;

      setScrollY(currentScroll);
      setScrollProgress(progress);

      // Chapter Scroll Thresholds
      if (currentScroll < 700) setActiveChapter(0);
      else if (currentScroll < 1400) setActiveChapter(1);
      else if (currentScroll < 2100) setActiveChapter(2);
      else setActiveChapter(3);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const downloadExeUrl = 'https://github.com/santjsx/clipshelf/releases/download/v0.1.0/ClipShelf-0.1.0-Setup.exe';
  const downloadMsiUrl = 'https://github.com/santjsx/clipshelf/releases/download/v0.1.0/ClipShelf-0.1.0-Setup.msi';

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 font-sans selection:bg-amber-500/20 overflow-x-hidden relative">
      {/* Top Scroll Narrative Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-amber-400 via-sky-400 to-amber-300 z-50 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Rare Ambient Lighting - Obsidian & Champagne Amber Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,rgba(56,189,248,0.05)_40%,transparent_75%)] blur-[120px] transition-transform duration-700 ease-out"
          style={{ transform: `translate(-50%, ${scrollY * 0.12}px)` }}
        />
        <div
          className="absolute top-[35%] -right-[15%] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(226,184,87,0.06)_0%,transparent_70%)] blur-[140px]"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_10%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#07080c]/80 border-b border-white/[0.07] px-6 py-4 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onOpenDashboard}>
            <img src={logoImg} alt="ClipShelf Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-[0.2em] text-slate-100">CLIPSHELF</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                v0.1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDashboard}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/10 transition flex items-center gap-2"
            >
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              Open Dashboard
            </button>
            <a
              href={downloadExeUrl}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 shrink-0 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              Download .EXE
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pt-12 pb-20">
        {/* Rare Accent Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono tracking-wider mb-8 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>OFFLINE LOCAL KNOWLEDGE VAULT FOR WINDOWS</span>
        </div>

        {/* Hero Headline */}
        <h1 className="max-w-4xl text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.12] mb-6 text-slate-100">
          Transform Fragmented Copies into a{' '}
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-sky-300 bg-clip-text text-transparent">
            Visual Intelligence Engine.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-slate-400 text-base sm:text-lg leading-relaxed mb-10 font-normal">
          ClipShelf monitors your Windows clipboard offline, categorizing code, text, visual screenshots, and colors into a zero-whitespace Bento Vault.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <a
            href={downloadExeUrl}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-400/15 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5"
          >
            <Download className="w-4 h-4 text-slate-950" />
            Download for Windows (.exe)
          </a>
          <button
            onClick={onOpenDashboard}
            className="px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-white/10 transition-all flex items-center gap-2"
          >
            Explore Dashboard
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Cinematic Mockup Frame with Parallax Perspective */}
        <div
          className="relative max-w-5xl w-full rounded-2xl p-2.5 bg-slate-900/90 border border-white/10 shadow-2xl transition-transform duration-300"
          style={{ transform: `perspective(1200px) rotateX(${Math.max(0, 8 - scrollY * 0.02)}deg)` }}
        >
          <div className="bg-[#0b0d14] rounded-xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/70" />
                <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <span className="ml-2 text-xs font-mono text-slate-400">ClipShelf — Bento Grid Preview</span>
              </div>
              <span className="text-[11px] font-mono text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                100% Offline Mode
              </span>
            </div>

            {/* Mock Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                    <Code className="w-3.5 h-3.5" /> CODE
                  </span>
                  <span>VS Code</span>
                </div>
                <pre className="text-[11px] font-mono text-sky-300 bg-[#07080c] p-3 rounded-lg border border-white/5 line-clamp-3">
                  {`const vault = await ClipShelf.init({\n  storage: 'sqlite_local',\n  privacy: 'offline_shield'\n});`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Layers className="w-3.5 h-3.5" /> IMAGE
                  </span>
                  <span>Win + Shift + S</span>
                </div>
                <div className="h-16 rounded-lg bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-white/5 flex items-center justify-center text-xs text-slate-300 font-medium">
                  📸 Screenshot Captured
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Palette className="w-3.5 h-3.5" /> COLOR
                  </span>
                  <span>Sampler</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-[#07080c] rounded-lg border border-white/5">
                  <span className="w-7 h-7 rounded-lg bg-amber-400 shadow-md" />
                  <span className="text-xs font-mono font-bold text-slate-200">#E2B857</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ChevronDown className="w-6 h-6 text-slate-600 mt-12 animate-bounce" />
      </section>

      {/* SECTION 2: SCROLLYTELLING NARRATIVE CINEMA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-400 block mb-2">
            CHAPTER-BASED SCROLLING
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
            Architected for Pure Precision
          </h2>
        </div>

        {/* Split Screen Cinema Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Narrative Chapters */}
          <div className="lg:col-span-5 space-y-4">
            {/* Chapter 0 */}
            <div
              onClick={() => setActiveChapter(0)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeChapter === 0
                  ? 'bg-amber-400/[0.06] border-amber-400/40 shadow-xl shadow-amber-400/5 ring-1 ring-amber-400/20'
                  : 'bg-slate-900/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-amber-400 font-bold">01</span>
                <h3 className="text-base font-bold text-slate-100">Zero-Whitespace Bento Grid</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adaptive masonry grid with 24px breathing room. Cards scale dynamically with guaranteed 3-4 line visible text previews.
              </p>
            </div>

            {/* Chapter 1 */}
            <div
              onClick={() => setActiveChapter(1)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeChapter === 1
                  ? 'bg-sky-400/[0.06] border-sky-400/40 shadow-xl shadow-sky-400/5 ring-1 ring-sky-400/20'
                  : 'bg-slate-900/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-sky-400 font-bold">02</span>
                <h3 className="text-base font-bold text-slate-100">Full-Text Lightbox (TextModal)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any card to expand into a full-screen reader with character/word analytics, font toggles, and instant `.txt` file exports.
              </p>
            </div>

            {/* Chapter 2 */}
            <div
              onClick={() => setActiveChapter(2)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeChapter === 2
                  ? 'bg-purple-400/[0.06] border-purple-400/40 shadow-xl shadow-purple-400/5 ring-1 ring-purple-400/20'
                  : 'bg-slate-900/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-purple-400 font-bold">03</span>
                <h3 className="text-base font-bold text-slate-100">Kernel-Level Privacy Shield</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically detects and blocks password managers (*Bitwarden, 1Password*) & secret API keys offline on your device.
              </p>
            </div>

            {/* Chapter 3 */}
            <div
              onClick={() => setActiveChapter(3)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeChapter === 3
                  ? 'bg-emerald-400/[0.06] border-emerald-400/40 shadow-xl shadow-emerald-400/5 ring-1 ring-emerald-400/20'
                  : 'bg-slate-900/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-emerald-400 font-bold">04</span>
                <h3 className="text-base font-bold text-slate-100">Sub-15ms Rust Performance</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built on Rust winapi crate for instant clipboard polling without background CPU strain or telemetry tracking.
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Stage Showcase */}
          <div className="lg:col-span-7 sticky top-24 bg-[#0b0d14] border border-white/10 rounded-3xl p-6 min-h-[440px] flex flex-col justify-between shadow-2xl">
            {activeChapter === 0 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono font-bold text-amber-400">CHAPTER 01 // BENTO LAYOUT</span>
                  <span className="text-[10px] bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded text-slate-400 font-mono">
                    24px Grid Gap
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Content-adaptive cards scale smoothly without layout shifts, preserving exact line breaks and visual metrics.
                </p>
                <div className="p-4 bg-[#07080c] rounded-2xl border border-white/5 space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Format: Adaptive Bento</span>
                    <span className="text-amber-400">✓ 3-4 Line Preview</span>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-white/5 text-amber-200">
                    "ClipShelf automatically structures text snippets, code, images, and colors into a zero-whitespace Bento Grid."
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono font-bold text-sky-400">CHAPTER 02 // FULL-TEXT LIGHTBOX</span>
                  <span className="text-[10px] bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded text-slate-400 font-mono">
                    TextModal
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Expand long text payloads into a dedicated lightbox modal with full text analytics and monospace code toggle.
                </p>
                <div className="p-4 bg-[#07080c] rounded-2xl border border-white/5 space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Text Analytics</span>
                    <span className="text-sky-300">218 chars • 42 words • 6 lines</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-lg border border-sky-500/30 text-[11px]">
                      Copy Full Text
                    </span>
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px]">
                      Download .txt
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono font-bold text-purple-400">CHAPTER 03 // OFFLINE PRIVACY SHIELD</span>
                  <span className="text-[10px] bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded text-slate-400 font-mono">
                    100% Local
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Zero cloud telemetry. Password manager memory handles and API keys are filtered offline at kernel level.
                </p>
                <div className="p-4 bg-[#07080c] rounded-2xl border border-white/5 space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Lock className="w-4 h-4" />
                    <span>Secret Filter Active (AWS / GitHub Tokens / API Keys)</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/90 rounded-xl border border-white/5 text-[11px] text-slate-400">
                    Process Denylist: Bitwarden.exe, 1Password.exe, KeePass.exe
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono font-bold text-emerald-400">CHAPTER 04 // TAURI V2 + RUST CORE</span>
                  <span className="text-[10px] bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded text-slate-400 font-mono">
                    Win32 API
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sub-15ms clipboard event listener powered by Rust winapi crate for zero background CPU load.
                </p>
                <div className="p-4 bg-[#07080c] rounded-2xl border border-white/5 space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Capture Speed:</span>
                    <span className="text-emerald-400 font-bold">&lt; 15ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>RAM Footprint:</span>
                    <span className="text-amber-300 font-bold">~ 28 MB</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Chapter {activeChapter + 1} of 4</span>
              <button
                onClick={onOpenDashboard}
                className="text-amber-400 hover:underline flex items-center gap-1 font-sans font-medium"
              >
                Try in Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS SECTION */}
      <section className="relative z-10 bg-slate-900/40 border-y border-white/5 py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <h4 className="text-3xl font-extrabold font-mono text-amber-400">&lt; 15ms</h4>
            <p className="text-xs text-slate-400 font-medium">Event Latency</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-extrabold font-mono text-sky-400">100%</h4>
            <p className="text-xs text-slate-400 font-medium">Local SQLite Engine</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-extrabold font-mono text-purple-400">0%</h4>
            <p className="text-xs text-slate-400 font-medium">Telemetry Tracking</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-extrabold font-mono text-emerald-400">v0.1.0</h4>
            <p className="text-xs text-slate-400 font-medium">Stable Windows Build</p>
          </div>
        </div>
      </section>

      {/* DOWNLOAD SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
          Elevate Your Windows Workflow
        </h2>
        <p className="text-slate-400 text-base max-w-xl mx-auto mb-12">
          Download ClipShelf v0.1.0. Standalone offline installers bundled with WebView2 resources.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left mb-12">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-amber-400/50 transition flex flex-col justify-between space-y-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono text-xs font-bold">
                  .EXE INSTALLER
                </span>
                <span className="text-[10px] font-mono text-slate-500">7.18 MB</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">ClipShelf-0.1.0-Setup.exe</h3>
              <p className="text-xs text-slate-400 mt-1">Recommended for standard desktop Windows installations.</p>
            </div>
            <a
              href={downloadExeUrl}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10"
            >
              <Download className="w-4 h-4 text-slate-950" />
              Download .EXE Setup
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-emerald-400/50 transition flex flex-col justify-between space-y-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 font-mono text-xs font-bold">
                  .MSI PACKAGE
                </span>
                <span className="text-[10px] font-mono text-slate-500">9.82 MB</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">ClipShelf-0.1.0-Setup.msi</h3>
              <p className="text-xs text-slate-400 mt-1">Recommended for enterprise deployment & MSI automation.</p>
            </div>
            <a
              href={downloadMsiUrl}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/10"
            >
              <Download className="w-4 h-4 text-slate-950" />
              Download .MSI Package
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 bg-[#07080c]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="ClipShelf Logo" className="w-5 h-5 opacity-70" />
            <span className="font-mono text-slate-400">ClipShelf © 2026</span>
            <span>•</span>
            <span>Local-First Knowledge Vault</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenDashboard} className="hover:text-slate-300 transition">
              Dashboard App
            </button>
            <a
              href="https://github.com/santjsx/clipshelf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition flex items-center gap-1"
            >
              GitHub Repository
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
