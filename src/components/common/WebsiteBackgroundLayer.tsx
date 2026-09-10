import React from 'react';
import { WebsiteSettings } from '../../types';
import { getBackgroundPatternStyle } from '../../lib/background-utils';

interface WebsiteBackgroundLayerProps {
  settings: WebsiteSettings | null;
}

export const WebsiteBackgroundLayer: React.FC<WebsiteBackgroundLayerProps> = ({ settings }) => {
  if (!settings) return null;

  const {
    background_type = 'none',
    background_value = '#f8fafc',
    background_opacity = 100,
    background_pattern = 'grid',
    background_repeat = 'cover',
    background_attachment = 'fixed',
    background_overlay_color = '#ffffff',
    background_blur = 0,
  } = settings;

  if (background_type === 'none') {
    return null;
  }

  if (background_type === 'color') {
    return (
      <div
        id="website-custom-bg-color"
        className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-300"
        style={{ backgroundColor: background_value || '#f8fafc' }}
      />
    );
  }

  if (background_type === 'gradient') {
    return (
      <div
        id="website-custom-bg-gradient"
        className="fixed inset-0 pointer-events-none -z-10 transition-all duration-300"
        style={{
          backgroundImage: background_value,
          backgroundAttachment: background_attachment,
        }}
      />
    );
  }

  if (background_type === 'pattern') {
    const patternStyle = getBackgroundPatternStyle(background_pattern || background_value);
    const opacityVal = Math.max(0.05, Math.min(1, (background_opacity ?? 100) / 100));

    return (
      <div
        id="website-custom-bg-pattern"
        className="fixed inset-0 pointer-events-none -z-10 bg-slate-50 transition-opacity duration-300"
        style={{
          ...patternStyle,
          opacity: opacityVal,
        }}
      />
    );
  }

  if (background_type === 'image' && background_value) {
    const opacityVal = Math.max(0.05, Math.min(1, (background_opacity ?? 100) / 100));
    const blurVal = background_blur || 0;

    return (
      <div id="website-custom-bg-image-wrapper" className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Base Image with Opacity & Blur */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            backgroundImage: `url("${background_value}")`,
            backgroundSize: background_repeat === 'repeat' ? 'auto' : background_repeat,
            backgroundRepeat: background_repeat === 'repeat' ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center top',
            backgroundAttachment: background_attachment,
            opacity: opacityVal,
            filter: blurVal > 0 ? `blur(${blurVal}px)` : undefined,
            transform: blurVal > 0 ? 'scale(1.03)' : undefined, // prevents edge blur clipping
          }}
        />

        {/* Readability Contrast Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: background_overlay_color || '#ffffff',
            opacity: Math.max(0, 1 - opacityVal * 0.75), // subtle stabilizing contrast
          }}
        />
      </div>
    );
  }

  return null;
};
