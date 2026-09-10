import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings } from '../types';
import { api } from './api';

interface SettingsContextType {
  settings: WebsiteSettings | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<WebsiteSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      applyThemeSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeSettings = (data: WebsiteSettings) => {
    // Dynamic Primary & Secondary Colors
    document.documentElement.style.setProperty('--color-primary', data.primary_color || '#0284c7');
    document.documentElement.style.setProperty('--color-secondary', data.secondary_color || '#0d9488');
    
    // Title
    if (data.school_name) {
      document.title = `${data.school_name} - Portal Resmi Sekolah`;
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<WebsiteSettings>) => {
    const res = await api.updateSettings(newSettings);
    setSettings(res.settings);
    applyThemeSettings(res.settings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
