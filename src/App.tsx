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
      const appWindow = getCurrentWindow();
      if (appWindow && appWindow.label) {
        setWindowLabel(appWindow.label);
      }
    } catch {
      setWindowLabel('dashboard');
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
