import React, { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ShelfWindow } from './windows/Shelf';
import { QuickPasteWindow } from './windows/QuickPaste';
import { DashboardWindow } from './windows/Dashboard';
import { SettingsWindow } from './windows/Settings';
import { LandingPage } from './windows/LandingPage';
import { ToastProvider } from './components/Toast';

export const App: React.FC = () => {
  const [windowLabel, setWindowLabel] = useState<string>('dashboard');
  const [currentView, setCurrentView] = useState<'dashboard' | 'landing'>('dashboard');

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'landing') {
        setCurrentView('landing');
      } else if (urlParams.get('view') === 'dashboard') {
        setCurrentView('dashboard');
      } else {
        // If running in browser / GitHub Pages, default to landing page
        const isTauri = !!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__;
        if (!isTauri) {
          setCurrentView('landing');
        }
      }

      const appWindow = getCurrentWindow();
      if (appWindow && appWindow.label) {
        setWindowLabel(appWindow.label);
      }
    } catch {
      // Non-Tauri web browser fallback
      setWindowLabel('dashboard');
      const isTauri = !!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__;
      if (!isTauri) {
        setCurrentView('landing');
      }
    }
  }, []);

  const renderWindow = () => {
    switch (windowLabel) {
      case 'shelf':
        return <ShelfWindow />;
      case 'quick-paste':
        return <QuickPasteWindow />;
      case 'settings':
        return <SettingsWindow />;
      case 'landing':
        return <LandingPage onOpenDashboard={() => setCurrentView('dashboard')} />;
      case 'dashboard':
      default:
        if (currentView === 'landing') {
          return <LandingPage onOpenDashboard={() => setCurrentView('dashboard')} />;
        }
        return <DashboardWindow onOpenLanding={() => setCurrentView('landing')} />;
    }
  };

  return <ToastProvider>{renderWindow()}</ToastProvider>;
};

export default App;
