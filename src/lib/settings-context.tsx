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

export const DEFAULT_SETTINGS: WebsiteSettings = {
  school_name: 'SD NEGERI 53 KOTA BENGKULU',
  npsn: '10702672',
  akreditasi: 'A',
  tagline: 'Cerdas, Berkarakter, dan Berprestasi',
  address: 'Jl. Melur No. 23, Kel. Nusa Indah, Kec. Ratu Agung, Kota Bengkulu, Bengkulu 38224',
  phone: '(0736) 22453',
  email: 'info@sdn53bengkulu.sch.id',
  kepala_sekolah_nama: 'Dra. Hj. Nurhasanah, M.Pd.',
  kepala_sekolah_nip: '19680512 199303 2 004',
  hero_title: 'Membangun Karakter & Mengukir Prestasi Gemilang',
  hero_subtitle: 'Selamat Datang di SD Negeri 53 Kota Bengkulu. Lembaga pendidikan ramah anak yang membentuk generasi religius, cerdas, berintegritas, dan berwawasan lingkungan hidup.',
  hero_button_text: 'Jelajahi Profil Sekolah',
  hero_button_link: '/profil',
  hero_image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop&q=80',
  primary_color: '#0284c7',
  secondary_color: '#0d9488',
} as unknown as WebsiteSettings;

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
        applyThemeSettings({ ...DEFAULT_SETTINGS, ...data });
      }
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
