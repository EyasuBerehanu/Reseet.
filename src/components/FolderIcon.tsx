import React from 'react';
import Rectangle8 from '../imports/Rectangle8';
import Rectangle9 from '../imports/Rectangle9';
import Rectangle10 from '../imports/Rectangle10';

interface FolderIconProps {
  color: string;
  size?: number;
  label: string;
  isActive?: boolean;
  count?: number;
}

export function FolderIcon({ color, size = 120, label, isActive = false, count = 0 }: FolderIconProps) {
  return (
    <div 
      className="relative transition-all" 
      style={{ 
        width: size, 
        height: size,
      }}
      aria-label={`${label} category`}
    >
      {/* Bin container (colored box) - furthest back */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '34%',
          opacity: isActive ? 0.8 : 1,
          zIndex: 1,
        }}
      >
        <div style={{ '--fill-0': color, '--stroke-0': 'black' } as React.CSSProperties}>
          <Rectangle8 />
        </div>
      </div>

      {/* File papers */}
      <div 
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: '44%',
          height: '75%',
          top: '2%',
        }}
      >
        {/* Back file - middle layer */}
        <div className="absolute inset-0" style={{ transform: 'translateX(-12%) translateY(3%)', zIndex: 2 }}>
          <Rectangle9 receiptCount={count} />
        </div>
        
        {/* Front file - on top */}
        <div className="absolute inset-0" style={{ transform: 'translateX(12%) translateY(-3%)', zIndex: 3 }}>
          <Rectangle10 receiptCount={count} />
        </div>
      </div>
    </div>
  );
}
