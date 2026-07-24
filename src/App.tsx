import React, { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ShelfWindow } from './windows/Shelf';
import { QuickPasteWindow } from './windows/QuickPaste';
import { DashboardWindow } from './windows/Dashboard';
import { SettingsWindow } from './windows/Settings';
import { ToastProvider } from './components/Toast';

export const App: React.FC = () => {
  const [windowLabel, setWindowLabel] = useState<string>('dashboard');

  useEffect(() => {
    try {
      const appWindow = getCurrentWindow();
      if (appWindow && appWindow.label) {
        setWindowLabel(appWindow.label);
      }
    } catch {
      // Fallback for non-Tauri browser preview
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
      case 'dashboard':
      default:
        return <DashboardWindow />;
    }
  };

  return <ToastProvider>{renderWindow()}</ToastProvider>;
};

export default App;
