import React, { useState, useEffect } from 'react';
import {
  Shield,
  Zap,
  Code,
  Download,
  ExternalLink,
  ChevronDown,
  Lock,
  Layers,
  Sparkles,
  Maximize2,
  Palette,
  ArrowRight,
  Monitor,
} from 'lucide-react';
import logoImg from '../assets/logo.png';

interface LandingPageProps {
  onOpenDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenDashboard }) => {
  const [scrollY, setScrollY] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      // Scroll step calculation for sticky feature showcase
      if (currentScroll < 600) setActiveStep(0);
      else if (currentScroll < 1200) setActiveStep(1);
      else if (currentScroll < 1800) setActiveStep(2);
      else setActiveStep(3);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const downloadExeUrl = 'https://github.com/santjsx/clipshelf/releases/download/v0.1.0/ClipShelf-0.1.0-Setup.exe';
  const downloadMsiUrl = 'https://github.com/santjsx/clipshelf/releases/download/v0.1.0/ClipShelf-0.1.0-Setup.msi';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Dynamic Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-[140px] rounded-full transition-transform duration-700 ease-out"
          style={{ transform: `translate(-50%, ${scrollY * 0.15}px)` }}
        />
        <div
          className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-purple-600/10 blur-[160px] rounded-full"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Sticky Header Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07090e]/80 border-b border-slate-800/80 px-6 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenDashboard}>
            <img src={logoImg} alt="ClipShelf Logo" className="w-8 h-8 object-contain drop-shadow-md" />
            <span className="font-mono font-bold text-base tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              CLIPSHELF
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              v0.1.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDashboard}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition flex items-center gap-2"
            >
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              Open Dashboard
            </button>
            <a
              href={downloadExeUrl}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Download .EXE
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-16 pb-24">
        {/* Floating Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local-First Knowledge Vault for Windows 10 / 11</span>
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
          Your Clipboard, Elevated into a{' '}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            Visual Knowledge Vault.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-slate-400 text-base sm:text-lg leading-relaxed mb-10 font-normal">
          ClipShelf automatically captures your text, code snippets, visual screenshots, and colors into a zero-whitespace Bento Grid with full-text search and 100% offline privacy.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <a
            href={downloadExeUrl}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5"
          >
            <Download className="w-4 h-4" />
            Download for Windows (.exe)
          </a>
          <button
            onClick={onOpenDashboard}
            className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700/80 transition-all flex items-center gap-2"
          >
            Launch Interactive App
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </button>
        </div>

        {/* Floating Mockup Preview with Parallax */}
        <div
          className="relative max-w-5xl w-full rounded-2xl p-2 bg-gradient-to-b from-slate-700/50 to-slate-900/80 border border-slate-700/70 shadow-2xl transition-transform duration-300"
          style={{ transform: `perspective(1000px) rotateX(${Math.max(0, 10 - scrollY * 0.03)}deg)` }}
        >
          <div className="bg-[#0b0f19] rounded-xl p-6 border border-slate-800 space-y-4">
            {/* Window Header Dots */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">ClipShelf — Dashboard Preview</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                100% Offline Mode
              </span>
            </div>

            {/* Bento Grid Mock Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Card 1: Code */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Code className="w-3.5 h-3.5" /> CODE
                  </span>
                  <span>VS Code</span>
                </div>
                <pre className="text-[11px] font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 line-clamp-3">
                  {`const vault = await ClipShelf.init({\n  storage: 'sqlite_local',\n  privacy: 'offline_shield'\n});`}
                </pre>
              </div>

              {/* Card 2: Image OCR */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                    <Layers className="w-3.5 h-3.5" /> IMAGE
                  </span>
                  <span>Win + Shift + S</span>
                </div>
                <div className="h-16 rounded-lg bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-cyan-900/40 border border-slate-800 flex items-center justify-center text-xs text-slate-300 font-medium">
                  📸 Screenshot Captured
                </div>
              </div>

              {/* Card 3: Color Palette */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Palette className="w-3.5 h-3.5" /> COLOR
                  </span>
                  <span>Sampler</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="w-7 h-7 rounded-lg bg-cyan-400 shadow-md" />
                  <span className="text-xs font-mono font-bold text-slate-200">#06B6D4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ChevronDown className="w-6 h-6 text-slate-500 mt-12 animate-bounce" />
      </section>

      {/* SECTION 2: SCROLL-DRIVEN STICKY STORYTELLING */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Engineered for Precision & Velocity
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Scroll to experience how ClipShelf transforms fragmented clipboard copies into structured intelligence.
          </p>
        </div>

        {/* Interactive Sticky Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Story Navigation Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onClick={() => setActiveStep(0)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeStep === 0
                  ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">1. Bento Grid Architecture</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero-whitespace masonry layout that automatically categorizes Text, Links, Code, Colors, and Screenshots with 24px breathing room.
              </p>
            </div>

            <div
              onClick={() => setActiveStep(1)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeStep === 1
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">2. Full-Text Lightbox</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Expand long text blocks instantly with character analytics, monospace code toggle, and one-click `.txt` file export.
              </p>
            </div>

            <div
              onClick={() => setActiveStep(2)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeStep === 2
                  ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">3. Offline Privacy Shield</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Auto-detects and blocks password managers (*Bitwarden, 1Password, KeePass*) & secret API keys offline on your local device.
              </p>
            </div>

            <div
              onClick={() => setActiveStep(3)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeStep === 3
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">4. Native Rust Performance</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sub-15ms Win32 event loop with SQLite indexing, background hotkeys (`Ctrl+Shift+V`), and zero telemetry footprint.
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Interactive Display */}
          <div className="lg:col-span-7 sticky top-24 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 min-h-[420px] flex flex-col justify-between shadow-2xl">
            {activeStep === 0 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-blue-400">FEATURE 01 // MASONRY BENTO GRID</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">24px Gap</span>
                </div>
                <p className="text-sm text-slate-300 font-medium">
                  Content-adaptive cards scale dynamically based on text volume, screenshot aspect ratio, and color hex values.
                </p>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Card Format: Adaptive</span>
                    <span className="text-emerald-400">✓ 3-4 Line Visible Preview</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-blue-300">
                    "ClipShelf delivers zero-whitespace masonry cards with crisp typography..."
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-cyan-400">FEATURE 02 // FULL-TEXT LIGHTBOX</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">TextModal</span>
                </div>
                <p className="text-sm text-slate-300 font-medium">
                  Click any card to expand into a full-screen reader with character/word analytics, font toggles, and instant text export.
                </p>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Text Analytics</span>
                    <span className="text-cyan-400">218 chars • 42 words • 6 lines</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/40 text-[11px]">
                      Copy Full Text
                    </span>
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px]">
                      Download .txt
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-purple-400">FEATURE 03 // OFFLINE PRIVACY SHIELD</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">100% Local</span>
                </div>
                <p className="text-sm text-slate-300 font-medium">
                  Zero cloud uploads. Password manager process memory (*Bitwarden, 1Password*) and API secrets are filtered at kernel level.
                </p>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Lock className="w-4 h-4" />
                    <span>Secret Filter Active (AWS / GitHub Tokens / API Keys)</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                    Process Denylist: Bitwarden.exe, 1Password.exe, KeePass.exe
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-emerald-400">FEATURE 04 // TAURI V2 + RUST ENGINE</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">Win32 API</span>
                </div>
                <p className="text-sm text-slate-300 font-medium">
                  Built natively on Rust winapi crate for instant clipboard polling without background CPU strain.
                </p>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Capture Speed:</span>
                    <span className="text-emerald-400 font-bold">&lt; 15ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>RAM Footprint:</span>
                    <span className="text-cyan-400 font-bold">~ 28 MB</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Control inside Card */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Step {activeStep + 1} of 4</span>
              <button
                onClick={onOpenDashboard}
                className="text-blue-400 hover:underline flex items-center gap-1 font-sans font-medium"
              >
                Try in Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL METRICS & INTEGRITY */}
      <section className="relative z-10 bg-slate-900/60 border-y border-slate-800 py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <h4 className="text-3xl font-extrabold font-mono text-blue-400">&lt; 15ms</h4>
            <p className="text-xs text-slate-400 font-medium">Clipboard Event Latency</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-extrabold font-mono text-cyan-400">100%</h4>
            <p className="text-xs text-slate-400 font-medium">Local SQLite Storage</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-extrabold font-mono text-purple-400">0%</h4>
            <p className="text-xs text-slate-400 font-medium">Cloud Telemetry / Tracking</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-extrabold font-mono text-emerald-400">v0.1.0</h4>
            <p className="text-xs text-slate-400 font-medium">Stable Windows Release</p>
          </div>
        </div>
      </section>

      {/* DOWNLOAD & INSTALLATION SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
          Ready to Upgrade Your Clipboard?
        </h2>
        <p className="text-slate-400 text-base max-w-xl mx-auto mb-12">
          Download ClipShelf v0.1.0 for Windows 10 & 11. Certified offline installers packaged with custom WebView2 runtime resources.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left mb-12">
          {/* EXE Setup */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition flex flex-col justify-between space-y-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs font-bold">
                  .EXE INSTALLER
                </span>
                <span className="text-[10px] font-mono text-slate-500">7.18 MB</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">ClipShelf-0.1.0-Setup.exe</h3>
              <p className="text-xs text-slate-400 mt-1">Recommended for desktop Windows installations.</p>
            </div>
            <a
              href={downloadExeUrl}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Download className="w-4 h-4" />
              Download .EXE Setup
            </a>
          </div>

          {/* MSI Package */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition flex flex-col justify-between space-y-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
                  .MSI PACKAGE
                </span>
                <span className="text-[10px] font-mono text-slate-500">9.82 MB</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">ClipShelf-0.1.0-Setup.msi</h3>
              <p className="text-xs text-slate-400 mt-1">Recommended for enterprise deployment & MSI automation.</p>
            </div>
            <a
              href={downloadMsiUrl}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Download className="w-4 h-4" />
              Download .MSI Package
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 px-6 py-8 bg-[#07090e]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="ClipShelf Logo" className="w-5 h-5 opacity-70" />
            <span className="font-mono text-slate-400">ClipShelf © 2026</span>
            <span>•</span>
            <span>Local-First Clipboard Vault</span>
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
