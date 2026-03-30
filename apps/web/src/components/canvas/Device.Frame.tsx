import React from 'react';
import { Viewport } from '../../../modules/Core/types';

interface DeviceFrameProps {
  view: Viewport;
  zoom: number;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ view, zoom, children }) => {
  const dimensions = {
    desktop: { width: '100%', maxWidth: '900px', minWidth: '768px' },
    tablet: { width: '768px', maxWidth: '768px', minWidth: '768px' },
    mobile: { width: '375px', maxWidth: '375px', minWidth: '375px' },
  }[view];

  return (
    <div
      className="relative transition-all duration-300 ease-in-out bg-white shadow-lg"
      style={{
        width: dimensions.width,
        maxWidth: dimensions.maxWidth,
        minWidth: dimensions.minWidth,
        minHeight: view === 'mobile' ? '667px' : view === 'tablet' ? '1024px' : '600px',
        maxHeight: view === 'mobile' ? '667px' : view === 'tablet' ? '1024px' : 'none',
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center',
        borderRadius: view !== 'desktop' ? '12px' : '4px',
        border: view !== 'desktop' ? '8px solid #1f2937' : '1px solid #e5e7eb',
      }}
    >
      {/* Device frame details for mobile/tablet */}
      {view !== 'desktop' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full" />
      )}
      
      {view === 'mobile' && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-700 rounded-full" />
      )}

      {/* Content */}
      <div 
        className="h-full overflow-auto" 
        style={{ 
          borderRadius: view !== 'desktop' ? '8px' : '4px'
        }}
      >
        {children}
      </div>
    </div>
  );
};