<div align="center">

# ClipShelf

**A fast, local-first visual clipboard history manager for Windows.**

![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-blue?style=flat-square)
![Tauri](https://img.shields.io/badge/Tauri-v2.0-24c8db?style=flat-square&logo=tauri)
![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)
![Rust](https://img.shields.io/badge/Rust-1.80+-000000?style=flat-square&logo=rust)
![License](https://img.shields.io/badge/license-MIT-emerald?style=flat-square)

</div>

---

## ⚡ Overview

**ClipShelf** is an open-source Windows desktop application designed to supercharge your clipboard workflow. Powered by Rust and Tauri v2, ClipShelf quietly monitors your clipboard in the background, automatically capturing text, code snippets, web links, color codes, screenshots, and browser images—all stored locally in a high-performance SQLite database.

---

## ✨ Key Features

- **🍱 Content-Adaptive Bento Grid**: Visual masonry layout that dynamically adjusts card sizes based on content type—zero wasted vertical whitespace.
- **🖼️ Multi-Format Image Capture**: Automatic capture for screenshots (`Win + Shift + S`) and browser copied images (`PNG`, `image/png`, `CF_DIB` bitmaps) rendered natively via Base64 Data URLs.
- **🔒 Local Privacy Shield**: Automated detection filter that blocks clips from password managers (*Bitwarden, 1Password, KeePass*) and strips API keys or credit card patterns.
- **🎨 Cursor Color Sampler**: Built-in Win32 color picker tool to sample pixel hex codes anywhere on your screen.
- **🔍 FTS5 Full-Text Search**: Search text, links, code, and image OCR text with instant debounced filtering.
- **🔎 Lightbox Image Preview**: Click any captured screenshot or image thumbnail to open a high-res full-screen lightbox modal with quick copy and download controls.
- **⌨️ Keyboard Shortcuts**: Built-in shortcut handlers for fast search focus (`/` or `Ctrl + F`) and quick dismiss (`Esc`).

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Tauri v2](https://tauri.app/) (Desktop Runtime) |
| **Frontend** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/) |
| **Backend Core** | [Rust](https://www.rust-lang.org/), `windows-sys` Win32 API |
| **Database** | [SQLite](https://sqlite.org/) with FTS5 (Full-Text Search) via `rusqlite` |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Rust Toolchain](https://www.rust-lang.org/tools/install)
- Windows 10 or 11

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/santjsx/clipshelf.git
   cd clipshelf
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Run in development mode**:
   ```bash
   npm run tauri dev
   ```

4. **Build production executable**:
   ```bash
   npm run tauri build
   ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `/` or `Ctrl + F` | Focus global search bar |
| `Esc` | Clear search filter or close open modal |
| `Win + Shift + S` | Windows screenshot capture |

---

## 🔒 Security & Privacy

ClipShelf operates **100% offline and locally**. No clipboard content, text, or captured images are ever transmitted to external servers. Your clipboard data remains safely on your machine in `%LOCALAPPDATA%\ClipShelf\`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
