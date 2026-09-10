import React from 'react';
import { WebsiteSettings } from '../types';

export interface BackgroundPresetColor {
  name: string;
  value: string;
  description: string;
}

export interface BackgroundPresetGradient {
  id: string;
  name: string;
  value: string;
  description: string;
}

export interface BackgroundPresetPattern {
  id: string;
  name: string;
  css: string;
  description: string;
}

export const PRESET_COLORS: BackgroundPresetColor[] = [
  { name: 'Putih Bersih', value: '#ffffff', description: 'Kesan terang dan minimalis' },
  { name: 'Slate Lembut (Default)', value: '#f8fafc', description: 'Nuansa standar modern yang sejuk di mata' },
  { name: 'Biru Langit Sejuk', value: '#f0f9ff', description: 'Warna ramah khas dunia pendidikan' },
  { name: 'Hijau Daun Segar', value: '#f0fdf4', description: 'Suasana asri Adiwiyata dan lingkungan' },
  { name: 'Linen Hangat', value: '#fffbeb', description: 'Sentuhan hangat dan bersahabat' },
  { name: 'Lavender Halus', value: '#faf5ff', description: 'Elegan dan berkarakter unik' },
  { name: 'Abu-Abu Dingin', value: '#f1f5f9', description: 'Modern dan profesional' },
];

export const PRESET_GRADIENTS: BackgroundPresetGradient[] = [
  {
    id: 'sky-serenity',
    name: 'Sky Serenity',
    value: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)',
    description: 'Gradien biru lembut bergradasi ke putih sejuk',
  },
  {
    id: 'mint-fresh',
    name: 'Mint Adiwiyata',
    value: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f8fafc 100%)',
    description: 'Gradien segar mencerminkan sekolah hijau & ramah anak',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Warmth',
    value: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fef2f2 100%)',
    description: 'Nuansa hangat penuh semangat dan keceriaan siswa',
  },
  {
    id: 'pearl-slate',
    name: 'Pearl Elegance',
    value: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    description: 'Gradien netral abu mutiara premium dan bersih',
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    value: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #f8fafc 100%)',
    description: 'Gradien ungu pastel yang lembut dan tenang',
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    value: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 50%, #f0fdfa 100%)',
    description: 'Nuansa pirus laut pesisir Bengkulu yang menyegarkan',
  },
];

export const PRESET_PATTERNS: BackgroundPresetPattern[] = [
  {
    id: 'grid',
    name: 'Subtle Grid',
    css: 'radial-gradient(#94a3b8 1px, transparent 1px)',
    description: 'Kisi-kisi modern minimalis khas teknologi pendidikan',
  },
  {
    id: 'dots',
    name: 'Polka Dots',
    css: 'radial-gradient(#64748b 1.2px, transparent 1.2px)',
    description: 'Titik-titik rapi elegan berjarak serasi',
  },
  {
    id: 'lines',
    name: 'Diagonal Stripes',
    css: 'repeating-linear-gradient(45deg, #e2e8f0 0, #e2e8f0 1px, transparent 0, transparent 20px)',
    description: 'Garis miring berulang bergaya akademis modern',
  },
  {
    id: 'mesh',
    name: 'Cross Hatch',
    css: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
    description: 'Anyaman garis kotak berpresisi tinggi',
  },
];

export function getBackgroundPatternStyle(patternId?: string): React.CSSProperties {
  switch (patternId) {
    case 'dots':
      return {
        backgroundImage: 'radial-gradient(#94a3b8 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      };
    case 'lines':
      return {
        backgroundImage: 'repeating-linear-gradient(45deg, #e2e8f0 0, #e2e8f0 1px, transparent 0, transparent 24px)',
      };
    case 'mesh':
      return {
        backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      };
    case 'grid':
    default:
      return {
        backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
  }
}

export function getWebsiteBackgroundStyle(settings: WebsiteSettings | null): React.CSSProperties {
  if (!settings) {
    return { backgroundColor: '#f8fafc' };
  }

  const {
    background_type = 'none',
    background_value = '#f8fafc',
    background_opacity = 100,
    background_pattern = 'grid',
    background_repeat = 'cover',
    background_attachment = 'scroll',
    background_blur = 0,
  } = settings;

  switch (background_type) {
    case 'color':
      return {
        backgroundColor: background_value || '#f8fafc',
      };

    case 'gradient':
      return {
        backgroundImage: background_value || PRESET_GRADIENTS[0].value,
        backgroundAttachment: background_attachment,
      };

    case 'pattern':
      return {
        backgroundColor: '#f8fafc',
        ...getBackgroundPatternStyle(background_pattern || background_value),
        opacity: Math.max(0.1, background_opacity / 100),
      };

    case 'image':
      if (background_value) {
        return {
          backgroundImage: `url("${background_value}")`,
          backgroundSize: background_repeat === 'repeat' ? 'auto' : background_repeat,
          backgroundRepeat: background_repeat === 'repeat' ? 'repeat' : 'no-repeat',
          backgroundPosition: 'center top',
          backgroundAttachment: background_attachment,
        };
      }
      return { backgroundColor: '#f8fafc' };

    case 'none':
    default:
      return {
        backgroundColor: '#f8fafc',
      };
  }
}
